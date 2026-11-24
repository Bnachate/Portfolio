# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev                 # Next.js dev server (http://localhost:3000)
npm run build               # production build (does not run lint)
npm run lint                # ESLint (flat config, eslint-config-next)
npm run typecheck           # tsc --noEmit
npm test                    # Vitest, all tests
npm run test:coverage       # Vitest + coverage report in coverage/index.html
npx vitest run tests/session.test.ts            # a single test file
npx vitest run -t "blocks brute force"          # tests whose name matches
npm run test:e2e                                # Playwright (builds, starts its own server on :3100)
npx playwright test e2e/admin-content.spec.ts -g "tags"   # one E2E spec / matching tests

npm run db:generate         # SQL migration in drizzle/ after editing server/db/schema.ts
npm run db:migrate          # apply pending migrations
npm run db:seed             # fill an empty database with the CV content (scripts/content.ts)
npm run content:sync        # overwrite experiences + hero with scripts/content.ts
ADMIN_PASSWORD='12+ chars' npm run admin:create -- you@example.com "Name"
```

CI (`.github/workflows/ci.yml`) runs lint, typecheck, test and build on every PR and push to `main`.

## Local database

Without `DATABASE_URL`, the app uses **PGlite** (embedded Postgres in `./.pglite`). Only one process can open it: stop `npm run dev` / `npm start` before running `db:*`, `content:sync` or `admin:create`. Tests are unaffected (they use `PGLITE_DATA_DIR=memory://`). On Vercel, PGlite is refused and `DATABASE_URL` (Neon, postgres.js with `prepare: false`) is required.

Schema changes: edit `server/db/schema.ts` → `npm run db:generate` → commit the generated `drizzle/*.sql` and `drizzle/meta/*`. Production deployments apply migrations automatically through the `vercel-build` script (`scripts/vercel-migrate.ts`, only when `VERCEL_ENV=production`).

## Architecture

Single Next.js 16 App Router project (React 19, Tailwind 4): public site, admin panel and API in one app. Import alias `@/*` → repo root.

- **`server/`** — server-only code. `db/` (Drizzle schema + lazy `db` proxy that picks postgres.js or PGlite), `auth/` (`session.ts` is edge-safe JWT helpers with `jose`; `index.ts` `getCurrentUser()` reads the cookie via `next/headers` and re-checks the user exists), `services/` (all DB access, one file per resource), `validation.ts` (all zod schemas), `http.ts`, `rate-limit.ts`.
- **`app/api/**/route.ts`** — thin route handlers. Every handler is wrapped in `handler()` from `server/http.ts`, which runs the same-origin CSRF check on non-GET requests and maps `HttpError` to JSON. Pattern: `await requireAdmin()` for writes → `parseBody(request, schema)` → service call → `ok(data, status)`. Responses are always `{ data }` or `{ message }`. Next 16 typing: context is `{ params: Promise<{ id: string }> }`, use `parseId()`.
- **Public page** (`app/page.tsx`) is a `force-dynamic` server component that calls services directly (not the API). Visitors must get `getPublicHero()` (no email), never `getHero()`.
- **Admin** (`app/admin/`) — `page.tsx` checks the session on the server and renders the client `AdminDashboard` with `readOnly={!user}`. Visitors may browse `/admin` read-only: components read `useReadOnly()` (`app/admin/ReadOnlyContext.tsx`) to hide editing controls; the Messages tab is admin-only. Real enforcement is server-side (`requireAdmin()` on every write route). Admin tabs live in `app/components/admin/` and call the API through axios services in `app/services/admin/` (`unwrap()` strips the `{ data }` envelope; `getErrorMessage()` reads `{ message }`).
- **`proxy.ts`** — Next 16 replacement for `middleware.ts`; only redirects `/auth/login` to `/admin` when already logged in.
- **SEO** — `app/config/site.ts` (site identity + `getSiteUrl()`: `NEXT_PUBLIC_SITE_URL`, then `VERCEL_PROJECT_PRODUCTION_URL`), used by `layout.tsx` metadata, `opengraph-image.tsx`, `icon.tsx`, `robots.ts`, `sitemap.ts` and the JSON-LD in `page.tsx`.

## Security model (keep these invariants)

