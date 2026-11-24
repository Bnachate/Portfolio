import { afterEach, describe, expect, it } from 'vitest';
import { SignJWT } from 'jose';
import { createSessionToken, sessionCookieOptions, verifySessionToken } from '@/server/auth/session';

const payload = { userId: 42, email: 'admin@example.com' };
const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET);
const originalSecret = process.env.SESSION_SECRET;

afterEach(() => {
  process.env.SESSION_SECRET = originalSecret;
});

describe('session tokens', () => {
  it('round-trips a valid token', async () => {
    const token = await createSessionToken(payload);
    expect(await verifySessionToken(token)).toEqual(payload);
  });

  it('rejects a missing or malformed token', async () => {
    expect(await verifySessionToken(undefined)).toBeNull();
    expect(await verifySessionToken('not-a-jwt')).toBeNull();
  });

  it('rejects a token whose content was tampered with', async () => {
    const [header, , signature] = (await createSessionToken(payload)).split('.');
    const forgedBody = Buffer.from(JSON.stringify({ sub: '1', email: 'attacker@example.com' })).toString('base64url');
    expect(await verifySessionToken(`${header}.${forgedBody}.${signature}`)).toBeNull();
  });

  it('rejects a token signed with another secret', async () => {
    const token = await new SignJWT({ email: payload.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(String(payload.userId))
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode('another-secret-that-is-also-long-enough!!'));
    expect(await verifySessionToken(token)).toBeNull();
  });

  it('rejects an expired token', async () => {
    const token = await new SignJWT({ email: payload.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(String(payload.userId))
      .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(secret());
    expect(await verifySessionToken(token)).toBeNull();
  });

  it('rejects the "none" algorithm (unsigned token)', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify({ sub: '42', email: payload.email })).toString('base64url');
    expect(await verifySessionToken(`${header}.${body}.`)).toBeNull();
  });

  it('refuses to sign with a missing or too short secret', async () => {
    process.env.SESSION_SECRET = 'short';
    await expect(createSessionToken(payload)).rejects.toThrow(/SESSION_SECRET/);
  });

  it('uses a hardened cookie', () => {
    expect(sessionCookieOptions).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' });
  });
});
