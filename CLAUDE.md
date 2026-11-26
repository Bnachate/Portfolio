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
- **Public pages** — `/` (`app/page.tsx`), `/projets`, `/projets/[id]` (case study, `notFound()` for unknown or invalid ids; switched off for now by `CASE_STUDIES_ENABLED = false` in `app/config/content.ts`: the "Lire l'étude de cas" button, the admin "Voir … sur le site" link and the sitemap entries are hidden and the page redirects to `/`), `/experience`, `/competences`, `/contact`: `force-dynamic` server components that call services directly (not the API). Visitors must get `getPublicHero()` (no email), never `getHero()`. Site pieces are in `app/components/site/` (`SiteHeader` (server) with the client `SiteNav`: the links and `aria-current`; below `lg` (1024 px) they fold behind a "Menu" disclosure button, closed by Escape, a link or a click outside; `SiteFooter`, `ui.tsx` layout blocks: `gutter`, `Container`, `Section`, `PageTitle`, `TileLink`, `ArrowIcon`; `data.ts` page helpers such as `buildSkillGroups`). Fixed texts (profile, education, languages, hero facts) and the `LOREM` placeholders shown while a project's case study fields are empty live in `app/config/content.ts`.
- **Skill domains** — the sections of `/competences` live in the `skill_domains` table (name, `position`), edited from the admin "Domaines" tab through `/api/skill-domains`. `tags.domain_id` points to one (null = "Autres", shown last; deleting a domain sets its tags to null). Migration `0003` created the 5 initial domains. `app/config/tag-domains.ts` only holds the "Autres" label and the default domain (by name) of common technologies, used by the seed.
- **Shared components** (`app/components/common/`, used by the site, the admin and the login page) — never hand-style a control: `Button` / `ButtonLink` (variants `primary`, `outline`, `danger`, `dangerOutline`, `ghost` (selected with `aria-pressed`), `mint`, `outlineOnInk`, `ghostOnInk`; sizes `md` 44 px admin, `lg` 52 px site; `type` defaults to `"button"`), `IconButton` / `IconLink` (required `label` = accessible name), `AppLink` (Next `Link` for routes, `<a>` for URLs, mailto: and files; `newTab` adds `rel="noopener noreferrer"`) and `TextLink` (`underline`, `inline`, `onInk`), `Field` (label + control + hint) and `FieldGroup` (fieldset + legend), `Input` (`fieldSize`, `icon`, `end`), `Textarea`, `Select`, `Switch`, `DatePicker` (same look through `fieldStyles.ts`), `ErrorBanner` (role="alert", nothing when empty; add `className="m-4"` inside an admin panel), `StatusBadge`, `Tag` (variants, `onRemove`) / `TagList` (`limit` shows "+N"), `LogoMark`, `ImageWithFallback`, `dialog`, `table`, `tabs`. Pass `className` to adjust: classes are merged with `cn()` (tailwind-merge), so the caller wins. Admin-only compositions live in `app/components/admin/common/`.
- **Skill tags style** — every tag on `/competences` currently uses the same `Tag` "now" style (white on ink, no legend) while a new way to tell current skills apart is decided; `buildSkillGroups` still computes `current`.
- **Display order** — experiences, projects and skill domains are ordered by `position`, changed from the admin with ↑ ↓ through `PUT /api/{experiences,projects,skill-domains}/order` (`server/services/ordering.ts`: the full id list, 409 if it no longer matches). New items get `nextPosition()` (after the highest position).
- **Admin** (`app/admin/`) — `page.tsx` checks the session on the server and renders the client `AdminDashboard` with `readOnly={!user}`. Visitors may browse `/admin` read-only: components read `useReadOnly()` (`app/admin/ReadOnlyContext.tsx`) to hide editing controls; the Messages tab is admin-only. Real enforcement is server-side (`requireAdmin()` on every write route). Admin tabs live in `app/components/admin/` (shared pieces in `common/AdminUi.tsx`: `EditButton`, `DeleteButton`, `ViewLink`, `DeleteConfirmDialog` (deletion modal of experiences, projects, tags and domains: "Oui / Non", focus on "Non", locked while the deletion runs), `InlineDeleteConfirm` (in-place question, contact messages only), `InlineEditActions` (save / cancel of an inline rename), `ReorderButtons`, `AdminPanel`; and `common/MultiSelectTags.tsx`) and call the API through axios services in `app/services/admin/` (`unwrap()` strips the `{ data }` envelope; `getErrorMessage()` reads `{ message }`).
- **`proxy.ts`** — Next 16 replacement for `middleware.ts`; only redirects `/auth/login` to `/admin` when already logged in.
- **SEO** — `app/config/site.ts` (site identity + `getSiteUrl()`: `NEXT_PUBLIC_SITE_URL`, then `VERCEL_PROJECT_PRODUCTION_URL`), used by `layout.tsx` metadata, `opengraph-image.tsx`, `icon.tsx`, `robots.ts`, `sitemap.ts` and the JSON-LD in `page.tsx`. Sitemap `lastmod` comes from the `updated_at` columns (`server/services/sitemap.ts`): each page lists the content it shows in `PAGES`, so a page that starts showing new content must be added there. Deletions leave no date, and a page without stored content (`/contact`) gets no `lastmod`.

