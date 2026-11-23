import { NextResponse } from 'next/server';
import { handler, parseBody } from '@/server/http';
import { loginSchema } from '@/server/validation';
import { verifyCredentials } from '@/server/services/users';
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from '@/server/auth/session';

export const POST = handler(async (request) => {
  const { email, password } = await parseBody(request, loginSchema);
  const user = await verifyCredentials(email, password);
  if (!user) {
    return NextResponse.json({ message: 'Email ou mot de passe incorrect' }, { status: 401 });
  }

  const token = await createSessionToken({ userId: user.id, email: user.email });
  const response = NextResponse.json({ data: user });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
});
