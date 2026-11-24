---
name: implement-feature
description: End-to-end workflow to implement a feature in this portfolio (Next.js + Drizzle) - plan, database change, API resource, UI, unit tests (API and UI), Playwright E2E tests, ship to a branch, production database steps and smoke checks. Use when the user asks to implement, add or build a feature, page, section, admin tab or API endpoint.
---

# Implement a feature

Orchestrates the whole delivery of a feature. Each phase either runs or is explicitly skipped with a one-line reason. Talk to the user in French; code, comments and commit messages in English; UI strings in French.

The phases below call other project skills (in `.claude/skills/`). Invoke them with the Skill tool, or read their `SKILL.md` and follow it.

## Phase 0 - Understand and plan

1. Restate the feature in 2-3 lines. Ask a question only if a decision genuinely belongs to the user (product choice, data that will be public, anything destructive); otherwise pick the sensible default and say so.
2. Read the code the feature touches (`CLAUDE.md` gives the map). Decide which phases apply:
   - **DB change** needed? New table/column/index -> yes.
   - **New API resource** needed? New entity with its own routes -> yes. A new field on an existing resource is handled inside the DB change + existing service, not a new resource.
   - **Production data step** needed? Content to (re)load, admin to create -> yes. Schema migrations are automatic on production deploys and are NOT a reason.
3. Share the plan as a short checklist (phases kept / skipped), then start. Create the branch now: `git switch -c feat/<short-slug> origin/main` (after `git fetch`).

## Phase 1 - Database change (if needed)

Run the `db-change` skill.

## Phase 2 - API resource (if needed)

Run the `api-resource` skill. For changes to an existing resource, follow the same rules on the existing files: zod schema in `server/validation.ts`, logic in `server/services/`, thin route in `app/api/` wrapped in `handler()`, `requireAdmin()` on every write.

## Phase 3 - Implement the UI

- Public site: server components in `app/components/`, data fetched in `app/page.tsx` through services (never through the API). Never expose private data to visitors (e.g. use `getPublicHero()`, not `getHero()`).
- Admin: client components in `app/components/admin/`, API calls through `app/services/admin/*.service.ts` (`unwrap()`, `getErrorMessage()`). Every editing control must be hidden when `useReadOnly()` is true; the Messages tab stays admin-only.
- Load data in effects with `.then(setState)` (the `react-hooks/set-state-in-effect` lint rule rejects calling a state-setting function synchronously in an effect).
- Tailwind 4: only use theme colors that exist (an undefined class like `bg-background` silently renders nothing).

## Phase 4 - Unit tests (API and UI)

**API / server** (Vitest, `tests/*.test.ts`, see "Tests" in `CLAUDE.md`):
- Use `setupDatabase()` in `beforeAll`, `actAs('visitor' | 'admin')`, and `call(handler, method, path, { body, params, ip })`.
- Minimum per route: visitor read access (or 401), visitor write -> 401, admin happy path, validation error -> 400, unknown id -> 404. Add the feature's business rules.
- Rate-limited routes: give each test its own `ip` so counters do not leak between tests.

**UI** (React components):
- First time only, set it up: `npm i -D @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom`, put UI tests in `tests/ui/*.test.tsx` with a `// @vitest-environment jsdom` first line, and import `@testing-library/jest-dom/vitest` in those files. Commit the setup with the feature.
- Test behaviour the user sees: rendering from props, read-only mode hides controls (wrap in `ReadOnlyProvider`), form validation and submit calls (mock the `app/services/admin/*` module with `vi.mock`). No snapshot tests.

Run `npm test`. All tests must pass. For a bug fix, write the failing test first.

## Phase 5 - End-to-end tests (Playwright)

- First time only, set it up: `npm i -D @playwright/test`, `npx playwright install chromium`, `playwright.config.ts` with `testDir: 'e2e'` and a `webServer` that runs `npm run build && npx next start -p 3100` with `PGLITE_DATA_DIR=./.pglite-e2e` (add it to `.gitignore`) and a `globalSetup` that runs migrations, seeds and creates a test admin; add `"test:e2e": "playwright test"` and a CI step (`npx playwright install --with-deps chromium` then `npm run test:e2e`). Never use port 3000 (the user's dev server) or `./.pglite`.
- Cover the main user journey of the feature in a real browser: visitor view, read-only admin view, admin edit flow. Prefer role/label locators (`getByRole`, `getByLabel`).
- Run `npm run test:e2e`; all must pass.

## Phase 6 - Ship

Run the `ship` skill (checks, commit, push, PR link). Do not merge: the user merges.

## Phase 7 - Production database (if needed)

Run the `prod-db` skill. Only after the user has merged and the deploy is live, unless the step must happen before.

## Phase 8 - Smoke check (if needed)

Run the `smoke-check` skill when the feature changes what visitors see, security-relevant behaviour, headers, SEO or routes. Local check before shipping, production check after the user merges.

## Final report

In French, short: what was built, phases skipped and why, test counts (API, UI, E2E), branch and PR link, and the exact actions left to the user (merge, production commands, Vercel settings).
