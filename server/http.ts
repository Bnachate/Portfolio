import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from './auth';

/** Uniform JSON responses: `{ data }` on success, `{ message }` on error. */

export const ok = <T>(data: T, status: number = 200): NextResponse<{ data: T }> => NextResponse.json({ data }, { status });

export const fail = (message: string, status: number): NextResponse<{ message: string }> =>
  NextResponse.json({ message }, { status });

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Rejects cross-site state-changing requests (CSRF defence in depth on top of SameSite cookies).
 * Browsers always send Origin on POST/PATCH/PUT/DELETE.
 */
function assertSameOrigin(request: Request): void {
  if (request.method === 'GET' || request.method === 'HEAD') return;
  const origin = request.headers.get('origin');
  if (!origin) return; // Non-browser clients (curl, scripts)
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  // URL.parse returns null for opaque origins such as "null" (sandboxed iframes): rejected too
  if (URL.parse(origin)?.host !== host) {
    throw new HttpError(403, 'Origine non autorisée');
  }
}

export async function requireAdmin(): Promise<{ id: number; email: string; name: string }> {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, 'Non authentifié');
  return user;
}

export async function parseBody<S extends z.ZodType>(request: Request, schema: S): Promise<z.infer<S>> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    throw new HttpError(400, 'Corps de requête JSON invalide');
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    const issue = result.error.issues[0];
    if (!issue) throw new HttpError(400, 'Données invalides');
    const field = issue.path.join('.');
    throw new HttpError(400, field ? `${field}: ${issue.message}` : issue.message);
  }
  return result.data;
}

export function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Identifiant invalide');
  return id;
}

// Next passes `{ params }` to every route handler, even routes without dynamic segments
type RouteContext = { params: Promise<object> };

/**
 * Wraps a route handler: origin check, HttpError -> JSON response, and logging of unexpected errors.
 */
export function handler<C extends RouteContext = RouteContext>(
  fn: (request: Request, context: C) => Promise<Response>,
) {
  return async (request: Request, context: C): Promise<Response> => {
    try {
      assertSameOrigin(request);
      return await fn(request, context);
    } catch (error) {
      if (error instanceof HttpError) return fail(error.message, error.status);
      console.error('Unhandled API error:', error);
      return fail('Erreur interne du serveur', 500);
    }
  };
}
