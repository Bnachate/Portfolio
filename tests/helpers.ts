import { runMigrations } from '@/server/db';
import { upsertAdmin } from '@/server/services/users';
import { createSessionToken, SESSION_COOKIE } from '@/server/auth/session';

export const BASE = 'http://localhost:3000';
export const ADMIN = { email: 'admin@example.com', name: 'Admin', password: 'a-very-long-test-password' };

let ready: Promise<void> | undefined;

/** Creates the schema and the admin once per test file. */
export function setupDatabase() {
  ready ??= (async () => {
    await runMigrations();
    await upsertAdmin(ADMIN.email, ADMIN.name, ADMIN.password);
  })();
  return ready;
}

/** Acts as a visitor (no cookie) or as the logged-in admin for the next calls. */
export async function actAs(role: 'visitor' | 'admin') {
  const jar = globalThis as { __testCookies?: Record<string, string> };
  if (role === 'visitor') {
    jar.__testCookies = {};
    return;
  }
  const { verifyCredentials } = await import('@/server/services/users');
  const user = await verifyCredentials(ADMIN.email, ADMIN.password);
  if (!user) throw new Error('Test admin missing');
  jar.__testCookies = { [SESSION_COOKIE]: await createSessionToken({ userId: user.id, email: user.email }) };
}

type CallOptions = { body?: unknown; origin?: string | null; ip?: string; params?: Record<string, string> };

/** Calls a route handler like Next.js would, with a same-origin browser request by default. */
export async function call<C extends { params: Promise<object> }>(
  handler: (request: Request, context: C) => Promise<Response>,
  method: string,
  path: string,
  { body, origin = BASE, ip = '192.0.2.1', params = {} }: CallOptions = {},
) {
  const headers: Record<string, string> = { host: 'localhost:3000', 'x-forwarded-for': ip };
  if (origin !== null) headers.origin = origin;
  if (body !== undefined) headers['content-type'] = 'application/json';
  const request = new Request(BASE + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  // Route params are always strings, as in Next.js
  const response = await handler(request, { params: Promise.resolve(params) } as C);
  const json = await response.json().catch(() => null);
  return { status: response.status, json, headers: response.headers };
}
