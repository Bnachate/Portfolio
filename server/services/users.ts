import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';

const BCRYPT_COST = 12;

// Compared against when the email is unknown, so response time does not reveal which emails exist
const DUMMY_HASH = bcrypt.hashSync('timing-safe-dummy-password', BCRYPT_COST);

export async function verifyCredentials(email: string, password: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) return null;
  return { id: user.id, email: user.email, name: user.name };
}

/** Creates the admin, or resets its name/password if the email already exists. */
export async function upsertAdmin(email: string, name: string, password: string) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  const [user] = await db
    .insert(users)
    .values({ email: email.toLowerCase(), name, passwordHash })
    .onConflictDoUpdate({ target: users.email, set: { name, passwordHash } })
    .returning({ id: users.id, email: users.email });
  return user;
}
