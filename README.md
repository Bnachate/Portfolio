# Portfolio

Personal portfolio website showcasing my projects, experience and education.

Full-stack Next.js app: the public site, the admin panel and the API (`app/api/*`) live in the same project.

## Features

- **Public site**, one page per topic: home (`/`), projects (`/projets`) with a case study per project (`/projets/[id]`), experience and education (`/experience`), skills grouped by domain (`/competences`), contact form (`/contact`)
- **Design system "Encre et menthe"**: ink, paper and mint colors, Familjen Grotesk / Source Serif 4 / JetBrains Mono (self-hosted with `next/font`), tokens in `app/assets/css/globals.css`
- **Admin panel** (`/admin`): manage experiences and projects (order with ↑ ↓, project case studies), tags (with their skill domain), the hero section (with an availability indicator) and contact messages (inbox in two columns, unread badge); deletions are confirmed in place
- **Read-only admin for visitors**: anyone can browse `/admin` (linked from the footer) without being able to change anything; the Messages tab stays admin-only because it holds visitors' personal data
- **Private contact details**: no email or phone number is published; visitors use the contact form
- **SEO**: page metadata, link preview image (Open Graph), `robots.txt`, `sitemap.xml`, structured data

## Stack

- **Next.js 16** (App Router): public pages rendered on the server, API in route handlers
- **PostgreSQL** with **Drizzle ORM** (`server/db/schema.ts`)
- **Auth**: single admin, session JWT in an `HttpOnly` cookie (`jose` + `bcryptjs`)
- **Validation**: `zod` (`server/validation.ts`)
- **Tailwind CSS 4**, Radix UI primitives, `lucide-react` icons

```
app/            pages, components, API route handlers (app/api), SEO files (robots, sitemap, images)
server/         server-only code: db, auth, services, validation, rate limiting, notifications
drizzle/        generated SQL migrations
scripts/        db:migrate, db:seed, content:sync, admin:create, vercel-migrate
proxy.ts        redirects /auth/login to /admin when already logged in
```

## Security

- Every write route requires an admin session; the read-only mode only hides controls, the API enforces it
- CSRF defence: `SameSite` cookie plus an `Origin` check on state-changing requests
- Rate limiting (hashed client IP, `rate_limit_hits` table): 5 logins per 15 minutes, 5 contact messages per hour
- Contact form honeypot against basic bots
- Security headers in `next.config.ts`: CSP, `X-Frame-Options`, `nosniff`, Referrer and Permissions policies, HSTS

## Local development

No database to install: without `DATABASE_URL`, the app uses **PGlite**, an embedded Postgres stored in `./.pglite` (works with both `npm run dev` and `npm start`; refused on Vercel, where the filesystem is not persistent).

```bash
npm install
cp .env.example .env.local          # then fill in SESSION_SECRET
npm run db:migrate                  # create the tables
npm run db:seed                     # optional: initial experiences, tags and hero
ADMIN_PASSWORD='a-long-password' npm run admin:create -- you@example.com "Your Name"
npm run dev
```