## Security model (keep these invariants)

- Every state-changing route except `POST /api/contacts` (public form) and the auth routes calls `requireAdmin()`.
- Contact details are private: no email/phone in public pages; `/api/hero` returns the email only to the admin. The hero email receives contact notifications (`server/services/notifications.ts`, Resend, optional via `RESEND_API_KEY`).
- `rateLimit(request, action, { limit, windowMs })` (`server/rate-limit.ts`): login 5 / 15 min, contact 5 / hour. Stores a salted hash of the IP in `rate_limit_hits`, and fails open if the DB check errors.
- Stored URLs only accept `http(s)` (and `#anchor` / `/path` for hero buttons) to block `javascript:` links. Relative links may not start with `//` or `/\` (browsers read both as another site), and control characters are refused in links (browsers strip tabs / line breaks, turning `/<tab>/evil` into `//evil`) and in all text except line breaks (Postgres rejects null bytes).
- Forms check required fields with `.trim()` before calling the API: the HTML `required` attribute accepts whitespace-only values.
- Never render user or admin content as HTML: no `dangerouslySetInnerHTML` except JSON-LD, serialized with `toInlineJson()` (`app/config/structured-data.ts`).
- Security headers and CSP are in `next.config.ts` (PDFs are excluded from the CSP so the CV opens in the browser viewer).

## Tests

Vitest in `tests/`, run against an in-memory PGlite. `tests/setup.ts` mocks `next/headers` (`cookies()` reads `globalThis.__testCookies`) and `next/server` `after()`. `tests/helpers.ts` provides `setupDatabase()` (migrations + test admin, call in `beforeAll`), `actAs('visitor' | 'admin')` and `call(handler, method, path, { body, origin, ip, params })`, which invokes route handlers directly like Next.js does. Each test file runs in its own process with its own database (`pool: 'forks'`).

React component tests live in `tests/ui/*.test.tsx` (first line `// @vitest-environment jsdom`). `tests/ui/setup-ui.ts` (global setup) adds jest-dom matchers, Testing Library cleanup, Radix-friendly DOM polyfills and a `next/navigation` mock exposed as `routerMock`. Mock the `app/services/**` modules, never axios; wrap admin components in `<ReadOnlyProvider value={...}>` (the context defaults to read-only).

Playwright specs live in `e2e/`. `playwright.config.ts` runs `e2e:prepare` (recreates `./.pglite-e2e` with migrations, CV content and a test admin), builds, and serves on port 3100; specs run serially on that shared database. `e2e/auth.setup.ts` logs in once and saves `e2e/.auth/admin.json`, reused via `test.use({ storageState: ADMIN_STATE })`: never log in per test (login rate limit: 5 per 15 min) and keep contact form submissions under 5 per run. Seeded tags include `Playwright`, `Java`, `TypeScript`: use other names for tags created in tests. Deletions are confirmed in a modal (contact messages: in place): use `confirmDeletion(page, question)` from `e2e/fixtures.ts` (clicks "Oui" and waits for the question to disappear, i.e. for the server) before asserting anything. Admin lists load after the first render: wait for a row or button before reading the table. While a Radix modal is open the rest of the page is `aria-hidden`, so role-based locators find nothing behind it. Never assert global state another spec may have changed (e.g. "no projects"), and restore what you change (hero, order). CI retries a failing E2E test once and reports it as flaky.

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

## Accessibility

`e2e/accessibility.spec.ts` runs axe-core (WCAG 2.1 A/AA) on every page, admin tab and dialog; keep it at zero violations.

- Colors: use the "Encre et menthe" tokens of `globals.css` (`ink`, `paper`, `mist`, `line`, `slate`, `mint`, `mint-light`, `amber`, `danger`…). `mint-light` is only for text on `ink`; on light backgrounds use `mint` for text and `slate` (not `line`) for secondary text. Focus is a global `:focus-visible` rule (ink outline + mint-light ring), except text fields (inputs, textareas), which replace it with a thicker `mint` border.
- Hidden text that completes an accessible name goes in a `sr-only` span with the separating space outside it (`<span className="sr-only">Poste actuel :</span>{" "}`): spaces at the edge of the span are dropped from the computed name.
- Icon-only buttons need an `aria-label` naming the action and its target (`Supprimer le message de ${name}`), with the icon `aria-hidden`. Toggles also expose `aria-pressed`.
- Never nest interactive elements (no button inside a button or menu trigger), and a Radix menu may only contain menu items: put inputs and extra buttons outside it (see `MultiSelectTags`).
- Scrollable regions need `tabIndex={0}` and a name so keyboard users can scroll them.

## Conventions

- Code comments in **English**; UI strings and API error messages in **French**.
- Git identity is not configured on this machine; commit with `git -c user.name="Brafalgar" -c user.email="74974195+Brafalgar@users.noreply.github.com" commit ...`. Work on a dedicated branch, never directly on `main`.
- Site content (hero, experiences, projects, tags) lives in the database and is edited from the admin; `scripts/content.ts` is only the seed source, so changing it does not change production until `content:sync` is run against the production `DATABASE_URL`.
