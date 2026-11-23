import { closeDb, db } from '../server/db';
import { experiences } from '../server/db/schema';
import { insertExperiences, saveCvHero } from './content';

/**
 * Replaces the experiences and the hero section with the CV content (see scripts/content.ts).
 * Projects, contact messages and users are left untouched.
 * Everything runs in one transaction: on error, nothing is changed.
 * Usage: npm run content:sync
 */
async function main() {
  const synced = await db.transaction(async (tx) => {
    // Links to tags are removed by the ON DELETE CASCADE on experience_tags
    await tx.delete(experiences);
    const result = await insertExperiences(tx);
    await saveCvHero(tx, { overwrite: true });
    return result;
  });

  console.log(`Synced ${synced.experiences} experiences (${synced.tags} tags) and the hero section`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
