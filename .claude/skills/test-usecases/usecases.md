# Use-case catalogue

Maintained by the `test-usecases` skill. Status: ✅ covered, ❌ missing, ⏭️ deliberately not covered (reason given).
Levels: API (Vitest + route handlers), Unit, UI (Testing Library, `tests/ui/`), E2E (Playwright, `e2e/`).

## Visitor - public site

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| V1 | Home shows the hero (availability indicator when turned on), the page tiles with live counts, the profile and the current position, with no CSP violation | UI, E2E | `tests/ui/public-site.test.tsx` (Home page), `e2e/public-site.spec.ts` | ✅ |
| V2 | Separate pages (/, /projets, /experience, /competences, /contact): the header links them all and marks the current one (`aria-current`); below 1024 px the navigation folds behind a "Menu" button (`aria-expanded`, `aria-controls`) that opens a vertical list, closed by Escape (focus back on the button), a link or a click outside, without horizontal scroll; on a desktop it stays one row without the button | UI, E2E | `tests/ui/public-site.test.tsx` (SiteHeader), `e2e/public-site.spec.ts`, `e2e/accessibility.spec.ts` (menu open on a phone) | ✅ |
| V3 | The experience page shows one card per employer (sector, overall period and duration, job titles, "En poste" badge), in the order of the experience list, then the education; the sector stays on one line so every company name starts at the same level, and a cut sector shows in full in a tooltip below it on hover or card focus, hidden by Escape (`tests/ui/truncated-tag.test.tsx`); each card opens /experience/[slug] with the breadcrumb, sector, period, positions, website (new tab), the context (paragraphs, "- " lines as a list) and each position with its missions and technologies (current one announced); no context or website section while empty; unknown or malformed slugs answer 404 without querying them | Unit, UI, E2E | `tests/format.test.ts`, `tests/text-blocks.test.ts`, `tests/ui/public-site.test.tsx` (Experience page, Employer page), `e2e/public-site.spec.ts`, `e2e/accessibility.spec.ts` | ✅ |
| V4 | "CV en PDF" (header) and "Télécharger le CV en PDF" open the full-stack CV PDF (served without CSP) | UI, E2E | `tests/ui/public-site.test.tsx`, `e2e/public-site.spec.ts` | ✅ |
| V5 | /projets lists projects (or "Les projets arrivent bientôt."); each opens its case study /projets/[id], whose empty optional fields (type, scope, role, context, achievements, results) are left out, never replaced by placeholder text; unknown or invalid ids answer 404. While `CASE_STUDIES_ENABLED` is false: no "Lire l'étude de cas" button, every /projets/[id] redirects to the home page and the sitemap lists no case study (E2E covers this mode only; UI tests cover both) | UI, E2E | `tests/ui/public-site.test.tsx` (Projects page, Case study page), `e2e/public-site.spec.ts`, `e2e/admin-content.spec.ts` (P1) | ✅ |
| V6 | No email or phone number is visible on any public page | API, UI, E2E | `tests/api.test.ts`, `tests/ui/public-site.test.tsx` (SiteFooter, Home, Contact page), `e2e/public-site.spec.ts` | ✅ |
| V7 | The footer of every page leads to the contact form ("Écrire à Brahim") and to the admin | UI, E2E | `tests/ui/public-site.test.tsx` (SiteFooter), `e2e/public-site.spec.ts`, `e2e/read-only-admin.spec.ts` | ✅ |
| V8 | Link previews, robots.txt, sitemap.xml (every page, and every project once case studies are enabled), canonical URLs and `lang="fr"` are served | E2E | `e2e/public-site.spec.ts` | ✅ |
| V9 | Sitemap lastmod is the real last change of what each page shows (home: everything; /projets: projects and tags; /experience: experiences and tags; /competences: tags, domains, experiences and projects; a case study: the project and its tags); no date for /contact or a page without stored content, never the request time; a change of tags alone moves the experience or project date; a database failure still lists every page, without dates | API, UI | `tests/sitemap-dates.test.ts`, `tests/ui/public-site.test.tsx` (sitemap) | ✅ |
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
| R1 | Header "Admin" link (right after "Contact") and footer "Admin" link open the panel with the read-only banner and a "Connexion" button | UI, E2E | `tests/ui/admin-dashboard.test.tsx`, `tests/ui/public-site.test.tsx`, `e2e/read-only-admin.spec.ts` | ✅ |
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
| E3 | Delete an experience after confirming in a modal ("Oui" / "Non", focus on "Non", Escape cancels, locked while the deletion runs), also removed from the public site | API, UI, E2E | `tests/api-crud.test.ts`, `tests/ui/experiences-projects-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| E4 | Move an experience up / down (↑ ↓, disabled at the ends); the order is saved and shown on /experience; a stale list is refused (409) with the error shown | API, UI, E2E | `tests/redesign-api.test.ts`, `tests/ui/experiences-projects-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| E5 | Create a new tag from the experience form | UI | `tests/ui/experiences-projects-tabs.test.tsx` | ✅ |
| E6 | End date before start date is refused (blocked by the form, enforced by the API on create and update); API errors shown in the form | API, UI | `tests/api-crud.test.ts`, `tests/validation.test.ts`, `tests/ui/experiences-projects-tabs.test.tsx` | ✅ |

