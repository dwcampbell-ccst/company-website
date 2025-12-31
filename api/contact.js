const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");
const https = require("https");

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

function normalizeText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function getClientIp(req) {
  const forwarded = normalizeText(req.headers?.["x-forwarded-for"]);
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return normalizeText(req.socket?.remoteAddress || req.connection?.remoteAddress);
}

function normalizeOptionalText(value) {
  const normalized = normalizeText(value);
  return normalized ? normalized : null;
}

function normalizeTopics(topics) {
  if (Array.isArray(topics)) {
    const normalized = topics
      .map((topic) => normalizeText(topic))
      .filter(Boolean);
    return normalized.length ? normalized : ["General Inquiry"];
  }

  const single = normalizeText(topics);
  return single ? [single] : ["General Inquiry"];
}

function splitName(fullName) {
  const normalized = normalizeText(fullName);
  if (!normalized) return { firstName: "", lastName: "" };
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function hubspotRequest({ token, method, path, body }) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : "";
    const req = https.request(
      {
        hostname: "api.hubapi.com",
        path,
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        },
        timeout: 12_000,
      },
      (res) => {
        let raw = "";

        res.on("data", (chunk) => {
          raw += chunk.toString();
        });

        res.on("end", () => {
          let parsed = raw;
          try {
            parsed = raw ? JSON.parse(raw) : null;
          } catch (_) {
            // Keep raw response as fallback.
          }

          const ok = res.statusCode >= 200 && res.statusCode < 300;
          if (ok) {
            resolve({ ok: true, statusCode: res.statusCode, data: parsed });
            return;
          }

          resolve({
            ok: false,
            statusCode: res.statusCode,
            data: parsed,
          });
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("HubSpot request timed out"));
    });

    req.on("error", reject);

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function upsertHubSpotContact({ token, properties, fallbackProperties }) {
  const searchResponse = await hubspotRequest({
    token,
    method: "POST",
    path: "/crm/v3/objects/contacts/search",
    body: {
      filterGroups: [
        {
          filters: [{ propertyName: "email", operator: "EQ", value: properties.email }],
        },
      ],
      properties: ["email"],
      limit: 1,
    },
  });

  if (!searchResponse.ok) {
    const details = typeof searchResponse.data === "string" ? searchResponse.data : JSON.stringify(searchResponse.data);
    throw new Error(`HubSpot search failed (${searchResponse.statusCode}): ${details}`);
  }

  const existingId = searchResponse.data?.results?.[0]?.id;
  const isUpdate = Boolean(existingId);
  const method = isUpdate ? "PATCH" : "POST";
  const path = isUpdate ? `/crm/v3/objects/contacts/${existingId}` : "/crm/v3/objects/contacts";

  const attempt = async (attemptProperties) => {
    const response = await hubspotRequest({
      token,
      method,
      path,
      body: { properties: attemptProperties },
    });

    if (!response.ok) {
      const details = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
      const err = new Error(`HubSpot upsert failed (${response.statusCode}): ${details}`);
      err.statusCode = response.statusCode;
      throw err;
    }

    return { id: response.data?.id || existingId || null };
  };

  try {
    return await attempt(properties);
  } catch (err) {
    if (!fallbackProperties) throw err;
    const warning = err.message || "Custom properties failed";
    const fallbackResult = await attempt(fallbackProperties);
    return { ...fallbackResult, warning };
  }
}

function pickHubSpotProperty(candidateEnv, fallbacks = []) {
  const list = [normalizeText(candidateEnv), ...fallbacks].filter(Boolean);
  return list[0] || null;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const payload = req.body || {};
  const honeypotValue = normalizeText(
    payload.website || payload.company_website || payload.companyWebsite || payload.hp
  );
  if (honeypotValue) {
    res.status(400).json({ error: "Spam detected" });
    return;
  }

  const name = normalizeText(payload.name);
  const email = normalizeText(payload.email);
  const company = normalizeOptionalText(payload.company);
  const phone = normalizeOptionalText(payload.phone);
  const topics = normalizeTopics(payload.topics);
  const message = normalizeText(payload.message);
  const downloadPath = normalizeOptionalText(payload.downloadPath);
  const downloadFilename = normalizeOptionalText(payload.downloadFilename);

  if (!name || !email || !message) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const subject = normalizeOptionalText(payload.subject) || `Contact: ${topics.join(", ")}`;

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ error: "Supabase server configuration is missing" });
    return;
  }

  const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || "shuvomahamud@gmail.com";
  const fromAddress = process.env.SMTP_FROM || '"Website Contact" <no-reply@example.com>';

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const clientIp = getClientIp(req);
  if (clientIp) {
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count, error: rateLimitError } = await supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", clientIp)
      .gte("created_at", since);

    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
    } else if ((count || 0) >= RATE_LIMIT_MAX) {
      res.status(429).json({ error: "Rate limit exceeded" });
      return;
    }
  } else {
    console.warn("Contact submission missing client IP; skipping rate limit.");
  }

  // Store the message securely (service role bypasses RLS)
  const { data: inserted, error: insertError } = await supabase
    .from("contact_messages")
    .insert({
      name,
      email,
      company,
      phone,
      topics,
      subject,
      message,
      download_path: downloadPath,
      download_filename: downloadFilename,
      ip_address: clientIp || null,
    })
    .select("id")
    .single();

  if (insertError) {
    res.status(500).json({ error: "Could not store message" });
    return;
  }

  let emailSent = false;
  let emailError = "";
  let hubspotSynced = false;
  let hubspotError = "";

  const smtpHost = (process.env.SMTP_HOST || "").trim();
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = (process.env.SMTP_USER || "").trim();
  const smtpPassRaw = (process.env.SMTP_PASS || "").trim();
  const isGmail = smtpHost.endsWith("gmail.com") || smtpHost.endsWith("googlemail.com");
  const smtpPass = isGmail ? smtpPassRaw.replace(/\s+/g, "") : smtpPassRaw;

  const sendEmail = async () => {
    if (!smtpHost || !smtpUser || !smtpPass) {
      emailError = "SMTP not fully configured (host/user/pass)";
      console.warn(emailError);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const lines = [
      `From: ${name} <${email}>`,
      company ? `Company: ${company}` : null,
      phone ? `Phone: ${phone}` : null,
      topics?.length ? `Topics: ${topics.join(", ")}` : null,
      downloadFilename || downloadPath
        ? `Download: ${[downloadFilename, downloadPath].filter(Boolean).join(" ")}`
        : null,
      "",
      message,
    ].filter(Boolean);

    await transporter.sendMail({
      from: fromAddress,
      to: receiverEmail,
      replyTo: email,
      subject: subject || "New contact message",
      text: lines.join("\n"),
    });

    emailSent = true;
  };

  const syncHubSpot = async () => {
    const hubspotToken = (process.env.HUBSPOT_PRIVATE_APP_TOKEN || process.env.HUBSPOT_ACCESS_TOKEN || "").trim();
    if (!hubspotToken) {
      hubspotError = "HubSpot is not configured (missing HUBSPOT_PRIVATE_APP_TOKEN).";
      return;
    }

    const { firstName, lastName } = splitName(name);

    const baseProperties = {
      email,
      ...(firstName ? { firstname: firstName } : {}),
      ...(lastName ? { lastname: lastName } : {}),
      ...(company ? { company } : {}),
      ...(phone ? { phone } : {}),
    };

    const customProperties = {};
    const topicsString = topics.join(";");
    const topicsProperty = pickHubSpotProperty(process.env.HUBSPOT_CONTACT_TOPICS_PROPERTY, [
      "service_of_interest",
      "service_interest",
    ]);
    const messageProperty = pickHubSpotProperty(process.env.HUBSPOT_CONTACT_MESSAGE_PROPERTY, [
      "message_multi_line",
      "message",
    ]);
    const subjectProperty = pickHubSpotProperty(process.env.HUBSPOT_CONTACT_SUBJECT_PROPERTY);
    const downloadProperty = pickHubSpotProperty(process.env.HUBSPOT_CONTACT_DOWNLOAD_PROPERTY);

    if (topicsProperty) customProperties[topicsProperty] = topicsString;
    if (messageProperty) customProperties[messageProperty] = message;
    if (subjectProperty) customProperties[subjectProperty] = subject;
    if (downloadProperty && (downloadFilename || downloadPath)) {
      customProperties[downloadProperty] = [downloadFilename, downloadPath].filter(Boolean).join(" ");
    }

    const hasCustom = Object.keys(customProperties).length > 0;

    const result = await upsertHubSpotContact({
      token: hubspotToken,
      properties: hasCustom ? { ...baseProperties, ...customProperties } : baseProperties,
      fallbackProperties: hasCustom ? baseProperties : null,
    });

    hubspotSynced = true;
    if (result?.warning) {
      hubspotError = result.warning;
    }

    if (inserted?.id && result?.id) {
      await supabase
        .from("contact_messages")
        .update({
          hubspot_contact_id: result.id,
          hubspot_synced_at: new Date().toISOString(),
          hubspot_error: hubspotError || null,
        })
        .eq("id", inserted.id);
    }
  };

  const results = await Promise.allSettled([sendEmail(), syncHubSpot()]);

  const hubspotResult = results[1];
  if (hubspotResult.status === "rejected") {
    hubspotSynced = false;
    hubspotError = hubspotResult.reason?.message || "HubSpot sync failed";
    console.error("HubSpot sync error:", hubspotResult.reason);
    if (inserted?.id) {
      await supabase.from("contact_messages").update({ hubspot_error: hubspotError }).eq("id", inserted.id);
    }
  }

  const emailResult = results[0];
  if (emailResult.status === "rejected") {
    emailSent = false;
    emailError = emailResult.reason?.message || "Email send failed";
    console.error("Email send error:", emailResult.reason);
  }

  res.status(200).json({ ok: true, emailSent, emailError, hubspotSynced, hubspotError });
};
