import { createHash } from 'node:crypto';
import { and, count, eq, gte, lt } from 'drizzle-orm';
import { db } from './db';
import { onlyRow } from './db/rows';
import { rateLimitHits } from './db/schema';
import { HttpError } from './http';

/**
 * Best-effort client IP. On Vercel, `x-forwarded-for` is set by the platform
 * (its first entry is the real client), so it cannot be spoofed by the visitor.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// IPs are personal data: only a salted hash is stored
function hashIp(ip: string): string {
  return createHash('sha256').update(`${process.env.SESSION_SECRET ?? ''}:${ip}`).digest('hex').slice(0, 32);
}

/**
 * Allows at most `limit` hits per `windowMs` for this action and client, otherwise throws a 429.
 * Fails open: if the database check itself fails, the request is let through (and logged),
 * so a rate-limit outage never breaks the contact form.
 */
export async function rateLimit(request: Request, action: string, { limit, windowMs }: { limit: number; windowMs: number }): Promise<void> {
  const key = `${action}:${hashIp(getClientIp(request))}`;
  const since = new Date(Date.now() - windowMs);

  let hits: number;
  try {
    const rows = await db
      .select({ value: count() })
      .from(rateLimitHits)
      .where(and(eq(rateLimitHits.key, key), gte(rateLimitHits.createdAt, since)));
    hits = onlyRow(rows, 'rate limit count').value;
    if (hits < limit) {
      await db.insert(rateLimitHits).values({ key });
      // Housekeeping: drop this client's expired hits
      await db.delete(rateLimitHits).where(and(eq(rateLimitHits.key, key), lt(rateLimitHits.createdAt, since)));
    }
  } catch (error) {
    console.error('Rate limit check failed, letting the request through:', error);
    return;
  }

  if (hits >= limit) throw new HttpError(429, 'Trop de tentatives. Merci de réessayer un peu plus tard.');
}
