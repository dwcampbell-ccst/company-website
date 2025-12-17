# Company Website (React + Supabase + Vercel)

Monorepo that ships a marketing site with editable pages, blog, authentication, and a secure contact form backed by Supabase and Vercel serverless functions.

## Structure

```
company-website/
  api/              # Vercel serverless functions (contact form)
  frontend/         # React + Vite + Tailwind client
  scripts/          # Utility scripts (e.g., apply Supabase schema)
  supabase/         # SQL schema for tables, policies, and seeds
  vercel.json       # Vercel build/output config
```

## Prerequisites

- Node 18+
- Supabase project with URL, anon key, and service role key

## Environment variables

Create `frontend/.env` for client-side values:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
# Optional: embed a HubSpot Meeting link on the Contact page
VITE_HUBSPOT_MEETING_URL=https://meetings.hubspot.com/your-user/your-meeting
```

Backend/serverless variables (set locally or in Vercel Project Settings):

```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM="Website Contact <no-reply@example.com>"
CONTACT_RECEIVER_EMAIL=you@example.com
HUBSPOT_PRIVATE_APP_TOKEN=...
# Optional: set these only if you created matching custom Contact properties in HubSpot
# Common internal names: service_of_interest, message_multi_line
HUBSPOT_CONTACT_TOPICS_PROPERTY=...
HUBSPOT_CONTACT_MESSAGE_PROPERTY=...
HUBSPOT_CONTACT_SUBJECT_PROPERTY=...
HUBSPOT_CONTACT_DOWNLOAD_PROPERTY=...
```

## Install & run locally

```bash
cd company-website
npm install          # installs root + API deps
cd frontend && npm install
cd ..
# Terminal 1: start the contact API locally (uses .env at repo root)
npm run api:dev
# Terminal 2: start the Vite frontend (proxies /api to http://localhost:8788)
npm run dev
```

Build the production bundle:

```bash
npm run build
```

## Apply Supabase schema

The schema (tables, RLS policies, triggers, seed pages) lives in `supabase/schema.sql`. To apply it to the provided database, set the connection string and run:

```bash
cd company-website
$env:DATABASE_URL="postgresql://postgres.aczgktgnyevfoimzsvlp:Hasan007@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
npm run db:apply
```

This creates `profiles`, `posts`, `pages`, and `contact_messages`, enables RLS, and seeds the default page rows (`home`, `services`, `about`, `contact`). Re-run with the same command any time you need to ensure the schema is present.

## Deployment (Vercel)

- Root directory: repository root (contains `vercel.json` and `/api`).
- Build command: handled by `vercel.json` (`cd frontend && npm install && npm run build`).
- Output directory: `frontend/dist`.
- Environment variables: add the Supabase and SMTP values above. Vite needs `VITE_SUPABASE_*` at build time; the API needs `SUPABASE_*` and SMTP values at runtime.

## Admin flow

1. Create an admin user in Supabase Auth, then insert a matching row into `public.profiles` with `role='admin'`.
2. Login at `/login`.
3. Manage pages at `/admin/pages` and posts at `/admin/posts`. Public pages and the blog read directly from Supabase.

## Contact form

The frontend posts to `/api/contact`, which stores the message in `contact_messages` (using the Supabase service role key) and sends an email via SMTP. If `HUBSPOT_PRIVATE_APP_TOKEN` is set, the same submission is also synced to HubSpot as a Contact (email/name/company/phone) and can optionally populate custom HubSpot properties for topics/message/download details. On successful submission the user is prompted to download the PDF at `frontend/public/downloads/ccst-brief.pdf`.
