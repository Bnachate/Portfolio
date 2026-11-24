# Use-case catalogue

Maintained by the `test-usecases` skill. Status: ✅ covered, ❌ missing, ⏭️ deliberately not covered (reason given).
Levels: API (Vitest + route handlers), Unit, UI (Testing Library, `tests/ui/`), E2E (Playwright, `e2e/`).

## Visitor - public site

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| V1 | Home shows hero, projects, experience timeline, education and contact sections, with no CSP violation | UI, E2E | `tests/ui/public-site.test.tsx`, `e2e/public-site.spec.ts` | ✅ |
| V2 | Header links scroll to each section; mobile menu opens and closes | UI, E2E | `tests/ui/public-site.test.tsx` (Header), `e2e/public-site.spec.ts` | ✅ |
| V3 | Experience cards show period and duration ("Janv. 2023 - Présent", "1 an 9 mois") | Unit, UI | `tests/format.test.ts`, `tests/ui/public-site.test.tsx` (ExperienceCard) | ✅ |
| V4 | "Voir le CV complet" opens the full-stack CV PDF (served without CSP) | UI, E2E | `tests/ui/public-site.test.tsx`, `e2e/public-site.spec.ts` | ✅ |
| V5 | Empty projects list shows "Les projets arrivent bientôt."; projects show tags and links | UI, E2E | `tests/ui/public-site.test.tsx` (Projects), `e2e/public-site.spec.ts` | ✅ |
| V6 | No email or phone number is visible anywhere on the public site | API, UI, E2E | `tests/api.test.ts`, `tests/ui/public-site.test.tsx` (Hero, ContactInfo), `e2e/public-site.spec.ts` | ✅ |
| V7 | The hero email icon leads to the contact form | UI | `tests/ui/public-site.test.tsx` (Hero) | ✅ |
| V8 | Link previews, robots.txt, sitemap.xml and `lang="fr"` are served | E2E | `e2e/public-site.spec.ts` | ✅ |
| V9 | Header shows "Admin" + "Connexion" to visitors, "Admin" + "Déconnexion" to the admin | UI, E2E | `tests/ui/public-site.test.tsx` (Header), `e2e/contact-and-auth.spec.ts` (A5) | ✅ |

## Visitor - contact form

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| C1 | Sending a complete message shows "Message envoyé !", stores it and resets the form | API, UI, E2E | `tests/api-crud.test.ts`, `tests/ui/contact-form.test.tsx`, `e2e/contact-and-auth.spec.ts` | ✅ |
| C2 | Required fields (name, email, subject, message) and email format are enforced | API, UI, E2E | `tests/validation.test.ts`, `tests/ui/contact-form.test.tsx`, `e2e/contact-and-auth.spec.ts` | ✅ |
| C3 | A server error is displayed in the form | UI | `tests/ui/contact-form.test.tsx` | ✅ |
| C4 | More than 5 messages per hour from one visitor are refused with a clear message, input kept | API, UI | `tests/api.test.ts`, `tests/ui/contact-form.test.tsx` | ✅ |
| C5 | Bots filling the hidden honeypot are silently dropped; the field is hidden from people | API, UI | `tests/api.test.ts`, `tests/ui/contact-form.test.tsx` | ✅ |
| C6 | The admin gets an email notification (Resend), failures never break the form | Unit | `tests/notifications.test.ts` | ✅ |

## Read-only admin (visitor)

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| R1 | Header "Admin" link opens the panel with the read-only banner and a "Connexion" button | UI, E2E | `tests/ui/admin-dashboard.test.tsx`, `e2e/read-only-admin.spec.ts` | ✅ |
| R2 | No create / edit / delete control in any tab; hero fields disabled | UI, E2E | `tests/ui/experiences-projects-tabs.test.tsx`, `tests/ui/tags-tab.test.tsx`, `tests/ui/hero-and-messages-tabs.test.tsx`, `e2e/read-only-admin.spec.ts` | ✅ |
| R3 | The Messages tab is not shown and messages are never requested | UI, E2E | `tests/ui/admin-dashboard.test.tsx`, `e2e/read-only-admin.spec.ts` | ✅ |
| R4 | Every write route refuses visitors, even when the UI is bypassed | API, E2E | `tests/api.test.ts`, `e2e/read-only-admin.spec.ts` | ✅ |
| R5 | The hero email is never returned to visitors | API, UI | `tests/api.test.ts`, `tests/api-crud.test.ts`, `tests/ui/hero-and-messages-tabs.test.tsx` | ✅ |

