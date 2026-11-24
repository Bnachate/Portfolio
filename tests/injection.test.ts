import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { actAs, call, setupDatabase } from './helpers';
import * as tags from '@/app/api/tags/route';
import * as contacts from '@/app/api/contacts/route';
import * as experiences from '@/app/api/experiences/route';
import * as projects from '@/app/api/projects/route';
import * as hero from '@/app/api/hero/route';
import * as login from '@/app/api/auth/login/route';

beforeAll(setupDatabase);
beforeEach(() => actAs('admin'));

// Classic payloads: they must be either refused or stored as plain text (React escapes them on display)
const TEXT_PAYLOADS = [
  '<script>alert(1)</script>',
  '"><img src=x onerror=alert(1)>',
  "' OR 1=1 --",
  "'; DROP TABLE tags; --",
  '{{constructor.constructor("alert(1)")()}}',
  '${7*7}',
  '../../etc/passwd',
  'Émoji 🚀 et accents àéîõü',
];

const DANGEROUS_URLS = [
  'javascript:alert(1)',
  'JAVASCRIPT:alert(1)',
  ' javascript:alert(1)',
  'java\tscript:alert(1)',
  'data:text/html,<script>alert(1)</script>',
  'vbscript:msgbox(1)',
  'file:///etc/passwd',
];

const validHero = {
  title: 'Titre',
  subtitle: 'Sous-titre',
  description: 'Description',
  primaryButtonText: 'Contact',
  primaryButtonUrl: '#contact',
  secondaryButtonText: 'Projets',
  secondaryButtonUrl: '#projets',
  githubUrl: 'https://github.com/someone',
  linkedinUrl: 'https://www.linkedin.com/in/someone/',
  email: 'me@example.com',
};

describe('text payloads are stored verbatim, never executed or interpreted', () => {
  it.each(TEXT_PAYLOADS)('tag name %j', async (payload) => {
    const created = await call(tags.POST, 'POST', '/api/tags', { body: { name: payload } });
    expect(created.status).toBe(201);
    expect(created.json.data.name).toBe(payload.trim());
  });

  it('SQL-looking input does not alter the database', async () => {
    const list = await call(tags.GET, 'GET', '/api/tags');
    expect(list.status).toBe(200);
    expect(list.json.data.map((t: { name: string }) => t.name)).toContain("'; DROP TABLE tags; --");
  });

  it('contact messages keep payloads as plain text', async () => {
    await actAs('visitor');
    const body = { name: TEXT_PAYLOADS[1], email: 'ada@example.com', subject: TEXT_PAYLOADS[0], message: TEXT_PAYLOADS.join('\n') };
    expect((await call(contacts.POST, 'POST', '/api/contacts', { body, ip: '203.0.113.90' })).status).toBe(201);

    await actAs('admin');
    const [stored] = (await call(contacts.GET, 'GET', '/api/contacts')).json.data;
    expect(stored).toMatchObject({ name: body.name, subject: body.subject, message: body.message });
  });
});

describe('dangerous links are refused', () => {
  it.each(DANGEROUS_URLS)('project link %j', async (url) => {
    const body = { title: 'P', description: 'D', projectImageUrl: 'https://example.com/i.png', githubUrl: url };
    expect((await call(projects.POST, 'POST', '/api/projects', { body })).status).toBe(400);
  });

  it.each(DANGEROUS_URLS)('project image %j', async (url) => {
    const body = { title: 'P', description: 'D', projectImageUrl: url };
    expect((await call(projects.POST, 'POST', '/api/projects', { body })).status).toBe(400);
  });

  // Browsers read "/\" as "//" and strip tabs / line breaks, so all of these would lead to another site
  const OFFSITE_LINKS = ['//evil.example', '/\\evil.example', '\\\\evil.example', '/\t/evil.example', '/\n/evil.example'];

  it.each([...DANGEROUS_URLS, ...OFFSITE_LINKS])('hero button link %j', async (url) => {
    expect((await call(hero.PUT, 'PUT', '/api/hero', { body: { ...validHero, primaryButtonUrl: url } })).status).toBe(400);
  });

  it('keeps legitimate links working', async () => {
    const body = { ...validHero, primaryButtonUrl: '/CV.pdf', secondaryButtonUrl: 'https://example.com/a?b=c#d' };
    expect((await call(hero.PUT, 'PUT', '/api/hero', { body })).status).toBe(200);
  });
});

