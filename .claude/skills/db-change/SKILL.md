---
name: db-change
description: Change the database schema of this project safely - edit the Drizzle schema, generate and apply the SQL migration locally (PGlite), update services and tests. Use when a feature needs a new table, column, index or constraint.
---

# Database schema change

## Steps

1. Edit `server/db/schema.ts`. Follow the existing patterns: `serial('id').primaryKey()`, `...timestamps` for editable entities, `onDelete: 'cascade'` on join tables, text enums via `text('x', { enum: [...] })`, indexes in the third `pgTable` argument. Add `relations()` when the table is queried with `with`.
2. Stop anything holding the local PGlite database (`npm run dev`, `npm start`): only one process can open `./.pglite`. If it is the user's server, ask them to stop it rather than killing it.
3. `npm run db:generate`, then read the generated `drizzle/NNNN_*.sql` and check it does exactly what is intended.
4. `npm run db:migrate` to apply it locally.
5. Update the services in `server/services/` and the zod schemas in `server/validation.ts`. Exclude `createdAt` / `updatedAt` from API responses (`columns: { createdAt: false, updatedAt: false }`).
6. Add or update tests; the in-memory test database runs every migration, so `npm test` also validates the migration.
7. Commit `server/db/schema.ts`, the new `drizzle/*.sql` and the updated `drizzle/meta/*` together.

## Rules

- Never edit or delete a migration that has been merged: production has already applied it. Fix forward with a new migration.
- Destructive changes (drop / rename a column or table, narrowing a type, NOT NULL on existing data) can lose production data: explain the impact and get the user's explicit approval first. Prefer two steps: add the new column and backfill, deploy, then remove the old one in a later migration.
- New NOT NULL columns on existing tables need a default or a backfill.
- Store personal data only when needed; hash what only needs comparing (see the IP hashing in `server/rate-limit.ts`).

## Production

Nothing to run by hand: production deployments apply pending migrations in `vercel-build` (`scripts/vercel-migrate.ts`). Preview deployments do not migrate, so a preview of an unmerged schema change can error against the production database; mention it to the user. Data backfills that are not part of the SQL migration go through the `prod-db` skill.