## Authentication

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| A1 | Valid credentials log in and land on /admin | API, UI, E2E | `tests/api.test.ts`, `tests/ui/login-page.test.tsx`, `e2e/auth.setup.ts` | ✅ |
| A2 | Wrong credentials show "Email ou mot de passe incorrect" | UI, E2E | `tests/ui/login-page.test.tsx`, `e2e/contact-and-auth.spec.ts` | ✅ |
| A3 | 6th attempt in 15 min is blocked with a clear message | API, UI | `tests/api.test.ts`, `tests/ui/login-page.test.tsx` | ✅ |
| A4 | A logged-in admin opening /auth/login is sent to /admin | Unit, E2E | `tests/proxy.test.ts`, `e2e/contact-and-auth.spec.ts` | ✅ |
| A5 | Logout clears the session and returns to the site; the panel is read-only again | API, UI, E2E | `tests/api-crud.test.ts`, `tests/ui/admin-dashboard.test.tsx`, `e2e/contact-and-auth.spec.ts` | ✅ |
| A6 | Tampered, expired, foreign or unsigned session tokens are rejected | Unit | `tests/session.test.ts` | ✅ |
| A7 | A deleted user loses access even with a valid token | API | `tests/api-crud.test.ts` | ✅ |
| A8 | An expired session during admin use redirects to the login page (not on a failed login) | Unit | `tests/api-client.test.ts` | ✅ |
| A9 | Cross-site and `Origin: null` writes are refused | API | `tests/api.test.ts` | ✅ |
| A10 | The password can be shown and hidden on the login page | UI | `tests/ui/login-page.test.tsx` | ✅ |

## Admin - experiences

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| E1 | Create an experience with tags; it appears in the table and on the public site in position order | API, UI, E2E | `tests/api-crud.test.ts`, `tests/ui/experiences-projects-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| E2 | Edit an experience; "Mettre à jour" stays disabled until something changes | API, UI, E2E | `tests/api-crud.test.ts`, `tests/ui/experiences-projects-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| E3 | Delete an experience after confirmation, also removed from the public site | API, UI, E2E | `tests/api-crud.test.ts`, `tests/ui/experiences-projects-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| E4 | End date before start date is refused (blocked by the form, enforced by the API on create and update); API errors shown in the form | API, UI | `tests/api-crud.test.ts`, `tests/validation.test.ts`, `tests/ui/experiences-projects-tabs.test.tsx` | ✅ |
| E5 | Create a new tag from the experience form | UI | `tests/ui/experiences-projects-tabs.test.tsx` | ✅ |

## Admin - projects

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| P1 | Create, edit and delete a project; it appears on the public site | API, UI, E2E | `tests/api-crud.test.ts`, `tests/ui/experiences-projects-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| P2 | `javascript:` or invalid URLs are refused; the error is shown in the form; empty links saved as null | API, UI | `tests/api-crud.test.ts`, `tests/validation.test.ts`, `tests/ui/experiences-projects-tabs.test.tsx` | ✅ |
| P3 | GitHub link opens from the table | UI, E2E | `tests/ui/experiences-projects-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |

## Admin - tags

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| T1 | Create, rename (Enter saves, Escape cancels) and delete a tag | API, UI, E2E | `tests/api.test.ts`, `tests/ui/tags-tab.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| T2 | Duplicate names are refused whatever the case, and the error is shown | API, UI, E2E | `tests/api.test.ts`, `tests/ui/tags-tab.test.tsx`, `e2e/admin-content.spec.ts` (rename onto a seeded tag) | ✅ |
| T3 | Usage counts are shown; deleting a used tag warns and removes it everywhere | API, UI, E2E | `tests/api-crud.test.ts`, `tests/ui/tags-tab.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| T4 | Search filters the list; empty search result message | UI, E2E | `tests/ui/tags-tab.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |

## Admin - hero

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| H1 | Edit and save the hero; the public site shows the new content | API, UI, E2E | `tests/api-crud.test.ts`, `tests/ui/hero-and-messages-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| H2 | Live preview reflects the form; "Annuler" restores the saved version | UI, E2E | `tests/ui/hero-and-messages-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| H3 | Invalid links are refused | API | `tests/api-crud.test.ts`, `tests/validation.test.ts` | ✅ |

## Admin - contact messages

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| M1 | List messages with name, email, subject; new ones counted | API, UI, E2E | `tests/api-crud.test.ts`, `tests/ui/hero-and-messages-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| M2 | Opening a new message marks it as read (already read ones are untouched); reply by email | UI, E2E | `tests/ui/hero-and-messages-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| M3 | Mark as done, delete after confirmation | API, UI, E2E | `tests/api-crud.test.ts`, `tests/ui/hero-and-messages-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| M4 | Invalid status refused; unknown message 404 | API | `tests/api-crud.test.ts` | ✅ |

## Platform

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| S1 | Contact and login rate limits: per action, per client, window expiry, fail-open, hashed IPs | Unit | `tests/rate-limit.test.ts` | ✅ |
| S2 | Security headers and CSP on pages, no CSP on the CV PDF, no `X-Powered-By` | E2E | `e2e/public-site.spec.ts` | ✅ |
| S3 | Production deploys apply migrations, previews never do | ⏭️ | Verified by the Vercel build logs (`Database migrations applied`); needs the Vercel environment | ⏭️ |
| S4 | Connection to a real Postgres (`DATABASE_URL`) and the PGlite refusal on Vercel | ⏭️ | Needs a Postgres server; every query path runs on PGlite in tests and on Neon in production | ⏭️ |
