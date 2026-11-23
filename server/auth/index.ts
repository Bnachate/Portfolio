import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { SESSION_COOKIE, verifySessionToken } from './session';

/**
 * Returns the logged-in admin, or null.
 * Also checks that the user still exists, so deleting a user revokes its sessions.
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return null;

  const [user] = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user ?? null;
}
