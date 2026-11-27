import { count } from 'drizzle-orm';
import { closeDb, db, type Transaction } from '../server/db';
import { onlyRow } from '../server/db/rows';
import { experiences } from '../server/db/schema';
import { insertExperiences, saveCvHero } from './content';

/**
 * Fills an empty database with the CV content (see scripts/content.ts).
 * Safe to run several times: it does nothing if experiences already exist.
 * To overwrite existing content, use `npm run content:sync` instead.
 * Usage: npm run db:seed
 */
async function main(): Promise<void> {
  const { value: existing } = onlyRow(await db.select({ value: count() }).from(experiences), 'count experiences');
  if (existing > 0) {
    console.log('Database already has experiences, skipping seed (use content:sync to overwrite)');
    return;
  }

  const seeded = await db.transaction(async (tx: Transaction) => {
    const result = await insertExperiences(tx);
    await saveCvHero(tx, { overwrite: false });
    return result;
  });

  console.log(`Seeded ${seeded.experiences} experiences, ${seeded.tags} tags and the hero section`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
