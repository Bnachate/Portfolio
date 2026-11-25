# Use-case catalogue

Maintained by the `test-usecases` skill. Status: ✅ covered, ❌ missing, ⏭️ deliberately not covered (reason given).
Levels: API (Vitest + route handlers), Unit, UI (Testing Library, `tests/ui/`), E2E (Playwright, `e2e/`).

## Visitor - public site

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| V1 | Home shows the hero (availability indicator when turned on), the page tiles with live counts, the profile and the current position, with no CSP violation | UI, E2E | `tests/ui/public-site.test.tsx` (Home page), `e2e/public-site.spec.ts` | ✅ |
| V2 | Separate pages (/, /projets, /experience, /competences, /contact): the header links them all and marks the current one (`aria-current`); the navigation wraps on a phone without horizontal scroll | UI, E2E | `tests/ui/public-site.test.tsx` (SiteHeader), `e2e/public-site.spec.ts` | ✅ |
| V3 | The experience page shows the timeline (period, duration, bullet points, current position announced) and the education | Unit, UI, E2E | `tests/format.test.ts`, `tests/ui/public-site.test.tsx` (Experience page), `e2e/public-site.spec.ts` | ✅ |
| V4 | "CV en PDF" (header) and "Télécharger le CV en PDF" open the full-stack CV PDF (served without CSP) | UI, E2E | `tests/ui/public-site.test.tsx`, `e2e/public-site.spec.ts` | ✅ |
| V5 | /projets lists projects (or "Les projets arrivent bientôt."); each opens its case study /projets/[id], whose empty fields show lorem ipsum placeholders; unknown or invalid ids answer 404 | UI, E2E | `tests/ui/public-site.test.tsx` (Projects page, Case study page), `e2e/public-site.spec.ts`, `e2e/admin-content.spec.ts` (P1) | ✅ |
| V6 | No email or phone number is visible on any public page | API, UI, E2E | `tests/api.test.ts`, `tests/ui/public-site.test.tsx` (SiteFooter, Home, Contact page), `e2e/public-site.spec.ts` | ✅ |
| V7 | The footer of every page leads to the contact form ("Écrire à Brahim") and to the admin | UI, E2E | `tests/ui/public-site.test.tsx` (SiteFooter), `e2e/public-site.spec.ts`, `e2e/read-only-admin.spec.ts` | ✅ |
| V8 | Link previews, robots.txt, sitemap.xml (every page and project), canonical URLs and `lang="fr"` are served | E2E | `e2e/public-site.spec.ts` | ✅ |
| V9 | /competences groups the used tags by the domains of the database, in their display order (unused tags and empty domains hidden, no domain or unknown domain → "Autres" last); every skill has the same style for now (no legend); languages listed | UI, E2E | `tests/ui/public-site.test.tsx` (Skills page, page data helpers), `e2e/public-site.spec.ts` | ✅ |

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
| R1 | Footer "Admin" link opens the panel with the read-only banner and a "Connexion" button | UI, E2E | `tests/ui/admin-dashboard.test.tsx`, `e2e/read-only-admin.spec.ts` | ✅ |
| R2 | No create / edit / delete / reorder control and no domain select in any tab; hero fields and switch disabled | UI, E2E | `tests/ui/experiences-projects-tabs.test.tsx`, `tests/ui/tags-tab.test.tsx`, `tests/ui/hero-and-messages-tabs.test.tsx`, `e2e/read-only-admin.spec.ts` | ✅ |
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
| A5 | Logout (from the admin header) clears the session and returns to the site; the panel is read-only again | API, UI, E2E | `tests/api-crud.test.ts`, `tests/ui/admin-dashboard.test.tsx`, `e2e/contact-and-auth.spec.ts` | ✅ |
| A6 | Tampered, expired, foreign or unsigned session tokens are rejected | Unit | `tests/session.test.ts` | ✅ |
| A7 | A deleted user loses access even with a valid token | API | `tests/api-crud.test.ts` | ✅ |
| A8 | An expired session during admin use redirects to the login page (not on a failed login) | Unit | `tests/api-client.test.ts` | ✅ |
| A9 | Cross-site and `Origin: null` writes are refused | API | `tests/api.test.ts` | ✅ |
| A10 | The password can be shown and hidden on the login page | UI | `tests/ui/login-page.test.tsx` | ✅ |

