# Campbell Consulting Website

Static React website for Campbell Consulting Services of Tallahassee (CCST). Public pages and articles are managed through Decap CMS, stored in Git, and pre-rendered during the Vercel build. Supabase is used only by server-side lead-capture functions.

## Requirements

- Node.js 22.12 or newer
- A Supabase project for lead storage
- GitHub OAuth credentials for Decap CMS

## Project structure

```text
api/                    Vercel functions for contact, scheduling, and CMS OAuth
frontend/content/       Git-backed page, article, and site copy
frontend/public/        Public assets, downloads, and Decap entry page
frontend/scripts/       Content generation and static rendering
frontend/src/           React application
supabase/               Lead-table schema and security migrations
vercel.json             Deployment and security headers
```

## Local development

```bash
npm ci
cd frontend
npm ci
npm run dev
```

The Vite development middleware runs the contact and intro-call functions with values from the root `.env` file.

## Production verification

```bash
npm run build
cd frontend
npm test
```

The production build generates complete HTML for every public route, published article, the sitemap, robots file, and 404 page.

## Content management

Decap CMS is available at `/admin/`. Content is stored in:

- `frontend/content/site.json` for global and section copy
- `frontend/content/pages/*.json` for page and SEO settings
- `frontend/content/articles/*.md` for articles

The CMS uses GitHub's editorial workflow: drafts create branches and pull requests, Vercel supplies previews, and approved merges publish the content.

For production authentication, create a GitHub OAuth App with this callback URL:

```text
https://www.consultcampbell.com/api/callback
```

Add `GITHUB_OAUTH_CLIENT_ID` and `GITHUB_OAUTH_CLIENT_SECRET` to Vercel. CMS editors must have write access to the private repository.

## Server environment

Copy `.env.example` to `.env` locally and configure the matching values in Vercel. Never expose `SUPABASE_SERVICE_ROLE_KEY`, SMTP credentials, the HubSpot token, or the GitHub OAuth secret to frontend variables.

## Supabase

The browser does not connect to Supabase. `/api/contact` and `/api/intro-call` validate requests and write through the server-side service role.

Apply `supabase/schema.sql` to a new database using a securely supplied connection string. Existing installations must also apply migrations from `supabase/migrations/`. Do not place database credentials in this repository.

## Deployment

Vercel builds from the repository root using `vercel.json` and publishes `frontend/dist`. Each approved Git merge triggers a deployment automatically.
