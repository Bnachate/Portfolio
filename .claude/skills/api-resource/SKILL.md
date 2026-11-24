---
name: api-resource
description: Add a new API resource (entity with CRUD routes) to this Next.js project following its conventions - zod schemas, Drizzle service, route handlers with admin guard, front-end axios service, read-only aware admin tab and API tests. Use when a feature introduces a new entity exposed through /api.
---

# New API resource

Example name below: `certification`. Mirror an existing resource (`tags` or `experiences`) rather than inventing new patterns.

## Server

1. **Schema**: table in `server/db/schema.ts` (via the `db-change` skill).
2. **Validation**: `createXSchema` / `updateXSchema` in `server/validation.ts`. Reuse the helpers there: `shortText(max)` for required text, `httpUrl` / `optionalHttpUrl` for links (never accept `javascript:`), `isoDate`, `position`, `tagIds`. Update schemas are `.partial()`; cross-field rules (`refine`) must also be enforced in the service on update.
3. **Service** `server/services/certifications.ts`: all DB access lives here. Return DTOs without `createdAt` / `updatedAt`. Throw `new HttpError(404, '... introuvable')` for unknown ids and `409` for conflicts. Use `db.transaction` when writing several tables (see `setTags` in `experiences.ts`).
4. **Routes**:
   - `app/api/certifications/route.ts`: `GET` (public if the content is public) and `POST`.
   - `app/api/certifications/[id]/route.ts`: `PATCH` and `DELETE`, typed `type Context = { params: Promise<{ id: string }> }`, id via `parseId()`.
   - Every export is wrapped in `handler()` (CSRF origin check + error mapping). Every write starts with `await requireAdmin()`. Body via `parseBody(request, schema)`. Return `ok(data)` / `ok(data, 201)` / `ok(null)`.
   - Personal or private fields must not be returned to visitors (pattern: `getPublicHero()` vs `getHero()` in `/api/hero`).
   - Public write endpoints (like the contact form) need `rateLimit()` and a honeypot.

## Front end

5. **Types** in `app/types/api.ts`.
6. **Service** `app/services/admin/certifications.service.ts` with `apiClient` and `unwrap<T>()`, same shape as `tags.service.ts`.
7. **Admin tab** `app/components/admin/CertificationsTab.tsx`, registered in `app/admin/AdminDashboard.tsx` (trigger + content, adjust the grid columns for both modes). It must call `useReadOnly()` and hide create / edit / delete controls when true. Errors shown with `ErrorBanner` and `getErrorMessage()`.
8. **Public display** if needed: server component fed from `app/page.tsx` via the service.

## Tests (`tests/<resource>.test.ts`)

With `setupDatabase`, `actAs` and `call` from `tests/helpers.ts`:
- visitor: `GET` 200 (or 401 if private), every write 401;
- admin: create 201, list, update, delete 200 then 404;
- invalid body 400, unknown id 404, conflicts 409 if any;
- private fields absent for visitors.

## Docs

Add the routes to the API table in `README.md`.