> PGlite can only be opened by one process at a time: stop `npm run dev` before running the `db:*`, `content:sync` and `admin:create` scripts.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Vitest suite (see [Tests](#tests)) |
| `npm run test:coverage` | Same, with a coverage report (`coverage/index.html`) |
| `npm run test:e2e` | Playwright end-to-end tests (first time: `npx playwright install chromium`) |
| `npm run db:generate` | Generate a SQL migration after changing `server/db/schema.ts` |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Fill an empty database with the CV content (`scripts/content.ts`) |
| `npm run content:sync` | Overwrite the experiences and the hero with the CV content (projects, messages and users are kept) |
| `npm run admin:create -- <email> [name]` | Create the admin, or reset its password (`ADMIN_PASSWORD` env var, 12+ characters) |
| `npm run vercel-build` | Used by Vercel: applies migrations on production deployments, then builds |

## Tests

`npm test` runs [Vitest](https://vitest.dev) against a throwaway in-memory PGlite database, so it never touches `./.pglite` and can run while `npm run dev` is up.

| File | What it checks |
|---|---|
| `tests/api.test.ts` | Visitors are read-only, writes are admin-only, CSRF origin check, tag CRUD, contact email privacy, honeypot, contact and login rate limits |
| `tests/api-crud.test.ts` | Full CRUD of experiences, projects, contact messages and hero; deleting a tag; session routes (`me`, logout, deleted user) |
| `tests/session.test.ts` | Session tokens: tampered, expired, wrong secret, unsigned (`alg: none`) |
| `tests/rate-limit.test.ts` | Client IP detection, hashed storage, per-action counters, window expiry, fail-open behaviour |
| `tests/notifications.test.ts` | Resend email (mocked): recipient, reply-to, no header injection, plain text only, failures never break the form |
| `tests/proxy.test.ts` | Login page redirect for logged-in admins |
| `tests/validation.test.ts`, `tests/format.test.ts` | Input rules and experience period/duration formatting |
| `tests/api-client.test.ts` | Axios client: redirect to login on an expired session, error messages |
| `tests/injection.test.ts`, `tests/structured-data.test.ts` | Injection payloads (HTML, script, SQL, dangerous and off-site links, control characters, hostile bodies) refused or stored as plain text; JSON-LD escaping |
| `tests/redesign-api.test.ts` | Display order of experiences and projects, tag domains, project case study fields, hero availability indicator |
| `tests/ui/*.test.tsx` | React components with Testing Library: every public page (server components rendered with mocked services), contact form, login page, every admin tab in admin and read-only modes |

**End-to-end** (`e2e/`, Playwright): the production build runs on port 3100 with a throwaway database (`./.pglite-e2e`, recreated on each run with the CV content and a test admin). Journeys: public site (every page, navigation, case studies, CV, no personal data, security headers, SEO files), contact form, login / logout, read-only admin, admin CRUD and ordering of experiences, projects, tags, hero and messages (each checked on the public site), input safety (blank forms never sent, hostile content shown as text, off-site links refused), and accessibility: axe-core checks every page, admin tab, dialog and in-place confirmation against WCAG 2.1 AA.

Coverage is about 96 % of the code measured by Vitest. Every use case and the tests covering it are listed in `.claude/skills/test-usecases/usecases.md`.

GitHub Actions (`.github/workflows/ci.yml`) runs lint, type check, Vitest, the production build and Playwright on every pull request and every push to `main`, and uploads the Playwright report when E2E tests fail.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | In production | PostgreSQL connection string (pooled). Empty locally to use PGlite |
| `SESSION_SECRET` | Yes | Signs the session cookie, 32+ characters |
| `NEXT_PUBLIC_SITE_URL` | No | Public URL for SEO links when using a custom domain (defaults to the Vercel production domain) |
| `RESEND_API_KEY` | No | Enables an email notification for each contact message ([Resend](https://resend.com)) |
| `CONTACT_NOTIFY_EMAIL` | No | Notification recipient (defaults to the contact email of the admin Hero tab) |
| `CONTACT_FROM_EMAIL` | No | Notification sender (defaults to Resend's test sender, which only emails your Resend account) |

## API

Responses are `{ data }` on success and `{ message }` on error. 🔒 = admin session required.

| Route | Methods |
|---|---|
| `/api/auth/login` · `/api/auth/logout` · `/api/auth/me` | `POST` (rate limited) · `POST` · `GET` 🔒 |
| `/api/projects` · `/api/projects/:id` · `/api/projects/order` | `GET`, `POST` 🔒 · `PATCH` 🔒, `DELETE` 🔒 · `PUT` 🔒 (`{ ids }` in display order) |
| `/api/experiences` · `/api/experiences/:id` · `/api/experiences/order` | `GET`, `POST` 🔒 · `PATCH` 🔒, `DELETE` 🔒 · `PUT` 🔒 (`{ ids }` in display order, 409 if the list changed) |
| `/api/tags` · `/api/tags/:id` | `GET` (`?usage=1` adds usage counts), `POST` 🔒 (`{ name, domainId }`, `null` = "Autres") · `PATCH` 🔒 (rename and / or domain), `DELETE` 🔒 |
| `/api/skill-domains` · `/api/skill-domains/:id` · `/api/skill-domains/order` | `GET`, `POST` 🔒 (`{ name }`, added at the end) · `PATCH` 🔒 (rename), `DELETE` 🔒 (its tags move to "Autres") · `PUT` 🔒 (`{ ids }`, every id in the new order) |
| `/api/contacts` · `/api/contacts/:id` | `GET` 🔒, `POST` (contact form, rate limited) · `PATCH` 🔒, `DELETE` 🔒 |
| `/api/hero` | `GET` (contact email only for the admin), `PUT` 🔒 |

## Deployment (Vercel)

1. Create a PostgreSQL database (Neon via Vercel **Storage**, Supabase...) and connect it to the project, which sets `DATABASE_URL`.
2. Set `SESSION_SECRET` (and optionally the Resend variables) in **Settings → Environment Variables**.
3. Deploy. Production deployments apply pending migrations automatically (`vercel-build`); preview deployments never touch the database.
4. Once, from your machine, fill the database and create the admin:
   ```bash
   DATABASE_URL='postgres://...' npm run db:seed
   DATABASE_URL='postgres://...' ADMIN_PASSWORD='...' npm run admin:create -- you@example.com "Your Name"
   ```
5. Every push to `main` is deployed automatically.
