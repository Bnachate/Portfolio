---
name: implement-feature
description: End-to-end workflow to implement a feature in this portfolio (Next.js + Drizzle) - plan, database change, API resource, UI, unit tests (API and UI), Playwright E2E tests, ship to a branch, production database steps and smoke checks. Use when the user asks to implement, add or build a feature, page, section, admin tab or API endpoint.
---

# Implement a feature

Orchestrates the whole delivery of a feature. Each phase either runs or is explicitly skipped with a one-line reason. Talk to the user in French; code, comments and commit messages in English; UI strings in French.

Phase order: plan, `db-change`, `api-resource`, UI, `test-usecases`, `ship`, `prod-db`, `smoke-check`. The phases below call other project skills (in `.claude/skills/`). Invoke them with the Skill tool, or read their `SKILL.md` and follow it.

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

## Phases 4 and 5 - Tests (unit, API, UI and Playwright E2E)

Run the `test-usecases` skill scoped to this feature: it adds the feature's use cases to `.claude/skills/test-usecases/usecases.md`, picks the right level for each (API, unit, UI, E2E), sets up Testing Library or Playwright the first time, writes the tests and proves they catch bugs.

Minimum for the feature: API tests for every new or changed route (visitor access, admin-only writes, validation, not found), UI tests for new components (including read-only mode in the admin), and one E2E journey covering the main user flow. For a bug fix, write the failing test first. `npm test` (and `npm run test:e2e` once set up) must pass.

## Phase 6 - Ship

Run the `ship` skill (checks, commit, push, PR link). Do not merge: the user merges.

## Phase 7 - Production database (if needed)

Run the `prod-db` skill. Only after the user has merged and the deploy is live, unless the step must happen before.

## Phase 8 - Smoke check (if needed)

Run the `smoke-check` skill when the feature changes what visitors see, security-relevant behaviour, headers, SEO or routes. Local check before shipping, production check after the user merges.

## Final report

In French, short: what was built, phases skipped and why, test counts (API, UI, E2E), branch and PR link, and the exact actions left to the user (merge, production commands, Vercel settings).
