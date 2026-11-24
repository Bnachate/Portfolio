import { vi } from 'vitest';

// Throwaway in-memory database and a fixed secret: tests never touch ./.pglite or real data
process.env.PGLITE_DATA_DIR = 'memory://';
process.env.SESSION_SECRET = 'test-secret-that-is-long-enough-for-hs256-signing';
delete process.env.DATABASE_URL;
delete process.env.RESEND_API_KEY;

/**
 * Route handlers read the session cookie through next/headers, which only works inside
 * a real Next.js request. Tests set `globalThis.__testCookies` instead.
 */
vi.mock('next/headers', () => ({
  cookies: async () => {
    const jar = (globalThis as { __testCookies?: Record<string, string> }).__testCookies ?? {};
    return { get: (name: string) => (name in jar ? { name, value: jar[name] } : undefined) };
  },
}));

// `after()` needs a Next.js request scope: run the callback right away in tests
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  return { ...actual, after: (task: () => unknown) => void Promise.resolve().then(task) };
});
