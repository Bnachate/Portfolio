import { defineConfig } from 'drizzle-kit';

// Only used by `npm run db:generate` to create SQL migrations from the schema.
// Migrations are applied by `npm run db:migrate` (scripts/db-migrate.ts).
export default defineConfig({
  dialect: 'postgresql',
  schema: './server/db/schema.ts',
  out: './drizzle',
});
