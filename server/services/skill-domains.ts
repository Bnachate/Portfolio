import { and, asc, eq, ne, sql } from 'drizzle-orm';
import { db } from '../db';
import { skillDomains } from '../db/schema';
import { HttpError } from '../http';
import { reorder } from './ordering';
import { OTHER_DOMAIN_LABEL } from '../../app/config/tag-domains';

export type SkillDomainDTO = { id: number; name: string; position: number };

const domainColumns = { id: skillDomains.id, name: skillDomains.name, position: skillDomains.position };

/** Skill domains in display order (public: they title the "Compétences" page sections). */
export async function listSkillDomains(): Promise<SkillDomainDTO[]> {
  return db.select(domainColumns).from(skillDomains).orderBy(asc(skillDomains.position), asc(skillDomains.id));
}

/** Throws a 409 if another domain already has this name (case-insensitive). */
async function assertNameAvailable(name: string, exceptId?: number) {
  // "Autres" is the section of tags without a domain on the "Compétences" page
  if (name.toLocaleLowerCase('fr') === OTHER_DOMAIN_LABEL.toLocaleLowerCase('fr')) {
    throw new HttpError(409, `« ${OTHER_DOMAIN_LABEL} » est réservé aux tags sans domaine`);
  }
  const sameName = sql`lower(${skillDomains.name}) = lower(${name})`;
  const [existing] = await db
    .select({ id: skillDomains.id })
    .from(skillDomains)
    .where(exceptId ? and(sameName, ne(skillDomains.id, exceptId)) : sameName)
    .limit(1);
  if (existing) throw new HttpError(409, 'Ce domaine existe déjà');
}

/** Adds a domain after the last one. */
export async function createSkillDomain(name: string): Promise<SkillDomainDTO> {
  await assertNameAvailable(name);
  const [{ next }] = await db
    .select({ next: sql<number>`coalesce(max(${skillDomains.position}) + 1, 0)`.mapWith(Number) })
    .from(skillDomains);
  const [domain] = await db.insert(skillDomains).values({ name, position: next }).returning(domainColumns);
  return domain;
}

export async function renameSkillDomain(id: number, name: string): Promise<SkillDomainDTO> {
  await assertNameAvailable(name, id);
  const [domain] = await db.update(skillDomains).set({ name }).where(eq(skillDomains.id, id)).returning(domainColumns);
  if (!domain) throw new HttpError(404, 'Domaine introuvable');
  return domain;
}

/** Its tags are kept and move to "Autres" (ON DELETE SET NULL). */
export async function deleteSkillDomain(id: number) {
  const deleted = await db.delete(skillDomains).where(eq(skillDomains.id, id)).returning({ id: skillDomains.id });
  if (deleted.length === 0) throw new HttpError(404, 'Domaine introuvable');
}

/** Saves a new display order: `ids` must list every domain exactly once. */
export const reorderSkillDomains = (ids: number[]) => reorder(skillDomains, ids);

/** Throws a 400 if the domain does not exist (null = "Autres" is always valid). */
export async function assertSkillDomainExists(id: number | null | undefined) {
  if (id == null) return;
  const [found] = await db.select({ id: skillDomains.id }).from(skillDomains).where(eq(skillDomains.id, id)).limit(1);
  if (!found) throw new HttpError(400, 'Domaine inconnu');
}
