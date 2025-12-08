const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ error: "Supabase server configuration is missing" });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Store the message securely (service role bypasses RLS)
  const { error: insertError } = await supabase.from("contact_messages").insert({
    name,
    email,
    subject,
    message,
  });

  if (insertError) {
    res.status(500).json({ error: "Could not store message" });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.CONTACT_RECEIVER_EMAIL,
      subject: subject || "New contact message",
      text: `From: ${name} <${email}>\n\n${message}`,
    });
  } catch (err) {
    res.status(500).json({ error: "Could not send email" });
    return;
  }

  res.status(200).json({ ok: true });
};
