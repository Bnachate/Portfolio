import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';
import { createSessionToken, SESSION_COOKIE } from '@/server/auth/session';

const request = (path: string, token?: string) =>
  new NextRequest(`http://localhost:3000${path}`, {
    headers: token ? { cookie: `${SESSION_COOKIE}=${token}` } : {},
  });

describe('proxy', () => {
  it('sends a logged-in admin from the login page to the admin panel', async () => {
    const token = await createSessionToken({ userId: 1, email: 'admin@example.com' });
    const response = await proxy(request('/auth/login', token));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/admin');
  });

  it('lets visitors reach the login page', async () => {
    const response = await proxy(request('/auth/login'));
    expect(response.headers.get('location')).toBeNull();
  });

  it('ignores an invalid session cookie', async () => {
    const response = await proxy(request('/auth/login', 'forged-token'));
    expect(response.headers.get('location')).toBeNull();
  });
});