## Admin - experiences

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| E1 | Create an experience with tags; it goes to the end of the list and appears on /experience; "En cours" and "Chevauchement" badges | API, UI, E2E | `tests/api-crud.test.ts`, `tests/ui/experiences-projects-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| E2 | Edit an experience; "Mettre à jour" stays disabled until something changes | API, UI, E2E | `tests/api-crud.test.ts`, `tests/ui/experiences-projects-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| E3 | Delete an experience after the in-row confirmation ("Oui" / "Non", focus on "Non", Escape cancels), also removed from the public site | API, UI, E2E | `tests/api-crud.test.ts`, `tests/ui/experiences-projects-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| E4 | Move an experience up / down (↑ ↓, disabled at the ends); the order is saved and shown on /experience; a stale list is refused (409) with the error shown | API, UI, E2E | `tests/redesign-api.test.ts`, `tests/ui/experiences-projects-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| E5 | Create a new tag from the experience form | UI | `tests/ui/experiences-projects-tabs.test.tsx` | ✅ |
| E6 | End date before start date is refused (blocked by the form, enforced by the API on create and update); API errors shown in the form | API, UI | `tests/api-crud.test.ts`, `tests/validation.test.ts`, `tests/ui/experiences-projects-tabs.test.tsx` | ✅ |

## Admin - projects

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| P1 | Create, edit and delete (in-row confirmation) a project, with its case study (type, scope, role, context, achievements one per line, results); it appears on /projets and /projets/[id] | API, UI, E2E | `tests/api-crud.test.ts`, `tests/redesign-api.test.ts`, `tests/ui/experiences-projects-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| P2 | `javascript:` or invalid URLs are refused; the error is shown in the form; empty links and case study fields saved as null | API, UI | `tests/api-crud.test.ts`, `tests/validation.test.ts`, `tests/redesign-api.test.ts`, `tests/ui/experiences-projects-tabs.test.tsx` | ✅ |
| P3 | GitHub link and "Voir … sur le site" (public case study) open from the table | UI, E2E | `tests/ui/experiences-projects-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| P4 | Move a project up / down; new projects go after the highest position, even with gaps | API, UI | `tests/redesign-api.test.ts`, `tests/ui/experiences-projects-tabs.test.tsx` | ✅ |

## Admin - tags

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| T1 | Create, rename (Enter saves, Escape cancels) and delete a tag | API, UI, E2E | `tests/api.test.ts`, `tests/ui/tags-tab.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| T2 | Duplicate names are refused whatever the case, and the error is shown | API, UI, E2E | `tests/api.test.ts`, `tests/ui/tags-tab.test.tsx`, `e2e/admin-content.spec.ts` (rename onto a seeded tag) | ✅ |
| T3 | Usage counts are shown ("Non utilisé" badge); the in-row deletion question of a used tag names its usage, and deletion removes it everywhere | API, UI, E2E | `tests/api-crud.test.ts`, `tests/ui/tags-tab.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| T4 | Search filters the list; empty search result message | UI, E2E | `tests/ui/tags-tab.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| T5 | Each tag has a domain (a domain of the database or "Autres"), set on creation and saved as soon as it is changed; unknown domain ids refused; the seed gives common technologies a default domain | API, UI, E2E | `tests/redesign-api.test.ts`, `tests/ui/tags-tab.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |

## Admin - skill domains

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| D1 | The migration creates the 5 initial domains in order and links the existing tags; the domain list is public | API | `tests/skill-domains.test.ts` | ✅ |
| D2 | Create (trimmed, added at the end), rename (Enter saves, Escape cancels) a domain; duplicate names refused whatever the case, error shown; blank names never sent | API, UI, E2E | `tests/skill-domains.test.ts`, `tests/ui/skill-domains-tab.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| D3 | Move a domain up / down; stale list refused (409); the new order shows on /competences | API, UI, E2E | `tests/skill-domains.test.ts`, `tests/ui/skill-domains-tab.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| D4 | Delete a domain after an in-row question saying where its tags go; its tags move to "Autres" | API, UI, E2E | `tests/skill-domains.test.ts`, `tests/ui/skill-domains-tab.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| D5 | Every write is admin-only; read-only visitors see the domains without any control | API, UI, E2E | `tests/skill-domains.test.ts`, `tests/ui/skill-domains-tab.test.tsx`, `e2e/read-only-admin.spec.ts` | ✅ |

## Admin - hero

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| H1 | Edit and save the hero; the public site shows the new content | API, UI, E2E | `tests/api-crud.test.ts`, `tests/ui/hero-and-messages-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| H2 | Live preview reflects the form; "Annuler les modifications" restores the saved version | UI, E2E | `tests/ui/hero-and-messages-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| H3 | Invalid links are refused | API | `tests/api-crud.test.ts`, `tests/validation.test.ts` | ✅ |
| H4 | The availability indicator (switch + text) can be turned off: hidden from the preview and the home page; a boolean and a non-blank text are required | API, UI, E2E | `tests/redesign-api.test.ts`, `tests/ui/hero-and-messages-tabs.test.tsx`, `tests/ui/public-site.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |

