# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This is a two-package layout: the repo root (server/API/tooling) and `frontend/` (the Vite+React app). Most scripts at the root delegate into `frontend/`.

Root:
- `npm ci` — install root deps
- `npm run dev` — runs `frontend`'s dev server (Vite)
- `npm run api:dev` — standalone local server for `api/*.js` Vercel functions (`api/dev-server.js`)
- `npm run build` — delegates to `frontend`'s build
- `npm test` — runs root Node test suite, then delegates to `frontend`'s test suite
- `npm run db:apply` — applies `supabase/schema.sql` via `scripts/apply-schema.js` (needs `DATABASE_URL`)

Frontend (from `frontend/`):
- `npm run dev` — Vite dev server (auto-runs `content:generate` first via `predev`)
- `npm run build` — `vite build` + SSR build + `scripts/prerender.mjs` (pre-renders every static route to HTML) + `scripts/verify-build.mjs`
- `npm test` — `vitest run`
- `npm run content:generate` — compiles `frontend/content/**` (Decap CMS JSON/Markdown) into `frontend/src/generated/content.js`

Running a single test:
- Root/server tests (`node:test`): `node --test tests/api-validation.test.cjs`
- Frontend tests (Vitest): `cd frontend && npx vitest run src/content.test.js`

No lint/format tooling is configured (no ESLint, Prettier, or Biome in this repo).

## Architecture

**Static SSG hybrid, not Next.js.** The frontend is a React 18 + React Router 6 app built with Vite, but pages are pre-rendered at build time via a hand-rolled SSR/prerender pipeline (`frontend/src/entry-server.jsx` renders via `renderToString`, `frontend/scripts/prerender.mjs` walks the static routes and writes one `index.html` per route into `frontend/dist/`, plus `sitemap.xml` and `robots.txt`). Static routes are enumerated by `getStaticRoutes()` in `frontend/src/App.jsx`.

**Content pipeline (Decap CMS → generated JS).** Site copy and articles live as git-backed JSON/Markdown under `frontend/content/` (`site.json`, `pages/*.json`, `articles/*.md`), edited via Decap CMS at `/admin/` (config: `frontend/public/admin/config.yml`; editorial workflow — drafts create branches/PRs, Vercel supplies previews, merges to `master` publish). At build/dev time, `frontend/scripts/generate-content.mjs` compiles this into `frontend/src/generated/content.js` — **this generated file is build output; never hand-edit it.** Pages read content through `frontend/src/hooks/useSiteContent.js` / `usePageContent.js`.

**API layer is serverless, not a long-running server.** `api/*.js` are individual Vercel functions (CommonJS, `module.exports = async (req, res) => {...}`): `contact.js` (validates + rate-limits + writes to Supabase + emails via SMTP + syncs to HubSpot), `intro-call.js` (rate-limited call-booking log), `auth.js`/`callback.js` (Decap CMS GitHub OAuth). `api/dev-server.js` and middleware wired into `frontend/vite.config.js` simulate these functions locally during `npm run dev`.

**Database is server-only.** Supabase/Postgres, accessed only from `api/contact.js` and `api/intro-call.js` via the service-role key — the browser never talks to Supabase directly, and RLS is enabled with no anonymous insert policies. Schema: `supabase/schema.sql` (tables `contact_messages`, `intro_call_requests`, idempotent DDL) plus `supabase/migrations/`. No ORM — raw `pg` client via `scripts/apply-schema.js`.

**Styling** is Tailwind CSS 3.4 (`frontend/tailwind.config.js`) plus `@tailwindcss/typography`; no CSS Modules/styled-components. Most page content lives directly in `frontend/src/pages/*.jsx`; shared chrome is in `frontend/src/components/` (`Header.jsx`, `Layout.jsx`, `Seo.jsx` wraps `react-helmet-async`).

**Env vars are split by tier.** Root `.env` (server-side, loaded by `frontend/vite.config.js` via `envDir: ".."`) holds `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `SMTP_*`, `CONTACT_RECEIVER_EMAIL`, `HUBSPOT_PRIVATE_APP_TOKEN`, `GITHUB_OAUTH_CLIENT_*`. `frontend/.env` holds only `VITE_`-prefixed client vars (`VITE_CONTACT_API_URL`, `VITE_HUBSPOT_MEETING_URL`). Never expose service-role/SMTP/HubSpot/OAuth secrets as `VITE_` vars.

## Deployment

Deployed on Vercel (`vercel.json`: `buildCommand: cd frontend && npm ci && npm run build`, `outputDirectory: frontend/dist`). Every merge to `master` auto-deploys. `vercel.json` also sets strict security headers site-wide (CSP, X-Frame-Options: DENY, etc.) and `noindex`/`no-store` on `/admin/*` and `/api/*`. CI (`.github/workflows/ci.yml`) runs on PRs/pushes to `master`: install → `npm test` (both packages) → `npm run build` (both packages) → `npm audit --omit=dev --audit-level=high` (both packages).
