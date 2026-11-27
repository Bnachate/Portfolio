import { rm } from 'node:fs/promises';
import path from 'node:path';
import { closeDb, db, PGLITE_DIR, runMigrations, type Transaction } from '../server/db';
import { upsertAdmin } from '../server/services/users';
import { createContact } from '../server/services/contacts';
import { insertExperiences, saveCvHero } from './content';

/**
 * Recreates the throwaway database used by the Playwright tests (run by playwright.config.ts
 * before the server starts): schema, CV content and a test admin.
 * Refuses to touch the real local database or a remote one.
 */
async function main(): Promise<void> {
  const dataDir = process.env.PGLITE_DATA_DIR;
  const { E2E_ADMIN_EMAIL: email, E2E_ADMIN_PASSWORD: password } = process.env;
  if (!dataDir || dataDir.startsWith('memory://') || path.resolve(dataDir) === PGLITE_DIR) {
    throw new Error('PGLITE_DATA_DIR must point to a dedicated E2E folder (e.g. ./.pglite-e2e)');
  }
  if (process.env.DATABASE_URL) throw new Error('DATABASE_URL must not be set for E2E tests');
  if (!email || !password) throw new Error('E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD are required');

  await rm(dataDir, { recursive: true, force: true });
  await runMigrations();
  await db.transaction(async (tx: Transaction) => {
    await insertExperiences(tx);
    await saveCvHero(tx, { overwrite: true });
  });
  await upsertAdmin(email, 'E2E Admin', password);
  // One message in the inbox from the start (stored directly: the contact form is rate limited)
  await createContact({
    name: 'Seed Visitor',
    email: 'seed@example.com',
    subject: 'Message de démonstration',
    message: 'Bonjour, ceci est un message créé pour les tests.',
  });
  console.log(`E2E database ready in ${dataDir}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
