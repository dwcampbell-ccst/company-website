const { createClient } = require("@supabase/supabase-js");

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

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

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ error: "Supabase server configuration is missing" });
    return;
  }

  const clientIp = getClientIp(req);
  if (!clientIp) {
    res.status(400).json({ error: "Client IP missing" });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { count, error: rateLimitError } = await supabase
    .from("intro_call_requests")
    .select("id", { count: "exact", head: true })
    .eq("ip_address", clientIp)
    .gte("created_at", since);

  if (rateLimitError) {
    console.error("Intro call rate limit check failed:", rateLimitError);
    res.status(500).json({ error: "Rate limit check failed" });
    return;
  }

  if ((count || 0) >= RATE_LIMIT_MAX) {
    res.status(429).json({ error: "Rate limit exceeded" });
    return;
  }

  const userAgent = normalizeText(req.headers?.["user-agent"]).slice(0, 512);
  const { error: insertError } = await supabase.from("intro_call_requests").insert({
    ip_address: clientIp,
    user_agent: userAgent || null,
  });

  if (insertError) {
    console.error("Intro call request log failed:", insertError);
    res.status(500).json({ error: "Could not log request" });
    return;
  }

  res.status(200).json({ ok: true });
};
