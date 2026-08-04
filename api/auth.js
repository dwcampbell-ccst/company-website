const crypto = require("crypto");

const CALLBACK_URL = "https://www.consultcampbell.com/api/callback";

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  if (!clientId) {
    res.status(503).json({ error: "CMS authentication is not configured" });
    return;
  }

  if (req.query?.provider && req.query.provider !== "github") {
    res.status(400).json({ error: "Unsupported provider" });
    return;
  }

  const state = crypto.randomBytes(32).toString("base64url");
  const authorizationUrl = new URL("https://github.com/login/oauth/authorize");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", CALLBACK_URL);
  authorizationUrl.searchParams.set("scope", "repo");
  authorizationUrl.searchParams.set("state", state);

  res.setHeader("Cache-Control", "no-store");
  res.setHeader(
    "Set-Cookie",
    `decap_oauth_state=${state}; Path=/api/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );
  res.redirect(302, authorizationUrl.toString());
};
