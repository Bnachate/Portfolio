import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from './server/auth/session';

/**
 * Runs before /auth pages: /auth/login with a valid session -> redirect to /admin.
 * /admin itself is public (read-only for visitors), and every API route checks the session itself.
 */
export async function proxy(request: NextRequest): Promise<NextResponse<unknown>> {
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (request.nextUrl.pathname.startsWith('/auth/login') && session) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/:path*'],
};
