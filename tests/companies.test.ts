import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { actAs, call, setupDatabase } from './helpers';
import * as companiesRoute from '@/app/api/companies/route';
import * as companyRoute from '@/app/api/companies/[id]/route';
import * as experiencesRoute from '@/app/api/experiences/route';
import * as experienceRoute from '@/app/api/experiences/[id]/route';
import { findEmployer, listEmployers } from '@/server/services/experiences';
import { slugify } from '@/server/services/companies';

beforeAll(setupDatabase);
beforeEach(() => actAs('admin'));

type Company = { id: number; name: string; slug: string; sector: string | null; websiteUrl: string | null; context: string | null; experienceCount: number };

const companies = async (): Promise<Company[]> => (await call(companiesRoute.GET, 'GET', '/api/companies')).json.data;
const byName = async (name: string) => (await companies()).find((company) => company.name === name)!;
const patch = (id: number, body: unknown) => call(companyRoute.PATCH, 'PATCH', `/api/companies/${id}`, { body, params: { id: String(id) } });
const remove = (id: number) => call(companyRoute.DELETE, 'DELETE', `/api/companies/${id}`, { params: { id: String(id) } });
const createExperience = (company: string, extra: Record<string, unknown> = {}) =>
  call(experiencesRoute.POST, 'POST', '/api/experiences', {
    body: { job: 'Développeur', company, description: 'Une mission', startDate: '2024-01-01', endDate: null, ...extra },
  });

describe('companies', () => {
  it('starts with the CV employers and their context, created by the migration', async () => {
    const list = await companies();
    expect(list.map((c) => [c.name, c.slug])).toEqual([
      ['Ipocamp', 'ipocamp'],
      ['Octelio Conseil', 'octelio-conseil'],
      ['Weborama', 'weborama'],
    ]);
    const weborama = list.find((c) => c.name === 'Weborama')!;
    expect(weborama.sector).toBe('AdTech · Data marketing');
    expect(weborama.websiteUrl).toBe('https://www.weborama.com/');
    expect(weborama.context).toContain('- un Scrum Master');
    expect(weborama.experienceCount).toBe(0);
    expect(weborama).not.toHaveProperty('createdAt');
  });

  it('is public to read, admin-only to change', async () => {
    const id = (await byName('Ipocamp')).id;
    await actAs('visitor');
    expect((await call(companiesRoute.GET, 'GET', '/api/companies')).status).toBe(200);
    expect((await patch(id, { sector: 'Pirate' })).status).toBe(401);
    expect((await remove(id)).status).toBe(401);
    expect((await byName('Ipocamp')).sector).toBe('Legal Tech · Propriété intellectuelle');
  });

  it('links a position to an existing employer whatever the case, or creates the employer', async () => {
    const before = (await companies()).length;
    const linked = await createExperience('  weborama ');
    expect(linked.status).toBe(201);
    expect(linked.json.data).toMatchObject({ company: 'Weborama', companySlug: 'weborama' });
    expect((await companies()).length).toBe(before);
    expect((await byName('Weborama')).experienceCount).toBe(1);

    const created = await createExperience('Nouvelle Boîte & Cie');
    expect(created.json.data).toMatchObject({ company: 'Nouvelle Boîte & Cie', companySlug: 'nouvelle-boite-cie' });
    expect((await companies()).length).toBe(before + 1);
  });

  it('moves a position to another employer when its company name changes', async () => {
    const id = (await createExperience('Octelio Conseil')).json.data.id;
    const moved = await call(experienceRoute.PATCH, 'PATCH', `/api/experiences/${id}`, { body: { company: 'Ipocamp' }, params: { id: String(id) } });
    expect(moved.json.data.company).toBe('Ipocamp');
    expect((await byName('Octelio Conseil')).experienceCount).toBe(0);
    expect((await byName('Ipocamp')).experienceCount).toBe(1);
  });

  it('updates the context, sector and website; renaming changes the slug and the positions', async () => {
    const id = (await byName('Nouvelle Boîte & Cie')).id;
    const { status, json } = await patch(id, {
      name: 'Acme',
      sector: '  Industrie  ',
      websiteUrl: 'https://acme.example/',
      context: 'Premier paragraphe.\n\n- un point',
    });
    expect(status).toBe(200);
    expect(json.data).toMatchObject({ name: 'Acme', slug: 'acme', sector: 'Industrie', websiteUrl: 'https://acme.example/' });
    const positions = (await call(experiencesRoute.GET, 'GET', '/api/experiences')).json.data.filter((e: { companyId: number }) => e.companyId === id);
    expect(positions.map((e: { company: string; companySlug: string }) => [e.company, e.companySlug])).toEqual([['Acme', 'acme']]);

    // Empty optional fields are cleared
    expect((await patch(id, { sector: '', websiteUrl: '' })).json.data).toMatchObject({ sector: null, websiteUrl: null });
  });

  it('refuses a duplicate name, an empty name and a dangerous link', async () => {
    const id = (await byName('Acme')).id;
    expect((await patch(id, { name: 'WEBORAMA' })).status).toBe(409);
    expect((await patch(id, { name: '   ' })).status).toBe(400);
    expect((await patch(id, { websiteUrl: 'javascript:alert(1)' })).status).toBe(400);
    expect((await patch(id, { context: 'a\u0000b' })).status).toBe(400);
    expect((await patch(99999, { sector: 'X' })).status).toBe(404);
  });

  it('deletes only an employer without positions', async () => {
    const used = await byName('Weborama');
    expect((await remove(used.id)).status).toBe(409);
    const unused = await byName('Octelio Conseil');
    expect((await remove(unused.id)).status).toBe(200);
    expect((await remove(unused.id)).status).toBe(404);
  });

  it('gives a unique slug to names that read the same', async () => {
    await createExperience('Acme!');
    expect((await byName('Acme!')).slug).toBe('acme-2');
    await createExperience('Acme?');
    expect((await byName('Acme?')).slug).toBe('acme-3');
    expect(slugify('Été & Hiver')).toBe('ete-hiver');
    expect(slugify('!!!')).toBe('entreprise');
  });
});