## Admin - projects

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| P1 | Create, edit and delete (confirmation modal) a project, with its case study (type, scope, role, context, achievements one per line, results); it appears on /projets and /projets/[id] (admin "Voir … sur le site" link hidden while case studies are switched off) | API, UI, E2E | `tests/api-crud.test.ts`, `tests/redesign-api.test.ts`, `tests/ui/experiences-projects-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| P2 | `javascript:` or invalid URLs are refused; the error is shown in the form; empty links and case study fields saved as null | API, UI | `tests/api-crud.test.ts`, `tests/validation.test.ts`, `tests/redesign-api.test.ts`, `tests/ui/experiences-projects-tabs.test.tsx` | ✅ |
| P3 | GitHub link and "Voir … sur le site" (public case study) open from the table | UI, E2E | `tests/ui/experiences-projects-tabs.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| P4 | Move a project up / down; new projects go after the highest position, even with gaps | API, UI | `tests/redesign-api.test.ts`, `tests/ui/experiences-projects-tabs.test.tsx` | ✅ |

## Admin - companies (employers)

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| C1 | Edit an employer (name, sector, website, context with its character count): fields trimmed, empty ones saved as null, shown on its public page; renaming changes its slug and the name on its positions; a blank name is never sent; duplicate name (any case) 409, `javascript:` link and control characters 400, unknown id 404, writes 401 for visitors | API, UI, E2E | `tests/companies.test.ts`, `tests/ui/companies-tab.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| C2 | Typing a company name on a position links it to the existing employer whatever the case, or creates a bare employer (accent-free unique slug); changing the name moves the position; employers without a position have no public page and are the only ones that can be deleted (409 otherwise), after confirmation | API, UI, E2E | `tests/companies.test.ts`, `tests/ui/companies-tab.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| C3 | The list shows each employer's sector, "À rédiger" while its context is empty, its number of positions and a link to its page; read-only visitors see it without editing controls | UI, E2E | `tests/ui/companies-tab.test.tsx`, `e2e/read-only-admin.spec.ts`, `e2e/accessibility.spec.ts` | ✅ |
| C4 | Migration 0005 creates the CV employers with their context and links the existing positions by name (any case; other names get a bare employer), then requires a company on every position | API | `tests/migration-companies.test.ts` | ✅ |

## Admin - tags

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| T1 | Create, rename (Enter saves, Escape cancels) and delete a tag | API, UI, E2E | `tests/api.test.ts`, `tests/ui/tags-tab.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| T2 | Duplicate names are refused whatever the case, and the error is shown | API, UI, E2E | `tests/api.test.ts`, `tests/ui/tags-tab.test.tsx`, `e2e/admin-content.spec.ts` (rename onto a seeded tag) | ✅ |
| T3 | Usage counts are shown ("Non utilisé" badge); the deletion modal of a used tag names its usage, and deletion removes it everywhere | API, UI, E2E | `tests/api-crud.test.ts`, `tests/ui/tags-tab.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| T4 | Search filters the list; empty search result message | UI, E2E | `tests/ui/tags-tab.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| T5 | Each tag has a domain (a domain of the database or "Autres"), set on creation and saved as soon as it is changed; unknown domain ids refused; the seed gives common technologies a default domain | API, UI, E2E | `tests/redesign-api.test.ts`, `tests/ui/tags-tab.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |

