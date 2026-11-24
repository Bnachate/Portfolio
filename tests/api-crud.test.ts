import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { ADMIN, actAs, call, setupDatabase } from './helpers';
import * as experiences from '@/app/api/experiences/route';
import * as experience from '@/app/api/experiences/[id]/route';
import * as projects from '@/app/api/projects/route';
import * as project from '@/app/api/projects/[id]/route';
import * as tags from '@/app/api/tags/route';
import * as tag from '@/app/api/tags/[id]/route';
import * as contacts from '@/app/api/contacts/route';
import * as contact from '@/app/api/contacts/[id]/route';
import * as hero from '@/app/api/hero/route';
import * as me from '@/app/api/auth/me/route';
import * as logout from '@/app/api/auth/logout/route';
import { db } from '@/server/db';
import { users } from '@/server/db/schema';

beforeAll(setupDatabase);
beforeEach(() => actAs('admin'));

async function createTag(name: string): Promise<number> {
  const { json } = await call(tags.POST, 'POST', '/api/tags', { body: { name } });
  return json.data.id;
}

describe('experiences CRUD', () => {
  const base = { job: 'Développeur', company: 'ACME', description: 'Missions', startDate: '2023-01-01' };

  it('creates, lists in position order, updates and deletes an experience', async () => {
    const vue = await createTag('Vue.js');
    const java = await createTag('Java');

    const older = await call(experiences.POST, 'POST', '/api/experiences', { body: { ...base, position: 1, tags: [vue] } });
    expect(older.status).toBe(201);
    expect(older.json.data.tags.map((t: { name: string }) => t.name)).toEqual(['Vue.js']);
    const newer = await call(experiences.POST, 'POST', '/api/experiences', { body: { ...base, job: 'Lead', position: 0 } });

    const list = await call(experiences.GET, 'GET', '/api/experiences');
    expect(list.json.data.map((e: { job: string }) => e.job)).toEqual(['Lead', 'Développeur']);

    const id = String(older.json.data.id);
    const updated = await call(experience.PATCH, 'PATCH', `/api/experiences/${id}`, {
      body: { endDate: '2025-06-01', tags: [java] },
      params: { id },
    });
    expect(updated.status).toBe(200);
    expect(updated.json.data).toMatchObject({ endDate: '2025-06-01', job: 'Développeur' });
    expect(updated.json.data.tags.map((t: { name: string }) => t.name)).toEqual(['Java']);

    expect((await call(experience.DELETE, 'DELETE', `/api/experiences/${id}`, { params: { id } })).status).toBe(200);
    expect((await call(experience.DELETE, 'DELETE', `/api/experiences/${id}`, { params: { id } })).status).toBe(404);

    const newerId = String(newer.json.data.id);
    await call(experience.DELETE, 'DELETE', `/api/experiences/${newerId}`, { params: { id: newerId } });
  });

  it('rejects an end date before the start date, also on update', async () => {
    const created = await call(experiences.POST, 'POST', '/api/experiences', { body: base });
    const id = String(created.json.data.id);
    const { status } = await call(experience.PATCH, 'PATCH', `/api/experiences/${id}`, {
      body: { endDate: '2020-01-01' },
      params: { id },
    });
    expect(status).toBe(400);
  });

  it('rejects unknown tags and unknown experiences', async () => {
    expect((await call(experiences.POST, 'POST', '/api/experiences', { body: { ...base, tags: [999999] } })).status).toBe(400);
    expect((await call(experience.PATCH, 'PATCH', '/api/experiences/999999', { body: { job: 'X' }, params: { id: '999999' } })).status).toBe(404);
  });
});

describe('projects CRUD', () => {
  const base = { title: 'Portfolio', description: 'Mon site', projectImageUrl: 'https://example.com/shot.png' };

  it('creates, updates and deletes a project', async () => {
    const created = await call(projects.POST, 'POST', '/api/projects', { body: { ...base, githubUrl: 'https://github.com/x/y' } });
    expect(created.status).toBe(201);
    const id = String(created.json.data.id);

    const updated = await call(project.PATCH, 'PATCH', `/api/projects/${id}`, {
      body: { title: 'Portfolio v2', githubUrl: '' },
      params: { id },
    });
    expect(updated.json.data).toMatchObject({ title: 'Portfolio v2', githubUrl: null });

    expect((await call(project.DELETE, 'DELETE', `/api/projects/${id}`, { params: { id } })).status).toBe(200);
    expect((await call(project.PATCH, 'PATCH', `/api/projects/${id}`, { body: { title: 'X' }, params: { id } })).status).toBe(404);
  });

  it('rejects javascript: links', async () => {
    const { status } = await call(projects.POST, 'POST', '/api/projects', { body: { ...base, demoUrl: 'javascript:alert(1)' } });
    expect(status).toBe(400);
  });
});

