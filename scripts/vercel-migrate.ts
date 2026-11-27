import { closeDb, runMigrations } from '../server/db';

/**
 * Runs before `next build` on Vercel (see the `vercel-build` script in package.json).
 * - Production deployments: applies pending migrations to the production database,
 *   so a schema change can never be deployed without its tables.
 * - Preview deployments: skipped, so an unmerged pull request never alters the production database.
 * Migrations are idempotent: already applied ones are skipped.
 */
async function main(): Promise<void> {
  if (process.env.VERCEL_ENV !== 'production') {
    console.log(`Skipping database migrations (VERCEL_ENV=${process.env.VERCEL_ENV ?? 'unset'})`);
    return;
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be available at build time to run migrations');
  }
  await runMigrations();
  console.log('Database migrations applied');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    // Fail the deployment: shipping code without its database schema would break the site
    process.exitCode = 1;
  })
  .finally(closeDb);