- Every state-changing route except `POST /api/contacts` (public form) and the auth routes calls `requireAdmin()`.
- Contact details are private: no email/phone in public pages; `/api/hero` returns the email only to the admin. The hero email receives contact notifications (`server/services/notifications.ts`, Resend, optional via `RESEND_API_KEY`).
- `rateLimit(request, action, { limit, windowMs })` (`server/rate-limit.ts`): login 5 / 15 min, contact 5 / hour. Stores a salted hash of the IP in `rate_limit_hits`, and fails open if the DB check errors.
- Stored URLs only accept `http(s)` (and `#anchor` / `/path` for hero buttons) to block `javascript:` links.
- Security headers and CSP are in `next.config.ts` (PDFs are excluded from the CSP so the CV opens in the browser viewer).

## Tests

Vitest in `tests/`, run against an in-memory PGlite. `tests/setup.ts` mocks `next/headers` (`cookies()` reads `globalThis.__testCookies`) and `next/server` `after()`. `tests/helpers.ts` provides `setupDatabase()` (migrations + test admin, call in `beforeAll`), `actAs('visitor' | 'admin')` and `call(handler, method, path, { body, origin, ip, params })`, which invokes route handlers directly like Next.js does. Each test file runs in its own process with its own database (`pool: 'forks'`).

React component tests live in `tests/ui/*.test.tsx` (first line `// @vitest-environment jsdom`). `tests/ui/setup-ui.ts` (global setup) adds jest-dom matchers, Testing Library cleanup, Radix-friendly DOM polyfills and a `next/navigation` mock exposed as `routerMock`. Mock the `app/services/**` modules, never axios; wrap admin components in `<ReadOnlyProvider value={...}>` (the context defaults to read-only).

Playwright specs live in `e2e/`. `playwright.config.ts` runs `e2e:prepare` (recreates `./.pglite-e2e` with migrations, CV content and a test admin), builds, and serves on port 3100; specs run serially on that shared database. `e2e/auth.setup.ts` logs in once and saves `e2e/.auth/admin.json`, reused via `test.use({ storageState: ADMIN_STATE })`: never log in per test (login rate limit: 5 per 15 min) and keep contact form submissions under 5 per run. Seeded tags include `Playwright`, `Java`, `TypeScript`: use other names for tags created in tests.

The use-case catalogue mapping every use case to its tests is `.claude/skills/test-usecases/usecases.md`.

## Project skills

Workflows live in `.claude/skills/`: `implement-feature` (full feature delivery, orchestrates the others), `db-change`, `api-resource`, `test-usecases` (use-case catalogue in `.claude/skills/test-usecases/usecases.md` + API, unit, UI and Playwright tests), `ship` (checks, commit, push), `prod-db` (production data operations the user runs) and `smoke-check`.

**Recommend the relevant skill proactively.** Whenever a request or the current state of the work matches a trigger below, name the skill to the user (in French, one line, with the reason) before or while acting, even if they did not ask. If a request matches none, say nothing.

| Situation | Recommend |
|---|---|
| New feature, section, page, admin tab or endpoint | `/implement-feature` |
| A change needs a new table, column, index or constraint | `/db-change` |
| A new entity needs its own `/api` routes | `/api-resource` |
| Tests to add, complete or audit; a bug fix (write the failing test first); a use case without a test in `usecases.md` | `/test-usecases` |
| Work is done and verified, or the user says commit / push | `/ship` |
| Data must change in production: content, admin account, backfill (not schema: migrations run on deploy) | `/prod-db` |
| A change affects visitors, security, headers, SEO or routes; or after the user merges such a change | `/smoke-check` (local before shipping, production after merge) |
| Production misbehaves after a deploy | `/smoke-check` on production first, then investigate |

## Conventions

- Code comments in **English**; UI strings and API error messages in **French**.
- Git identity is not configured on this machine; commit with `git -c user.name="Brafalgar" -c user.email="74974195+Brafalgar@users.noreply.github.com" commit ...`. Work on a dedicated branch, never directly on `main`.
- Site content (hero, experiences, projects, tags) lives in the database and is edited from the admin; `scripts/content.ts` is only the seed source, so changing it does not change production until `content:sync` is run against the production `DATABASE_URL`.