describe('deleting a tag', () => {
  it('removes it from the experiences and projects using it, and usage counts follow', async () => {
    const shared = await createTag('Docker');
    const exp = await call(experiences.POST, 'POST', '/api/experiences', {
      body: { job: 'Ops', company: 'ACME', description: 'Infra', startDate: '2022-01-01', tags: [shared] },
    });
    await call(projects.POST, 'POST', '/api/projects', {
      body: { title: 'Infra', description: 'IaC', projectImageUrl: 'https://example.com/i.png', tags: [shared] },
    });

    const usage = await call(tags.GET, 'GET', '/api/tags?usage=1');
    expect(usage.json.data.find((t: { id: number }) => t.id === shared)).toMatchObject({ experienceCount: 1, projectCount: 1 });

    const id = String(shared);
    expect((await call(tag.DELETE, 'DELETE', `/api/tags/${id}`, { params: { id } })).status).toBe(200);

    const list = await call(experiences.GET, 'GET', '/api/experiences');
    const updated = list.json.data.find((e: { id: number }) => e.id === exp.json.data.id);
    expect(updated.tags).toEqual([]);
  });
});

describe('contact messages', () => {
  it('lets the admin read, mark as done and delete a message', async () => {
    await actAs('visitor');
    await call(contacts.POST, 'POST', '/api/contacts', {
      body: { name: 'Ada', email: 'ada@example.com', subject: 'Mission', message: 'Bonjour' },
      ip: '198.51.100.9',
    });

    await actAs('admin');
    const list = await call(contacts.GET, 'GET', '/api/contacts');
    expect(list.json.data[0]).toMatchObject({ name: 'Ada', subject: 'Mission', status: 'new' });
    const id = String(list.json.data[0].id);

    const done = await call(contact.PATCH, 'PATCH', `/api/contacts/${id}`, { body: { status: 'done' }, params: { id } });
    expect(done.json.data.status).toBe('done');
    expect((await call(contact.PATCH, 'PATCH', `/api/contacts/${id}`, { body: { status: 'spam' }, params: { id } })).status).toBe(400);

    expect((await call(contact.DELETE, 'DELETE', `/api/contacts/${id}`, { params: { id } })).status).toBe(200);
    expect((await call(contact.DELETE, 'DELETE', `/api/contacts/${id}`, { params: { id } })).status).toBe(404);
  });
});

describe('hero', () => {
  const data = {
    title: 'Développeur Full-Stack',
    subtitle: 'Vue.js, React',
    description: 'Bonjour',
    primaryButtonText: 'Me contacter',
    primaryButtonUrl: '#contact',
    secondaryButtonText: 'Projets',
    secondaryButtonUrl: '#projets',
    githubUrl: 'https://github.com/someone',
    linkedinUrl: 'https://www.linkedin.com/in/someone/',
    email: 'private@example.com',
  };

  it('saves the hero, and only the admin gets the email back', async () => {
    expect((await call(hero.PUT, 'PUT', '/api/hero', { body: data })).status).toBe(200);
    expect((await call(hero.GET, 'GET', '/api/hero')).json.data).toEqual(data);

    await actAs('visitor');
    const publicHero = (await call(hero.GET, 'GET', '/api/hero')).json.data;
    expect(publicHero.title).toBe(data.title);
    expect(publicHero).not.toHaveProperty('email');
  });

  it('rejects an invalid link', async () => {
    const { status } = await call(hero.PUT, 'PUT', '/api/hero', { body: { ...data, primaryButtonUrl: 'javascript:alert(1)' } });
    expect(status).toBe(400);
  });
});

describe('request parsing', () => {
  it('answers 400 to an invalid JSON body or id', async () => {
    const response = await tags.POST(
      new Request('http://localhost:3000/api/tags', {
        method: 'POST',
        headers: { host: 'localhost:3000', origin: 'http://localhost:3000', 'content-type': 'application/json' },
        body: '{not json',
      }),
      { params: Promise.resolve({}) },
    );
    expect(response.status).toBe(400);
    expect((await call(tag.DELETE, 'DELETE', '/api/tags/abc', { params: { id: 'abc' } })).status).toBe(400);
  });
});

// Kept last: it deletes the admin
describe('session', () => {
  it('returns the logged-in admin without the password hash', async () => {
    const { status, json } = await call(me.GET, 'GET', '/api/auth/me');
    expect(status).toBe(200);
    expect(json.data).toMatchObject({ email: ADMIN.email, name: ADMIN.name });
    expect(JSON.stringify(json.data)).not.toMatch(/password|\$2[aby]\$/);
  });

  it('answers 401 to visitors', async () => {
    await actAs('visitor');
    expect((await call(me.GET, 'GET', '/api/auth/me')).status).toBe(401);
  });

  it('clears the session cookie on logout', async () => {
    const { headers } = await call(logout.POST, 'POST', '/api/auth/logout');
    expect(headers.get('set-cookie')).toMatch(/session=;.*Max-Age=0/i);
  });

  it('revokes the sessions of a deleted user, even with a valid token', async () => {
    await db.delete(users).where(eq(users.email, ADMIN.email));
    expect((await call(me.GET, 'GET', '/api/auth/me')).status).toBe(401);
  });
});
