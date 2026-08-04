const crypto = require("crypto");

const ADMIN_ORIGIN = "https://www.consultcampbell.com";

function readCookie(req, name) {
  const header = req.headers?.cookie || "";
  for (const item of header.split(";")) {
    const [key, ...parts] = item.trim().split("=");
    if (key === name) return parts.join("=");
  }
  return "";
}

function equalState(expected, actual) {
  if (!expected || !actual) return false;
  const left = Buffer.from(expected);
  const right = Buffer.from(actual);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function callbackPage({ payload, error }) {
  const result = error
    ? `authorization:github:error:${JSON.stringify({ message: error })}`
    : `authorization:github:success:${JSON.stringify(payload)}`;
  const safeResult = JSON.stringify(result).replace(/</g, "\\u003c");
  const safeOrigin = JSON.stringify(ADMIN_ORIGIN);
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="robots" content="noindex"><title>CMS authorization</title></head>
  <body>
    <p>Completing authorization…</p>
    <script>
      (function () {
        var origin = ${safeOrigin};
        var result = ${safeResult};
        if (!window.opener) {
          document.body.textContent = "The authorization window can be closed.";
          return;
        }
        window.addEventListener("message", function (event) {
          if (event.origin === origin && event.data === "authorizing:github") {
            window.opener.postMessage(result, origin);
          }
        });
        window.opener.postMessage("authorizing:github", origin);
      })();
    </script>
  </body>
</html>`;
}

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Security-Policy", "default-src 'none'; script-src 'unsafe-inline'; style-src 'none'; frame-ancestors 'none'");
  res.setHeader(
    "Set-Cookie",
    "decap_oauth_state=; Path=/api/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
  );

  const expectedState = readCookie(req, "decap_oauth_state");
  const actualState = typeof req.query?.state === "string" ? req.query.state : "";
  const code = typeof req.query?.code === "string" ? req.query.code : "";
  if (!equalState(expectedState, actualState) || !code) {
    res.status(400).send(callbackPage({ error: "Invalid or expired authorization request" }));
    return;
  }

  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.status(503).send(callbackPage({ error: "CMS authentication is not configured" }));
    return;
  }

  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "CCST-Decap-CMS",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error("GitHub did not return an access token");
    }

    res.status(200).send(
      callbackPage({
        payload: {
          token: tokenData.access_token,
          provider: "github",
        },
      })
    );
  } catch (error) {
    console.error("Decap OAuth callback failed:", error.message);
    res.status(502).send(callbackPage({ error: "GitHub authorization failed" }));
  }
};
