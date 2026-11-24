# Use-case catalogue

Maintained by the `test-usecases` skill. Status: ✅ covered, ❌ missing, ⏭️ deliberately not covered (reason given).
Levels: API (Vitest + route handlers), Unit, UI (Testing Library), E2E (Playwright).

## Visitor - public site

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| V1 | Home shows hero, projects, experience timeline, education and contact sections | E2E | | ❌ |
| V2 | Header links scroll to each section; mobile menu opens and closes | UI, E2E | | ❌ |
| V3 | Experience cards show period and duration ("Janv. 2023 - Présent", "1 an 9 mois") | Unit, UI | `tests/format.test.ts` (unit) | ❌ UI |
| V4 | "Voir le CV complet" opens the full-stack CV PDF | E2E | | ❌ |
| V5 | Empty projects list shows "Les projets arrivent bientôt." | UI | | ❌ |
| V6 | No email or phone number is visible anywhere on the public site | API, E2E | `tests/api.test.ts` (hero API) | ❌ E2E |
| V7 | The hero email icon leads to the contact form | UI | | ❌ |
| V8 | Link previews, robots.txt and sitemap.xml are served | E2E | | ❌ |

## Visitor - contact form

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| C1 | Sending a complete message shows "Message envoyé !" and stores it | API, UI, E2E | `tests/api-crud.test.ts` (stored) | ❌ UI, E2E |
| C2 | Required fields (name, email, subject, message) and email format are enforced | API, UI | `tests/validation.test.ts` | ❌ UI |
| C3 | A server error is displayed in the form | UI | | ❌ |
| C4 | More than 5 messages per hour from one visitor are refused with a clear message | API, UI | `tests/api.test.ts` | ❌ UI (message shown) |
| C5 | Bots filling the hidden honeypot are silently dropped | API | `tests/api.test.ts` | ✅ |
| C6 | The admin gets an email notification (Resend), failures never break the form | Unit | `tests/notifications.test.ts` | ✅ |

## Read-only admin (visitor)

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| R1 | Header "Admin" link opens the panel with the read-only banner and a "Connexion" button | E2E | | ❌ |
| R2 | No create / edit / delete control in any tab; hero fields disabled | UI, E2E | | ❌ |
| R3 | The Messages tab is not shown | UI, E2E | | ❌ |
| R4 | Every write route refuses visitors | API | `tests/api.test.ts` | ✅ |
| R5 | The hero email is never returned to visitors | API | `tests/api.test.ts`, `tests/api-crud.test.ts` | ✅ |

## Authentication

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| A1 | Valid credentials log in and land on /admin | API, E2E | `tests/api.test.ts` (cookie) | ❌ E2E |
| A2 | Wrong credentials show "Email ou mot de passe incorrect" | UI, E2E | | ❌ |
| A3 | 6th attempt in 15 min is blocked with a clear message | API, UI | `tests/api.test.ts` | ❌ UI |
| A4 | A logged-in admin opening /auth/login is sent to /admin | Unit, E2E | `tests/proxy.test.ts` | ✅ |
| A5 | Logout clears the session and returns to the site | API, E2E | `tests/api-crud.test.ts` | ❌ E2E |
| A6 | Tampered, expired, foreign or unsigned session tokens are rejected | Unit | `tests/session.test.ts` | ✅ |
| A7 | A deleted user loses access even with a valid token | API | `tests/api-crud.test.ts` | ✅ |
| A8 | An expired session during admin use redirects to the login page | UI | | ❌ |
| A9 | Cross-site and `Origin: null` writes are refused | API | `tests/api.test.ts` | ✅ |

## Admin - experiences

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| E1 | Create an experience with tags; it appears in the table and on the public site in position order | API, E2E | `tests/api-crud.test.ts` | ❌ E2E |
| E2 | Edit an experience (fields, end date, tags); save is disabled until something changes | API, UI | `tests/api-crud.test.ts` | ❌ UI |
| E3 | Delete an experience after confirmation | API, UI | `tests/api-crud.test.ts` | ❌ UI |
| E4 | End date before start date is refused (create and update) | API, UI | `tests/api-crud.test.ts`, `tests/validation.test.ts` | ❌ UI |
| E5 | Create a new tag from the experience form | UI | | ❌ |

## Admin - projects

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| P1 | Create, edit and delete a project; it appears on the public site | API, E2E | `tests/api-crud.test.ts` | ❌ E2E |
| P2 | `javascript:` or invalid URLs are refused | API, UI | `tests/api-crud.test.ts`, `tests/validation.test.ts` | ❌ UI |
| P3 | GitHub link opens from the table | UI | | ❌ |

## Admin - tags

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| T1 | Create, rename (Enter saves, Escape cancels) and delete a tag | API, UI | `tests/api.test.ts`, `tests/api-crud.test.ts` | ❌ UI |
| T2 | Duplicate names are refused whatever the case | API | `tests/api.test.ts` | ✅ |
| T3 | Usage counts are shown; deleting a used tag warns and removes it everywhere | API, UI | `tests/api-crud.test.ts` | ❌ UI |
| T4 | Search filters the list; empty search result message | UI | | ❌ |

## Admin - hero

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| H1 | Edit and save the hero; the public site shows the new content | API, E2E | `tests/api-crud.test.ts` | ❌ E2E |
| H2 | Live preview reflects the form; "Annuler" restores the saved version | UI | | ❌ |
| H3 | Invalid links are refused | API | `tests/api-crud.test.ts`, `tests/validation.test.ts` | ✅ |

## Admin - contact messages

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| M1 | List messages with name, email, subject, date; new ones highlighted with a count | API, UI | `tests/api-crud.test.ts` | ❌ UI |
| M2 | Opening a message marks it as read | UI | | ❌ |
| M3 | Mark as done, delete after confirmation | API, UI | `tests/api-crud.test.ts` | ❌ UI |
| M4 | Invalid status refused; unknown message 404 | API | `tests/api-crud.test.ts` | ✅ |

## Platform

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| S1 | Contact and login rate limits: per action, per client, window expiry, fail-open, hashed IPs | Unit | `tests/rate-limit.test.ts` | ✅ |
| S2 | Security headers and CSP on pages, no CSP on the CV PDF | E2E | | ❌ |
| S3 | Production deploys apply migrations, previews never do | ⏭️ | Covered by Vercel build logs (`Database migrations applied`) | ⏭️ |
