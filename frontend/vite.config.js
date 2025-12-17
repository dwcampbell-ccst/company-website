import { createRequire } from "module";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const require = createRequire(import.meta.url);
const contactHandler = require("../api/contact");

export default defineConfig(({ mode }) => {
  // Load env from the repo root so .env at company-website/ is used.
  const env = loadEnv(mode, "..", "");

  // Ensure server-side contact handler sees the same env values.
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || "";
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || "";

  const contactDevPlugin = {
    name: "contact-dev-middleware",
    configureServer(server) {
      server.middlewares.use("/api/contact", (req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }

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
      });
    },
  };

  return {
    envDir: "..",
    plugins: [react(), contactDevPlugin],
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(supabaseAnonKey),
    },
  };
});