describe('empty and whitespace-only input is refused by every route', () => {
  const blank = ['', '   ', '\n\t '];

  it.each(blank)('tag name %j', async (value) => {
    expect((await call(tags.POST, 'POST', '/api/tags', { body: { name: value } })).status).toBe(400);
  });

  it.each(blank)('contact fields %j', async (value) => {
    await actAs('visitor');
    for (const field of ['name', 'subject', 'message']) {
      const body = { name: 'Ada', email: 'ada@example.com', subject: 'Sujet', message: 'Message', [field]: value };
      expect((await call(contacts.POST, 'POST', '/api/contacts', { body, ip: '203.0.113.91' })).status).toBe(400);
    }
  });

  it.each(blank)('experience, project and hero fields %j', async (value) => {
    const experience = { job: value, company: 'ACME', description: 'D', startDate: '2024-01-01' };
    expect((await call(experiences.POST, 'POST', '/api/experiences', { body: experience })).status).toBe(400);
    const project = { title: value, description: 'D', projectImageUrl: 'https://example.com/i.png' };
    expect((await call(projects.POST, 'POST', '/api/projects', { body: project })).status).toBe(400);
    expect((await call(hero.PUT, 'PUT', '/api/hero', { body: { ...validHero, title: value } })).status).toBe(400);
  });

  it('login with an empty password', async () => {
    const { status } = await call(login.POST, 'POST', '/api/auth/login', {
      body: { email: 'admin@example.com', password: '' },
      ip: '203.0.113.92',
    });
    expect(status).toBe(400);
  });
});

describe('malformed or hostile request bodies', () => {
  it('refuses an email carrying extra headers', async () => {
    await actAs('visitor');
    const body = { name: 'Ada', email: 'ada@example.com\r\nBcc: victim@example.com', subject: 'S', message: 'M' };
    expect((await call(contacts.POST, 'POST', '/api/contacts', { body, ip: '203.0.113.93' })).status).toBe(400);
  });

  it('refuses text longer than the limits', async () => {
    expect((await call(tags.POST, 'POST', '/api/tags', { body: { name: 'x'.repeat(51) } })).status).toBe(400);
  });

  it('refuses null bytes with a 400 instead of a database error', async () => {
    expect((await call(tags.POST, 'POST', '/api/tags', { body: { name: 'abc\u0000def' } })).status).toBe(400);
    const body = { title: 'P', description: 'D', projectImageUrl: 'https://example.com/i\u0000.png' };
    expect((await call(projects.POST, 'POST', '/api/projects', { body })).status).toBe(400);
  });

  it('keeps line breaks in long texts', async () => {
    const body = { job: 'Dev', company: 'ACME', description: '• Ligne 1\n• Ligne 2\r\n\tfin', startDate: '2024-01-01' };
    const created = await call(experiences.POST, 'POST', '/api/experiences', { body });
    expect(created.status).toBe(201);
    expect(created.json.data.description).toBe(body.description);
  });

  it('ignores unknown fields and cannot pollute object prototypes', async () => {
    const created = await call(tags.POST, 'POST', '/api/tags', {
      body: JSON.parse('{"name":"Proto","__proto__":{"polluted":true},"id":999999,"isAdmin":true}'),
    });
    expect(created.status).toBe(201);
    expect(created.json.data.id).not.toBe(999999);
    expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
  });

  it('refuses non-object bodies', async () => {
    for (const body of [null, 'name', 42, ['name']]) {
      expect((await call(tags.POST, 'POST', '/api/tags', { body })).status).toBe(400);
    }
  });
});
