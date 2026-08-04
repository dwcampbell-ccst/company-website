import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const distRoot = path.resolve(here, "..", "dist");
const expectedRoutes = [
  ["/", "Campbell Consulting | AI Governance", "Clarity for Decisions"],
  ["/services", "Consulting and AI Governance Services", "Delivery that connects strategy to execution"],
  ["/regent", "Regent | Runtime AI Governance", "Regent: runtime governance for AI agents"],
  ["/articles", "Insights and Articles", "Insights and Articles"],
  ["/about", "About Campbell Consulting", "Strategic Insight"],
  ["/contact", "Contact Campbell Consulting", "Start the Conversation"],
];

const errors = [];
const readRoute = (route) => {
  const filename = route === "/" ? path.join(distRoot, "index.html") : path.join(distRoot, route.slice(1), "index.html");
  if (!fs.existsSync(filename)) {
    errors.push(`Missing output for ${route}`);
    return "";
  }
  return fs.readFileSync(filename, "utf8");
};

const titles = new Set();
for (const [route, titleText, headingText] of expectedRoutes) {
  const html = readRoute(route);
  const title = html.match(/<title[^>]*>(.*?)<\/title>/)?.[1] || "";
  if (!title.includes(titleText)) errors.push(`${route} has an unexpected title: ${title}`);
  if (titles.has(title)) errors.push(`Duplicate page title: ${title}`);
  titles.add(title);
  if (!html.includes(headingText)) errors.push(`${route} is missing visible page content`);
  if (!/<meta[^>]+name="description"/.test(html)) errors.push(`${route} is missing a meta description`);
  if (!/<link[^>]+rel="canonical"/.test(html)) errors.push(`${route} is missing a canonical URL`);
  if (html.includes("Company Website")) errors.push(`${route} still contains the old Vite title`);
  if (html.includes('<div id="app"></div>')) errors.push(`${route} contains an empty application shell`);
}

const regent = readRoute("/regent");
if (!regent.includes('"@type":"FAQPage"')) errors.push("Regent is missing FAQ structured data");
if (!regent.includes("tamper-evident audit chain")) errors.push("Regent source is missing required copy");

const articleRoot = path.join(distRoot, "articles");
const articleDirectories = fs.readdirSync(articleRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory());
for (const article of articleDirectories) {
  const html = fs.readFileSync(path.join(articleRoot, article.name, "index.html"), "utf8");
  if (!html.includes('"@type":"BlogPosting"')) errors.push(`Article ${article.name} is missing BlogPosting data`);
  if (html.includes('<div id="app"></div>')) errors.push(`Article ${article.name} is not pre-rendered`);
}

const notFound = fs.readFileSync(path.join(distRoot, "404.html"), "utf8");
if (!notFound.includes("noindex")) errors.push("404 page is not marked noindex");
const sitemap = fs.readFileSync(path.join(distRoot, "sitemap.xml"), "utf8");
for (const [route] of expectedRoutes) {
  if (!sitemap.includes(`https://www.consultcampbell.com${route}`)) errors.push(`Sitemap is missing ${route}`);
}
if (sitemap.includes("/admin") || sitemap.includes("/login")) errors.push("Sitemap contains a private route");

const allOutput = fs
  .readdirSync(distRoot, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
  .map((entry) => fs.readFileSync(path.join(entry.parentPath || entry.path, entry.name), "utf8"))
  .join("\n");
if (allOutput.includes("SUPABASE_SERVICE_ROLE_KEY")) errors.push("Server secret name leaked into frontend output");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Verified ${expectedRoutes.length + articleDirectories.length} pre-rendered public routes.`);
