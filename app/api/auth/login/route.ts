import { NextResponse } from 'next/server';
import { handler, parseBody } from '@/server/http';
import { loginSchema } from '@/server/validation';
import { rateLimit } from '@/server/rate-limit';
import { verifyCredentials } from '@/server/services/users';
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from '@/server/auth/session';

export const POST = handler(async (request: Request) => {
  const { email, password } = await parseBody(request, loginSchema);
  // Brute-force protection: at most 5 attempts per 15 minutes from the same visitor
  await rateLimit(request, 'login', { limit: 5, windowMs: 15 * 60 * 1000 });
  const user = await verifyCredentials(email, password);
  if (!user) {
    return NextResponse.json({ message: 'Email ou mot de passe incorrect' }, { status: 401 });
  }

  const token = await createSessionToken({ userId: user.id, email: user.email });
  const response = NextResponse.json({ data: user });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
});
