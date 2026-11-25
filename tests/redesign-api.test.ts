import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { actAs, call, setupDatabase } from './helpers';
import * as experiences from '@/app/api/experiences/route';
import * as experienceOrder from '@/app/api/experiences/order/route';
import * as projects from '@/app/api/projects/route';
import * as project from '@/app/api/projects/[id]/route';
import * as projectOrder from '@/app/api/projects/order/route';
import * as tags from '@/app/api/tags/route';
import * as tag from '@/app/api/tags/[id]/route';
import * as hero from '@/app/api/hero/route';
import * as skillDomains from '@/app/api/skill-domains/route';
import { defaultTagDomain } from '@/app/config/tag-domains';

beforeAll(setupDatabase);
beforeEach(() => actAs('admin'));

const newExperience = (job: string) => ({ job, company: 'ACME', description: 'Missions', startDate: '2024-01-01' });
const newProject = (title: string) => ({ title, description: 'Description', projectImageUrl: 'https://example.com/i.png' });

describe('display order (move up / down)', () => {
  it('saves the new order of the experiences', async () => {
    const ids: number[] = [];
    for (const job of ['A', 'B', 'C']) {
      ids.push((await call(experiences.POST, 'POST', '/api/experiences', { body: newExperience(job) })).json.data.id);
    }
    const reordered = await call(experienceOrder.PUT, 'PUT', '/api/experiences/order', { body: { ids: [ids[2], ids[0], ids[1]] } });
    expect(reordered.status).toBe(200);
    expect(reordered.json.data.map((e: { job: string }) => e.job)).toEqual(['C', 'A', 'B']);
    expect(reordered.json.data.map((e: { position: number }) => e.position)).toEqual([0, 1, 2]);
  });

  it('saves the new order of the projects', async () => {
    const first = (await call(projects.POST, 'POST', '/api/projects', { body: newProject('First') })).json.data.id;
    const second = (await call(projects.POST, 'POST', '/api/projects', { body: newProject('Second') })).json.data.id;
    const reordered = await call(projectOrder.PUT, 'PUT', '/api/projects/order', { body: { ids: [second, first] } });
    expect(reordered.json.data.map((p: { title: string }) => p.title)).toEqual(['Second', 'First']);
  });

  it('refuses a stale list (an item missing) with a 409', async () => {
    const all = (await call(experiences.GET, 'GET', '/api/experiences')).json.data.map((e: { id: number }) => e.id);
    const { status, json } = await call(experienceOrder.PUT, 'PUT', '/api/experiences/order', { body: { ids: all.slice(1) } });
    expect(status).toBe(409);
    expect(json.message).toMatch(/rechargez/);
  });

  it('refuses duplicates, empty lists and visitors', async () => {
    expect((await call(experienceOrder.PUT, 'PUT', '/api/experiences/order', { body: { ids: [1, 1] } })).status).toBe(400);
    expect((await call(experienceOrder.PUT, 'PUT', '/api/experiences/order', { body: { ids: [] } })).status).toBe(400);
    await actAs('visitor');
    expect((await call(projectOrder.PUT, 'PUT', '/api/projects/order', { body: { ids: [1] } })).status).toBe(401);
  });
});

