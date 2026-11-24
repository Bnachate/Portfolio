import { beforeAll, describe, expect, it } from 'vitest';
import { ADMIN, actAs, call, setupDatabase } from './helpers';
import * as experiences from '@/app/api/experiences/route';
import * as experience from '@/app/api/experiences/[id]/route';
import * as projects from '@/app/api/projects/route';
import * as tags from '@/app/api/tags/route';
import * as tag from '@/app/api/tags/[id]/route';
import * as contacts from '@/app/api/contacts/route';
import * as contact from '@/app/api/contacts/[id]/route';
import * as hero from '@/app/api/hero/route';
import * as login from '@/app/api/auth/login/route';

beforeAll(setupDatabase);

describe('visitors (read-only)', () => {
  beforeAll(() => actAs('visitor'));

  it('can read the public content', async () => {
    for (const handler of [experiences.GET, projects.GET, tags.GET, hero.GET]) {
      expect((await call(handler, 'GET', '/api')).status).toBe(200);
    }
  });

  it('never receive the contact email from the hero', async () => {
    const { json } = await call(hero.GET, 'GET', '/api/hero');
    expect(json.data).not.toHaveProperty('email');
  });

  it('cannot read contact messages', async () => {
    expect((await call(contacts.GET, 'GET', '/api/contacts')).status).toBe(401);
  });

  it('cannot change anything', async () => {
    const attempts = [
      call(tags.POST, 'POST', '/api/tags', { body: { name: 'Hack' } }),
      call(tag.PATCH, 'PATCH', '/api/tags/1', { body: { name: 'Hack' }, params: { id: '1' } }),
      call(tag.DELETE, 'DELETE', '/api/tags/1', { params: { id: '1' } }),
      call(experiences.POST, 'POST', '/api/experiences', { body: {} }),
      call(experience.DELETE, 'DELETE', '/api/experiences/1', { params: { id: '1' } }),
      call(projects.POST, 'POST', '/api/projects', { body: {} }),
      call(hero.PUT, 'PUT', '/api/hero', { body: {} }),
      call(contact.DELETE, 'DELETE', '/api/contacts/1', { params: { id: '1' } }),
    ];
    for (const { status } of await Promise.all(attempts)) expect(status).toBe(401);
  });
});

describe('CSRF protection', () => {
  beforeAll(() => actAs('admin'));

  it('rejects writes coming from another site, even with a valid session', async () => {
    const { status } = await call(tags.POST, 'POST', '/api/tags', { body: { name: 'X' }, origin: 'https://evil.example' });
    expect(status).toBe(403);
  });

  it('rejects opaque "null" origins', async () => {
    const { status } = await call(tags.POST, 'POST', '/api/tags', { body: { name: 'X' }, origin: 'null' });
    expect(status).toBe(403);
  });
});

describe('admin', () => {
  beforeAll(() => actAs('admin'));

  it('creates, renames and deletes a tag', async () => {
    const created = await call(tags.POST, 'POST', '/api/tags', { body: { name: 'Svelte' } });
    expect(created.status).toBe(201);
    const id = String(created.json.data.id);

    const renamed = await call(tag.PATCH, 'PATCH', `/api/tags/${id}`, { body: { name: 'SvelteKit' }, params: { id } });
    expect(renamed.json.data.name).toBe('SvelteKit');

    expect((await call(tag.DELETE, 'DELETE', `/api/tags/${id}`, { params: { id } })).status).toBe(200);
  });

  it('refuses duplicate tag names, whatever the case', async () => {
    expect((await call(tags.POST, 'POST', '/api/tags', { body: { name: 'Go' } })).status).toBe(201);
    expect((await call(tags.POST, 'POST', '/api/tags', { body: { name: 'go' } })).status).toBe(409);
  });

  it('receives the contact email from the hero', async () => {
    const { json } = await call(hero.GET, 'GET', '/api/hero');
    expect(json.data).toHaveProperty('email');
  });
});

describe('contact form', () => {
  beforeAll(() => actAs('visitor'));
  const message = { name: 'Ada', email: 'ada@example.com', subject: 'Hello', message: 'Hi!' };

  it('silently drops bots that fill the honeypot', async () => {
    const { status } = await call(contacts.POST, 'POST', '/api/contacts', { body: { ...message, website: 'spam' }, ip: '192.0.2.50' });
    expect(status).toBe(201);
    await actAs('admin');
    const { json } = await call(contacts.GET, 'GET', '/api/contacts');
    expect(json.data).toHaveLength(0);
    await actAs('visitor');
  });

  it('accepts 5 messages per hour from the same visitor, then answers 429', async () => {
    const statuses = [];
    for (let i = 0; i < 6; i++) {
      statuses.push((await call(contacts.POST, 'POST', '/api/contacts', { body: message, ip: '192.0.2.60' })).status);
    }
    expect(statuses).toEqual([201, 201, 201, 201, 201, 429]);
    // Another visitor is not affected
    expect((await call(contacts.POST, 'POST', '/api/contacts', { body: message, ip: '192.0.2.61' })).status).toBe(201);
  });
});

describe('login', () => {
  it('logs the admin in and sets an HttpOnly session cookie', async () => {
    const { status, headers } = await call(login.POST, 'POST', '/api/auth/login', {
      body: { email: ADMIN.email, password: ADMIN.password },
      ip: '192.0.2.70',
    });
    expect(status).toBe(200);
    expect(headers.get('set-cookie')).toMatch(/session=.+HttpOnly/i);
  });

  it('blocks brute force after 5 attempts in 15 minutes', async () => {
    const statuses = [];
    for (let i = 0; i < 6; i++) {
      const body = { email: ADMIN.email, password: 'wrong-password' };
      statuses.push((await call(login.POST, 'POST', '/api/auth/login', { body, ip: '192.0.2.80' })).status);
    }
    expect(statuses).toEqual([401, 401, 401, 401, 401, 429]);
  });
});