## Admin - skill domains

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| D1 | The migration creates the 5 initial domains in order and links the existing tags; the domain list is public | API | `tests/skill-domains.test.ts` | ✅ |
| D2 | Create (trimmed, added at the end), rename (Enter saves, Escape cancels) a domain; duplicate names refused whatever the case, error shown; blank names never sent | API, UI, E2E | `tests/skill-domains.test.ts`, `tests/ui/skill-domains-tab.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| D3 | Move a domain up / down; stale list refused (409); the new order shows on /competences | API, UI, E2E | `tests/skill-domains.test.ts`, `tests/ui/skill-domains-tab.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
| D4 | Delete a domain after a modal saying where its tags go; its tags move to "Autres" | API, UI, E2E | `tests/skill-domains.test.ts`, `tests/ui/skill-domains-tab.test.tsx`, `e2e/admin-content.spec.ts` | ✅ |
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
| X1 | Every public page (desktop and phone), a case study (when enabled), the 404 page and the contact form error have no WCAG A/AA violation: text contrast, names, structure | E2E | `e2e/accessibility.spec.ts` | ✅ |
| X2 | Login page, including its error state; the password toggle is named and exposes its state (`aria-pressed`) | UI, E2E | `tests/ui/login-page.test.tsx`, `e2e/accessibility.spec.ts` | ✅ |
| X3 | Read-only admin: every tab | E2E | `e2e/accessibility.spec.ts` | ✅ |
| X4 | Admin: every tab, experience / project dialogs, tags menu with selected tags, open message, deletion modals, tag renaming; icon buttons named after their target ("Modifier …", "Monter …") | UI, E2E | `tests/ui/hero-and-messages-tabs.test.tsx`, `tests/ui/experiences-projects-tabs.test.tsx`, `e2e/accessibility.spec.ts` | ✅ |
| X5 | Selected tags are removable with a visible, named button outside the menu trigger; the tag creation field is labelled and outside the menu | UI, E2E | `tests/ui/experiences-projects-tabs.test.tsx`, `e2e/accessibility.spec.ts` | ✅ |
| X6 | Shared components: buttons never submit a form unless `type="submit"`, caller classes win, new-tab links get `rel="noopener noreferrer"`, icon buttons are named by their label, fields are labelled with their help text, the switch exposes `aria-checked`, the error banner is an alert (nothing when empty), tag lists announce hidden tags ("+N autres tags") | UI | `tests/ui/common-components.test.tsx` | ✅ |
| X7 | Admin compositions: inline rename save is disabled while the name is empty and cancel works; the in-place deletion question focuses "Non" and Escape cancels; "Voir … sur le site" opens an external URL in a new tab and a site page in the same tab; the dialog "Fermer" button closes it | UI | `tests/ui/admin-common.test.tsx` | ✅ |

## Platform

| ID | Use case | Level | Test | Status |
|---|---|---|---|---|
| S1 | Contact and login rate limits: per action, per client, window expiry, fail-open, hashed IPs | Unit | `tests/rate-limit.test.ts` | ✅ |
| S2 | Security headers and CSP on pages, no CSP on the CV PDF, no `X-Powered-By` | E2E | `e2e/public-site.spec.ts` | ✅ |
| S3 | Production deploys apply migrations, previews never do | ⏭️ | Verified by the Vercel build logs (`Database migrations applied`); needs the Vercel environment | ⏭️ |
| S4 | Connection to a real Postgres (`DATABASE_URL`) and the PGlite refusal on Vercel | ⏭️ | Needs a Postgres server; every query path runs on PGlite in tests and on Neon in production | ⏭️ |
| S5 | Vercel Web Analytics counts public page views only (admin and login pages dropped, whole path segments); outside Vercel no analytics script is loaded and no request is sent. Counting on Vercel itself is checked by the production smoke check | Unit, UI, E2E | `tests/analytics.test.ts`, `tests/ui/site-analytics.test.tsx` (script served by the site itself), `e2e/public-site.spec.ts` | ✅ |
