import { NextResponse } from 'next/server';
import { handler } from '@/server/http';
import { SESSION_COOKIE, sessionCookieOptions } from '@/server/auth/session';

export const POST = handler(async () => {
  const response = NextResponse.json({ data: null });
  response.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions, maxAge: 0 });
  return response;
});