describe('tag domains', () => {
  // The migrations create the 5 initial domains
  const domainId = async (name: string) =>
    (await call(skillDomains.GET, 'GET', '/api/skill-domains')).json.data.find((d: { name: string }) => d.name === name).id as number;

  it('creates a tag with a domain and lists it publicly', async () => {
    const frontEnd = await domainId('Front-end');
    const created = await call(tags.POST, 'POST', '/api/tags', { body: { name: 'Svelte', domainId: frontEnd } });
    expect(created.json.data).toMatchObject({ name: 'Svelte', domainId: frontEnd });

    await actAs('visitor');
    const list = (await call(tags.GET, 'GET', '/api/tags')).json.data;
    expect(list.find((t: { name: string }) => t.name === 'Svelte')).toMatchObject({ domainId: frontEnd });
  });

  it('creates a tag without a domain ("Autres")', async () => {
    const created = await call(tags.POST, 'POST', '/api/tags', { body: { name: 'Elm' } });
    expect(created.json.data.domainId).toBeNull();
  });

  it('changes or clears the domain without renaming', async () => {
    const api = await domainId('API et données');
    const { id } = (await call(tags.POST, 'POST', '/api/tags', { body: { name: 'Bun' } })).json.data;
    const params = { id: String(id) };
    const moved = await call(tag.PATCH, 'PATCH', `/api/tags/${id}`, { body: { domainId: api }, params });
    expect(moved.json.data).toMatchObject({ name: 'Bun', domainId: api });
    const cleared = await call(tag.PATCH, 'PATCH', `/api/tags/${id}`, { body: { domainId: null }, params });
    expect(cleared.json.data.domainId).toBeNull();
  });

  it('refuses an unknown or malformed domain and an empty update', async () => {
    const unknown = await call(tags.POST, 'POST', '/api/tags', { body: { name: 'X', domainId: 99999 } });
    expect(unknown.status).toBe(400);
    expect(unknown.json.message).toBe('Domaine inconnu');
    expect((await call(tags.POST, 'POST', '/api/tags', { body: { name: 'X', domainId: 'Front-end' } })).status).toBe(400);
    const { id } = (await call(tags.POST, 'POST', '/api/tags', { body: { name: 'Deno' } })).json.data;
    const params = { id: String(id) };
    expect((await call(tag.PATCH, 'PATCH', `/api/tags/${id}`, { body: { domainId: 99999 }, params })).status).toBe(400);
    expect((await call(tag.PATCH, 'PATCH', `/api/tags/${id}`, { body: {}, params })).status).toBe(400);
  });

  it('knows the default domain of common technologies (seed)', () => {
    expect(defaultTagDomain('Vue.js')).toBe('Front-end');
    expect(defaultTagDomain(' PLAYWRIGHT ')).toBe('Tests, qualité et design');
    expect(defaultTagDomain('Cobol')).toBeNull();
  });
});

describe('project case study', () => {
  it('stores the case study fields and turns empty ones into null', async () => {
    const created = await call(projects.POST, 'POST', '/api/projects', {
      body: {
        ...newProject('Étude'),
        kind: 'Projet personnel',
        scope: 'Full-stack',
        role: '  ',
        context: 'Contexte',
        achievements: 'Point 1\nPoint 2',
        results: '',
      },
    });
    expect(created.status).toBe(201);
    expect(created.json.data).toMatchObject({
      kind: 'Projet personnel',
      scope: 'Full-stack',
      role: null,
      context: 'Contexte',
      achievements: 'Point 1\nPoint 2',
      results: null,
    });

    const id = String(created.json.data.id);
    const updated = await call(project.PATCH, 'PATCH', `/api/projects/${id}`, { body: { results: '+30 % de couverture' }, params: { id } });
    expect(updated.json.data).toMatchObject({ results: '+30 % de couverture', kind: 'Projet personnel' });
  });

  it('refuses over-long case study text', async () => {
    const { status } = await call(projects.POST, 'POST', '/api/projects', { body: { ...newProject('Long'), kind: 'x'.repeat(101) } });
    expect(status).toBe(400);
  });
});

describe('hero availability', () => {
  const base = {
    title: 'Titre',
    subtitle: 'Sous-titre',
    description: 'Description',
    primaryButtonText: 'Contact',
    primaryButtonUrl: '/contact',
    secondaryButtonText: 'Projets',
    secondaryButtonUrl: '/projets',
    githubUrl: 'https://github.com/someone',
    linkedinUrl: 'https://www.linkedin.com/in/someone/',
    email: 'me@example.com',
  };

  it('saves the indicator and its text, visible to visitors', async () => {
    const body = { ...base, availabilityEnabled: false, availabilityText: 'En poste' };
    expect((await call(hero.PUT, 'PUT', '/api/hero', { body })).status).toBe(200);
    await actAs('visitor');
    expect((await call(hero.GET, 'GET', '/api/hero')).json.data).toMatchObject({ availabilityEnabled: false, availabilityText: 'En poste' });
  });

  it('requires a boolean switch and a text', async () => {
    expect((await call(hero.PUT, 'PUT', '/api/hero', { body: { ...base, availabilityText: 'Oui' } })).status).toBe(400);
    expect((await call(hero.PUT, 'PUT', '/api/hero', { body: { ...base, availabilityEnabled: 'yes', availabilityText: 'Oui' } })).status).toBe(400);
    expect((await call(hero.PUT, 'PUT', '/api/hero', { body: { ...base, availabilityEnabled: true, availabilityText: '  ' } })).status).toBe(400);
  });
});
