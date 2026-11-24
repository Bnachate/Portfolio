---
name: test-usecases
description: Cover every use case of this portfolio with the right tests - API/integration and unit tests (Vitest), React component tests (Testing Library) and end-to-end tests (Playwright). Maintains a use-case catalogue mapped to tests, finds the gaps, sets up the missing tooling and writes the missing tests. Use when the user asks to add, complete or audit tests or coverage, or from the implement-feature workflow.
---

# Cover the use cases with tests

The source of truth is [usecases.md](usecases.md): every use case of the app, its test level(s) and the test(s) covering it. This skill keeps it complete and makes every row green. Talk to the user in French; tests, names and comments in English.

Scope: the whole app, or only the use cases of a feature when called from `implement-feature` (then add the feature's use cases to the catalogue first).

## 1. Inventory

1. Read `usecases.md`.
2. Look for use cases missing from it: list `app/**/page.tsx`, `app/api/**/route.ts`, the admin tabs in `app/components/admin/`, the public sections in `app/components/`, forms and `server/services/`. Every user action, every rule (validation, permission, limit) and every error path the user can hit is a use case.
3. Add the missing rows (`ID`, use case, level, test, status) before writing any test.

## 2. Pick the level (test pyramid)

Choose the cheapest level that proves the behaviour; add a higher level only for what the lower one cannot see.

| Level | Tool | Use for |
|---|---|---|
| **API** | Vitest + `tests/helpers.ts` | Permissions (visitor 401 / admin), validation (400), not found (404), conflicts (409), rate limits, data privacy, business rules, cascades |
| **Unit** | Vitest | Pure helpers (formatting, parsing), session tokens, proxy, notifications with mocked `fetch` |
| **UI** | Vitest + Testing Library (jsdom) | What a component renders from props, read-only mode hiding controls, client-side validation, loading / error / empty states, calls made to the services (mocked) |
| **E2E** | Playwright | A few critical journeys across pages in a real browser: visitor browsing, contact form, login / logout, read-only admin, one admin CRUD flow per resource |

Do not duplicate: a rule proven at API level is not re-tested in E2E with every variant; E2E checks the journey works end to end.

## 3. Set up the tooling (first time only)

Check `package.json` first; skip what exists. Commit the setup with the tests.

**UI tests**
- `npm i -D @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom`
- `vitest.config.ts`: `include: ['tests/**/*.test.{ts,tsx}']`.
- UI tests live in `tests/ui/*.test.tsx`, start with `// @vitest-environment jsdom`, import `@testing-library/jest-dom/vitest`, and call `cleanup()` in `afterEach` if not automatic.
- Mock what needs Next.js: `vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))`. Mock the API layer, not axios: `vi.mock('@/app/services/admin/tags.service')`.
- Admin components: render inside `<ReadOnlyProvider value={true|false}>` to test both modes.
- Radix dialogs and dropdowns render in a portal: query with `screen`, not the render container.

**E2E tests (Playwright)**
- `npm i -D @playwright/test` then `npx playwright install chromium`.
- An `e2e:prepare` script (`scripts/e2e-prepare.ts`) that deletes `./.pglite-e2e`, runs migrations, seeds and creates the test admin from `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD`. It exits before the server starts (PGlite allows one process).
- `playwright.config.ts`: `testDir: 'e2e'`, `use.baseURL: 'http://localhost:3100'`, one `chromium` project, and a `webServer` running `npm run e2e:prepare && npm run build && npx next start -p 3100` with `env: { PGLITE_DATA_DIR: './.pglite-e2e', SESSION_SECRET: '<test secret, 32+ chars>', E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD }`, `reuseExistingServer: !process.env.CI`. Never port 3000 (the user's dev server) or `./.pglite`.
- **Login once**: an `e2e/auth.setup.ts` setup project logs in and saves `storageState` (`e2e/.auth/admin.json`); admin specs reuse it. Logging in in every test would hit the login rate limit (5 per 15 min per IP).
- The contact form allows 5 messages per hour per IP: the database is recreated on each run, so keep the whole suite under 5 sends.
- `.gitignore`: `/.pglite-e2e`, `/e2e/.auth`, `/test-results`, `/playwright-report`.
- `package.json`: `"test:e2e": "playwright test"`.
- CI (`.github/workflows/ci.yml`): after the build step, `npx playwright install --with-deps chromium` then `npm run test:e2e`; upload `playwright-report` as an artifact on failure.
- Pitfall: production mode sends the CSP from `next.config.ts` (with `upgrade-insecure-requests`). If pages load without styles or scripts on `http://localhost:3100`, check the browser console for CSP errors before anything else.

## 4. Write the tests

**API**: one `describe` per resource or rule, `setupDatabase()` in `beforeAll`, `actAs(...)`, `call(handler, method, path, { body, params, ip })`. Give rate-limited calls their own `ip`.

**UI**: test behaviour, not implementation. Query by role and label (`getByRole('button', { name: 'Ajouter' })`, `getByLabelText('Email')`), interact with `userEvent`, assert what the user sees and which service was called with what. No snapshots, no testing of internal state or CSS classes (except visibility).

**E2E**: one spec per journey in `e2e/*.spec.ts`. Role / label / text locators only (no CSS selectors tied to Tailwind classes). Each spec creates the data it needs and does not depend on another spec's order. Assert the outcome the user sees (toast, row in the table, redirect, text on the public page).

French UI strings are part of the contract: assert on the real labels.

## 5. Prove the tests catch bugs

Run everything: `npm test`, `npm run test:e2e`, `npm run test:coverage`.

Then spot-check: introduce 2 or 3 deliberate bugs in the code under test (e.g. remove a `requireAdmin()`, show an edit button in read-only mode, break a validation rule), confirm the matching tests fail, and restore the files with `git checkout -- <files>`. A test that still passes against a bug is rewritten.

## 6. Update the catalogue and report

- Set each covered row of `usecases.md` to ✅ with the test file (and test name if useful). Rows deliberately not covered stay ⏭️ with the reason.
- Report in French: use cases added, tests added per level (API / unit / UI / E2E) with counts, coverage figure, bugs found while testing (do not silently fix product bugs: report them and ask), and what remains.
- Recommend `/ship` to commit.