describe('employers on the public site', () => {
  it('groups the positions by employer, with the overall period', async () => {
    const weborama = (await byName('Weborama')).id;
    await createExperience('Weborama', { startDate: '2020-03-01', endDate: '2021-06-01', job: 'Stagiaire' });
    const employers = await listEmployers();
    const employer = employers.find((e) => e.id === weborama)!;
    expect(employer.experiences.map((e) => e.job)).toEqual(['Développeur', 'Stagiaire']);
    expect(employer.startDate).toBe('2020-03-01');
    // One position is current: the employer is too
    expect(employer.endDate).toBeNull();
    expect(employer.context).toContain('Weborama est une entreprise');
    // Employers without a position are not shown
    expect(employers.some((e) => e.experiences.length === 0)).toBe(false);
  });

  it('ends a past employer on the last day of its latest position, whatever the display order', async () => {
    // Listed oldest first: the end date must still be the latest one
    await createExperience('Ancienne Boîte', { startDate: '2015-01-01', endDate: '2016-01-01', job: 'Junior', position: 50 });
    await createExperience('Ancienne Boîte', { startDate: '2016-02-01', endDate: '2017-09-01', job: 'Confirmé', position: 51 });
    const employer = (await listEmployers()).find((e) => e.name === 'Ancienne Boîte')!;
    expect(employer.experiences.map((e) => e.job)).toEqual(['Junior', 'Confirmé']);
    expect([employer.startDate, employer.endDate]).toEqual(['2015-01-01', '2017-09-01']);
  });

  it('finds an employer page by slug, never an unknown or unused one', async () => {
    expect((await findEmployer('weborama'))?.name).toBe('Weborama');
    expect(await findEmployer('inconnue')).toBeNull();
    await actAs('admin');
    // Ipocamp lost its only position to... nothing: it still has the moved one; create an unused employer
    await createExperience('Temporaire');
    const temp = await byName('Temporaire');
    const position = (await call(experiencesRoute.GET, 'GET', '/api/experiences')).json.data.find((e: { companyId: number }) => e.companyId === temp.id);
    await call(experienceRoute.DELETE, 'DELETE', `/api/experiences/${position.id}`, { params: { id: String(position.id) } });
    expect(await findEmployer(temp.slug)).toBeNull();
  });
});
