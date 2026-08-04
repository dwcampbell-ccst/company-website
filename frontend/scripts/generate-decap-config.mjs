import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(here, "..");
const site = JSON.parse(fs.readFileSync(path.join(frontendRoot, "content", "site.json"), "utf8"));

const quote = (value) => JSON.stringify(String(value));
const labelFor = (value) =>
  value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const siteFields = Object.entries(site).flatMap(([scope, values]) => {
  const fields = Object.entries(values).map(([key, value]) => {
    const widget = String(value).includes("\n") || String(value).length > 120 ? "text" : "string";
    return [
      `            - label: ${quote(labelFor(key))}`,
      `              name: ${quote(key)}`,
      `              widget: ${quote(widget)}`,
    ].join("\n");
  });
  return [
    `        - label: ${quote(labelFor(scope))}`,
    `          name: ${quote(scope)}`,
    "          widget: object",
    "          collapsed: true",
    "          fields:",
    ...fields,
  ];
});

const pageNames = ["home", "services", "regent", "articles", "about", "contact"];
const pageFiles = pageNames.flatMap((name) => [
  `      - label: ${quote(labelFor(name))}`,
  `        name: ${quote(name)}`,
  `        file: ${quote(`frontend/content/pages/${name}.json`)}`,
  "        fields:",
  `          - { label: "Internal slug", name: "slug", widget: "hidden", default: ${quote(name)} }`,
  "          - { label: " + quote("Page name") + ", name: " + quote("title") + ", widget: " + quote("string") + " }",
  "          - { label: " + quote("Hero title") + ", name: " + quote("heroTitle") + ", widget: " + quote("string") + ", required: false }",
  "          - { label: " + quote("Hero subtitle") + ", name: " + quote("heroSubtitle") + ", widget: " + quote("text") + ", required: false }",
  "          - { label: " + quote("Additional page content") + ", name: " + quote("content") + ", widget: " + quote("markdown") + ", required: false }",
  "          - { label: " + quote("SEO title") + ", name: " + quote("seoTitle") + ", widget: " + quote("string") + " }",
  "          - { label: " + quote("SEO description") + ", name: " + quote("seoDescription") + ", widget: " + quote("text") + " }",
  `          - { label: "Canonical path", name: "canonicalPath", widget: "hidden", default: ${quote(name === "home" ? "/" : `/${name}`)} }`,
  "          - { label: " + quote("Social image") + ", name: " + quote("ogImage") + ", widget: " + quote("image") + ", required: false }",
]);

const config = [
  "backend:",
  "  name: github",
  "  repo: dwcampbell-ccst/company-website",
  "  branch: master",
  "  base_url: https://www.consultcampbell.com",
  "  auth_endpoint: api/auth",
  "  auth_scope: repo",
  "publish_mode: editorial_workflow",
  "site_url: https://www.consultcampbell.com",
  "display_url: https://www.consultcampbell.com",
  "logo_url: https://www.consultcampbell.com/logo.png",
  "media_folder: frontend/public/uploads",
  "public_folder: /uploads",
  "local_backend: true",
  "collections:",
  "  - label: Site copy",
  "    name: site_copy",
  "    format: json",
  "    files:",
  "      - label: All site copy",
  "        name: site_content",
  "        file: frontend/content/site.json",
  "        fields:",
  ...siteFields,
  "  - label: Page settings",
  "    name: pages",
  "    format: json",
  "    files:",
  ...pageFiles,
  "  - label: Articles",
  "    name: articles",
  "    folder: frontend/content/articles",
  "    create: true",
  "    format: frontmatter",
  "    extension: md",
  "    slug: '{{slug}}'",
  "    summary: '{{title}} — {{status}}'",
  "    fields:",
  "      - { label: \"Title\", name: \"title\", widget: \"string\" }",
  "      - { label: \"Slug\", name: \"slug\", widget: \"string\", pattern: ['^[a-z0-9]+(?:-[a-z0-9]+)*$', \"Use lowercase words separated by hyphens\"] }",
  "      - { label: \"Excerpt\", name: \"excerpt\", widget: \"text\" }",
  "      - { label: \"Status\", name: \"status\", widget: \"select\", options: [\"draft\", \"published\"], default: \"draft\" }",
  "      - { label: \"Published at\", name: \"publishedAt\", widget: \"datetime\", required: false }",
  "      - { label: \"Hero image\", name: \"heroImage\", widget: \"image\", required: false }",
  "      - { label: \"SEO title\", name: \"seoTitle\", widget: \"string\" }",
  "      - { label: \"SEO description\", name: \"seoDescription\", widget: \"text\" }",
  "      - { label: \"Article body\", name: \"body\", widget: \"markdown\" }",
  "",
].join("\n");

const outputDirectory = path.join(frontendRoot, "public", "admin");
fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, "config.yml"), config, "utf8");
console.log("Generated Decap CMS configuration.");
