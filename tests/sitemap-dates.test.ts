import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { actAs, call, setupDatabase } from './helpers';
import sitemap from '@/app/sitemap';
import { getProjectDates } from '@/server/services/sitemap';
import * as experiences from '@/app/api/experiences/route';
import * as experience from '@/app/api/experiences/[id]/route';
import * as projects from '@/app/api/projects/route';
import * as tags from '@/app/api/tags/route';
import * as tag from '@/app/api/tags/[id]/route';
import * as domains from '@/app/api/skill-domains/route';
import * as domain from '@/app/api/skill-domains/[id]/route';

beforeAll(setupDatabase);
beforeEach(() => actAs('admin'));

// Lets the clock move between two writes, so their updated_at differ
const tick = () => new Promise((resolve) => setTimeout(resolve, 15));

/** lastmod of each page of the sitemap, by path (undefined when the page has none). */
async function lastmods() {
  const entries = await sitemap();
  return Object.fromEntries(
    entries.map((entry) => [new URL(entry.url).pathname, entry.lastModified ? new Date(entry.lastModified).getTime() : undefined]),
  ) as Record<string, number | undefined>;
}

const createTag = async (name: string) => (await call(tags.POST, 'POST', '/api/tags', { body: { name } })).json.data.id as number;

const EXPERIENCE = { job: 'Développeur', company: 'Acme', description: 'Une ligne', startDate: '2024-01-01', endDate: null };
const PROJECT = { title: 'Portfolio', description: 'Site', projectImageUrl: 'https://example.com/capture.png' };

describe('sitemap lastmod', () => {
  it('never invents a date: no lastmod for a page without stored content, nor for /contact', async () => {
    const dates = await lastmods();
    // The migrations created the skill domains and the CV employers, but there are no projects, positions or tags yet
    expect(dates['/projets']).toBeUndefined();
    expect(dates['/contact']).toBeUndefined();
    // Employers without a position have no page
    expect(Object.keys(dates).filter((path) => path.startsWith('/experience/'))).toEqual([]);
    expect(dates['/competences']).toBeTypeOf('number');
    // Never the time of the request
    expect(dates['/competences']!).toBeLessThan(Date.now() - 5);
  });

  it('follows the content each page shows', async () => {
    const before = await lastmods();
    await tick();
    const tagId = await createTag('Elixir');
    await tick();
    const { status } = await call(experiences.POST, 'POST', '/api/experiences', { body: { ...EXPERIENCE, tags: [tagId] } });
    expect(status).toBe(201);
    const after = await lastmods();

    expect(after['/experience']).toBeGreaterThan(after['/projets']!); // experience written after the tag
    expect(after['/']).toBe(after['/experience']);
    expect(after['/competences']).toBe(after['/experience']);
    expect(after['/']).toBeGreaterThan(before['/']!);
    // /projets shows tags but no experience: it only moved with the tag
    expect(after['/projets']).toBeLessThan(after['/experience']!);
    expect(after['/contact']).toBeUndefined();
  });

  it('a change of tags alone moves the experience date', async () => {
    const id = (await call(experiences.GET, 'GET', '/api/experiences')).json.data[0].id;
    const otherTag = await createTag('Phoenix');
    const before = await lastmods();
    await tick();

    const { status } = await call(experience.PATCH, 'PATCH', `/api/experiences/${id}`, { body: { tags: [otherTag] }, params: { id: String(id) } });
    expect(status).toBe(200);
    const after = await lastmods();
    expect(after['/experience']).toBeGreaterThan(before['/experience']!);
    // No project or tag changed
    expect(after['/projets']).toBe(before['/projets']);
  });

  it('renaming a skill domain moves /competences and the home page only', async () => {
    const id = (await call(domains.GET, 'GET', '/api/skill-domains')).json.data[0].id;
    const before = await lastmods();
    await tick();
    await call(domain.PATCH, 'PATCH', `/api/skill-domains/${id}`, { body: { name: 'Interfaces' }, params: { id: String(id) } });
    const after = await lastmods();
    expect(after['/competences']).toBeGreaterThan(before['/competences']!);
    expect(after['/']).toBeGreaterThan(before['/']!);
    expect(after['/experience']).toBe(before['/experience']);
    expect(after['/projets']).toBe(before['/projets']);
  });
});

describe('employer page dates', () => {
  it('list the employers with a position, dated by the company, its positions and their tags', async () => {
    const dates = await lastmods();
    // "Acme" was created by the experience of the tests above; the CV employers have no position here
    expect(Object.keys(dates).filter((path) => path.startsWith('/experience/'))).toEqual(['/experience/acme']);
    const before = dates['/experience/acme']!;

    await tick();
    const used = (await call(experiences.GET, 'GET', '/api/experiences')).json.data[0].tags[0].id as number;
    await call(tag.PATCH, 'PATCH', `/api/tags/${used}`, { body: { name: 'Phoenix LiveView' }, params: { id: String(used) } });
    expect((await lastmods())['/experience/acme']).toBeGreaterThan(before);
  });
});

describe('case study dates', () => {
  it('take the latest of the project and of the tags it shows', async () => {
    const used = await createTag('Gleam');
    const unused = await createTag('Zig');
    await tick();
    const created = await call(projects.POST, 'POST', '/api/projects', { body: { ...PROJECT, tags: [used] } });
    const projectId = created.json.data.id as number;
    const dateOf = async () => (await getProjectDates()).find((p) => p.id === projectId)!.updatedAt.getTime();
    const initial = await dateOf();

    await tick();
    await call(tag.PATCH, 'PATCH', `/api/tags/${unused}`, { body: { name: 'Zig 0.14' }, params: { id: String(unused) } });
    expect(await dateOf()).toBe(initial);

    await tick();
    await call(tag.PATCH, 'PATCH', `/api/tags/${used}`, { body: { name: 'Gleam 1.0' }, params: { id: String(used) } });
    expect(await dateOf()).toBeGreaterThan(initial);
  });
});
