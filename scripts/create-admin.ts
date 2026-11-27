import { closeDb } from '../server/db';
import { upsertAdmin } from '../server/services/users';

/**
 * Creates the admin account, or resets its password if it already exists.
 * Usage: ADMIN_PASSWORD='...' npm run admin:create -- you@example.com "Your Name"
 * (The password is read from the environment so it does not end up in shell history.)
 */
async function main(): Promise<void> {
  const [email, name = 'Admin'] = process.argv.slice(2);
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Usage: ADMIN_PASSWORD=... npm run admin:create -- <email> [name]');
  }
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters long');
  }

  const user = await upsertAdmin(email, name, password);
  console.log(`Admin ready: ${user.email} (id ${user.id})`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(closeDb);