## Admin - contact messages

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| M1 | Two columns: the list (sender, date, subject; unread ones announced in text and counted, also on the tab badge) with a "Non lus" filter, and the open message | API, UI, E2E | `tests/api-crud.test.ts`, `tests/ui/hero-and-messages-tabs.test.tsx`, `tests/ui/admin-dashboard.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| M2 | Opening an unread message marks it as read (already read ones are untouched) and updates the tab badge; reply by email | UI, E2E | `tests/ui/hero-and-messages-tabs.test.tsx`, `tests/ui/admin-dashboard.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| M3 | Mark as done or back as unread, delete after the in-place confirmation | API, UI, E2E | `tests/api-crud.test.ts`, `tests/ui/hero-and-messages-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| M4 | Invalid status refused; unknown message 404 | API | `tests/api-crud.test.ts` | ✅ |

## Input safety

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| I1 | No form calls the API while a required field is empty or whitespace-only (contact, login, hero, project, experience, tags, inline tag creation) | UI, E2E | `tests/ui/input-safety.test.tsx`, `e2e/input-safety.spec.ts` | ✅ |
| I2 | Every route refuses empty and whitespace-only required fields | API | `tests/injection.test.ts` | ✅ |
| I3 | HTML / script payloads are stored verbatim and displayed as text (admin messages, tags, every public page including the case study), never executed | API, UI, E2E | `tests/injection.test.ts`, `tests/ui/input-safety.test.tsx`, `e2e/input-safety.spec.ts` | ✅ |
| I4 | SQL-looking input is stored as text and does not alter the database | API | `tests/injection.test.ts` | ✅ |
| I5 | Dangerous links refused: `javascript:` (any case, leading space, tab), `data:`, `vbscript:`, `file:`, and off-site hero links (`//`, `/\`, `/<tab>/`, `/<newline>/`) | API, E2E | `tests/injection.test.ts`, `e2e/input-safety.spec.ts` | ✅ |
| I6 | Null bytes and control characters refused with a 400 (not a database error); line breaks kept in long texts | API | `tests/injection.test.ts` | ✅ |
| I7 | Email header injection refused (contact email with line breaks; notification subject stripped) | API, Unit | `tests/injection.test.ts`, `tests/notifications.test.ts` | ✅ |
| I8 | Unknown fields ignored, no prototype pollution, non-object bodies refused, over-long text refused | API | `tests/injection.test.ts` | ✅ |
| I9 | Inline JSON-LD cannot close its script tag (`</script>`, `<!--`, `&`, line separators escaped) | Unit | `tests/structured-data.test.ts` | ✅ |

## Accessibility (WCAG 2.1 AA, axe-core)

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| X1 | Every public page (desktop and phone), a case study, the 404 page and the contact form error have no WCAG A/AA violation: text contrast, names, structure | E2E | `e2e/accessibility.spec.ts` | ✅ |
| X2 | Login page, including its error state; the password toggle is named and exposes its state (`aria-pressed`) | UI, E2E | `tests/ui/login-page.test.tsx`, `e2e/accessibility.spec.ts` | ✅ |
| X3 | Read-only admin: every tab | E2E | `e2e/accessibility.spec.ts` | ✅ |
| X4 | Admin: every tab, experience / project dialogs, tags menu with selected tags, open message, in-row deletion questions, tag renaming; icon buttons named after their target ("Modifier …", "Monter …") | UI, E2E | `tests/ui/hero-and-messages-tabs.test.tsx`, `tests/ui/experiences-projects-tabs.test.tsx`, `e2e/accessibility.spec.ts` | ✅ |
| X5 | Selected tags are removable with a visible, named button outside the menu trigger; the tag creation field is labelled and outside the menu | UI, E2E | `tests/ui/experiences-projects-tabs.test.tsx`, `e2e/accessibility.spec.ts` | ✅ |

## Platform

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| S1 | Contact and login rate limits: per action, per client, window expiry, fail-open, hashed IPs | Unit | `tests/rate-limit.test.ts` | ✅ |
| S2 | Security headers and CSP on pages, no CSP on the CV PDF, no `X-Powered-By` | E2E | `e2e/public-site.spec.ts` | ✅ |
| S3 | Production deploys apply migrations, previews never do | ⏭️ | Verified by the Vercel build logs (`Database migrations applied`); needs the Vercel environment | ⏭️ |
| S4 | Connection to a real Postgres (`DATABASE_URL`) and the PGlite refusal on Vercel | ⏭️ | Needs a Postgres server; every query path runs on PGlite in tests and on Neon in production | ⏭️ |
