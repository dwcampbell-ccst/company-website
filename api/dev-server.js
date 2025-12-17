const http = require("http");
const path = require("path");
const { config } = require("dotenv");
const contactHandler = require("./contact");

config({ path: path.resolve(__dirname, "../.env") });

const PORT = process.env.CONTACT_DEV_PORT || 8788;

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const pathname = req.url.split("?")[0];

  if (pathname === "/api/contact") {
    let rawBody = "";

    req.on("data", (chunk) => {
      rawBody += chunk.toString();
    });

    req.on("end", async () => {
      try {
        req.body = rawBody ? JSON.parse(rawBody) : {};
      } catch (err) {
        res.statusCode = 400;
        res.end("Invalid JSON");
        return;
      }

      res.status = (code) => {
        res.statusCode = code;
        return res;
      };

      res.json = (payload) => {
        if (!res.headersSent) {
          res.setHeader("Content-Type", "application/json");
        }
        res.end(JSON.stringify(payload));
      };

      try {
        await contactHandler(req, res);
      } catch (err) {
        console.error("Contact handler error:", err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end("Server error");
        }
      }
    });

    return;
  }

  res.statusCode = 404;
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`Contact dev server running at http://localhost:${PORT}/api/contact`);
});
