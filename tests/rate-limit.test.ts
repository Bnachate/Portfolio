import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { sql } from 'drizzle-orm';
import { setupDatabase } from './helpers';
import { getClientIp, rateLimit } from '@/server/rate-limit';
import { db } from '@/server/db';
import { rateLimitHits } from '@/server/db/schema';

const request = (headers: Record<string, string> = {}) => new Request('http://localhost/api', { headers });
const options = { limit: 2, windowMs: 60 * 60 * 1000 };

beforeAll(setupDatabase);

afterEach(() => {
  vi.useRealTimers();
});

describe('getClientIp', () => {
  it('takes the first x-forwarded-for entry (the real client on Vercel)', () => {
    expect(getClientIp(request({ 'x-forwarded-for': '203.0.113.1, 10.0.0.1' }))).toBe('203.0.113.1');
  });

  it('falls back to x-real-ip, then to "unknown"', () => {
    expect(getClientIp(request({ 'x-real-ip': '203.0.113.2' }))).toBe('203.0.113.2');
    expect(getClientIp(request())).toBe('unknown');
  });
});

describe('rateLimit', () => {
  it('never stores raw IP addresses', async () => {
    await rateLimit(request({ 'x-forwarded-for': '203.0.113.10' }), 'privacy', options);
    const rows = await db.select({ key: rateLimitHits.key }).from(rateLimitHits);
    expect(rows.some((row) => row.key.includes('203.0.113.10'))).toBe(false);
  });

  it('counts each action separately', async () => {
    const ip = { 'x-forwarded-for': '203.0.113.20' };
    await rateLimit(request(ip), 'login', options);
    await rateLimit(request(ip), 'login', options);
    await expect(rateLimit(request(ip), 'login', options)).rejects.toMatchObject({ status: 429 });
    // Being blocked on login does not block the contact form
    await expect(rateLimit(request(ip), 'contact', options)).resolves.toBeUndefined();
  });

  it('lets the client through again once the window has passed', async () => {
    const ip = { 'x-forwarded-for': '203.0.113.30' };
    await rateLimit(request(ip), 'window', options);
    await rateLimit(request(ip), 'window', options);
    await expect(rateLimit(request(ip), 'window', options)).rejects.toMatchObject({ status: 429 });

    // Two hours later (only the JS clock moves; stored hits keep their real timestamps)
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(Date.now() + 2 * options.windowMs);
    await expect(rateLimit(request(ip), 'window', options)).resolves.toBeUndefined();
  });

  it('fails open when the rate limit table is unavailable, so the site keeps working', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    await db.execute(sql`drop table rate_limit_hits`);

    await expect(rateLimit(request({ 'x-forwarded-for': '203.0.113.40' }), 'broken', options)).resolves.toBeUndefined();
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('Rate limit check failed'), expect.anything());
    consoleError.mockRestore();
  });
});
