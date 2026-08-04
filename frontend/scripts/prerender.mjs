import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(here, "..");
const distRoot = path.join(frontendRoot, "dist");
const serverEntry = path.join(frontendRoot, "dist-ssr", "entry-server.js");
const template = fs.readFileSync(path.join(distRoot, "index.html"), "utf8");
const { getStaticRoutes, render } = await import(`${pathToFileURL(serverEntry).href}?v=${Date.now()}`);

const routes = getStaticRoutes();
for (const route of routes) {
  const { appHtml, headHtml } = render(route);
  const html = template
    .replace(/<!--seo-start-->[\s\S]*?<!--seo-end-->/, `<!--seo-start-->${headHtml}<!--seo-end-->`)
    .replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`);

  if (route === "/404") {
    fs.writeFileSync(path.join(distRoot, "404.html"), html, "utf8");
    continue;
  }

  const outputDirectory = route === "/" ? distRoot : path.join(distRoot, route.slice(1));
  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.writeFileSync(path.join(outputDirectory, "index.html"), html, "utf8");
}

const publicRoutes = routes.filter((route) => route !== "/404");
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...publicRoutes.map((route) => `  <url><loc>https://www.consultcampbell.com${route}</loc></url>`),
  "</urlset>",
  "",
].join("\n");
fs.writeFileSync(path.join(distRoot, "sitemap.xml"), sitemap, "utf8");
fs.writeFileSync(
  path.join(distRoot, "robots.txt"),
  [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /login",
    "",
    "Sitemap: https://www.consultcampbell.com/sitemap.xml",
    "",
  ].join("\n"),
  "utf8"
);

console.log(`Pre-rendered ${routes.length - 1} public routes plus a 404 page.`);
