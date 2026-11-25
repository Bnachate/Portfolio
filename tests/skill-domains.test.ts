import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { actAs, call, setupDatabase } from './helpers';
import * as domains from '@/app/api/skill-domains/route';
import * as domain from '@/app/api/skill-domains/[id]/route';
import * as domainOrder from '@/app/api/skill-domains/order/route';
import * as tags from '@/app/api/tags/route';

beforeAll(setupDatabase);
beforeEach(() => actAs('admin'));

type Domain = { id: number; name: string; position: number };

const list = async (): Promise<Domain[]> => (await call(domains.GET, 'GET', '/api/skill-domains')).json.data;
const create = (name: string) => call(domains.POST, 'POST', '/api/skill-domains', { body: { name } });

describe('skill domains', () => {
  it('starts with the 5 domains created by the migration, in order, public', async () => {
    await actAs('visitor');
    const { status, json } = await call(domains.GET, 'GET', '/api/skill-domains');
    expect(status).toBe(200);
    expect(json.data.map((d: Domain) => d.name)).toEqual([
      'Front-end',
      'Tests, qualité et design',
      'API et données',
      'Outils de livraison',
      'Marketing technique',
    ]);
    expect(json.data[0]).not.toHaveProperty('createdAt');
  });

  it('creates a domain at the end of the list (trimmed)', async () => {
    const { status, json } = await create('  Mobile ');
    expect(status).toBe(201);
    expect(json.data.name).toBe('Mobile');
    expect((await list()).at(-1)!.name).toBe('Mobile');
  });

  it('refuses duplicates whatever the case, and empty names', async () => {
    const duplicate = await create('front-END');
    expect(duplicate.status).toBe(409);
    expect(duplicate.json.message).toBe('Ce domaine existe déjà');
    // "Autres" already titles the section of tags without a domain
    const reserved = await create('autres');
    expect(reserved.status).toBe(409);
    expect(reserved.json.message).toMatch(/réservé/);
    expect((await create('   ')).status).toBe(400);
    expect((await create('x'.repeat(61))).status).toBe(400);
  });

  it('renames a domain, 404 for an unknown one, 409 onto another name', async () => {
    const { id } = (await create('Data')).json.data;
    const renamed = await call(domain.PATCH, 'PATCH', `/api/skill-domains/${id}`, { body: { name: 'Data et IA' }, params: { id: String(id) } });
    expect(renamed.json.data).toMatchObject({ id, name: 'Data et IA' });
    expect((await call(domain.PATCH, 'PATCH', '/api/skill-domains/99999', { body: { name: 'Z' }, params: { id: '99999' } })).status).toBe(404);
    expect((await call(domain.PATCH, 'PATCH', `/api/skill-domains/${id}`, { body: { name: 'Front-end' }, params: { id: String(id) } })).status).toBe(409);
  });

  it('deletes a domain and moves its tags to "Autres"', async () => {
    const { id } = (await create('Temporaire')).json.data;
    const tag = (await call(tags.POST, 'POST', '/api/tags', { body: { name: 'Flutter', domainId: id } })).json.data;
    expect(tag.domainId).toBe(id);

    expect((await call(domain.DELETE, 'DELETE', `/api/skill-domains/${id}`, { params: { id: String(id) } })).status).toBe(200);
    const after = (await call(tags.GET, 'GET', '/api/tags')).json.data.find((t: { id: number }) => t.id === tag.id);
    expect(after.domainId).toBeNull();
    expect((await call(domain.DELETE, 'DELETE', `/api/skill-domains/${id}`, { params: { id: String(id) } })).status).toBe(404);
  });

  it('saves a new display order and refuses a stale list', async () => {
    const ids = (await list()).map((d) => d.id);
    const reversed = [...ids].reverse();
    const reordered = await call(domainOrder.PUT, 'PUT', '/api/skill-domains/order', { body: { ids: reversed } });
    expect(reordered.status).toBe(200);
    expect(reordered.json.data.map((d: Domain) => d.id)).toEqual(reversed);
    expect((await call(domainOrder.PUT, 'PUT', '/api/skill-domains/order', { body: { ids: ids.slice(1) } })).status).toBe(409);
  });

  it('refuses every write to visitors', async () => {
    const [first] = await list();
    await actAs('visitor');
    const params = { id: String(first.id) };
    expect((await create('Pirate')).status).toBe(401);
    expect((await call(domain.PATCH, 'PATCH', `/api/skill-domains/${first.id}`, { body: { name: 'Pirate' }, params })).status).toBe(401);
    expect((await call(domain.DELETE, 'DELETE', `/api/skill-domains/${first.id}`, { params })).status).toBe(401);
    expect((await call(domainOrder.PUT, 'PUT', '/api/skill-domains/order', { body: { ids: [first.id] } })).status).toBe(401);
  });
});
