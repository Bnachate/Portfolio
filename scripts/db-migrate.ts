import { closeDb, runMigrations } from '../server/db';

/** Applies pending SQL migrations from ./drizzle. Usage: npm run db:migrate */
async function main() {
  await runMigrations();
  console.log('Migrations applied');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
