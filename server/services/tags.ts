import { and, asc, eq, inArray, ne, sql } from 'drizzle-orm';
import { db, type Executor } from '../db';
import { experienceTags, projectTags, tags } from '../db/schema';
import { HttpError } from '../http';
import { assertSkillDomainExists } from './skill-domains';

// Tags nested in experiences and projects
export type TagDTO = { id: number; name: string };
// Tags listed on their own, with the domain used to group skills
export type TagWithDomainDTO = TagDTO & { domainId: number | null };
export type TagWithUsageDTO = TagWithDomainDTO & { experienceCount: number; projectCount: number };

const tagColumns = { id: tags.id, name: tags.name, domainId: tags.domainId };

export async function listTags(): Promise<TagWithDomainDTO[]> {
  return db.select(tagColumns).from(tags).orderBy(asc(tags.name));
}

/** Tags with the number of experiences and projects using them (admin view). */
export async function listTagsWithUsage(): Promise<TagWithUsageDTO[]> {
  return db
    .select({
      ...tagColumns,
      experienceCount: sql<number>`(select count(*) from ${experienceTags} where ${experienceTags.tagId} = ${tags.id})`.mapWith(Number),
      projectCount: sql<number>`(select count(*) from ${projectTags} where ${projectTags.tagId} = ${tags.id})`.mapWith(Number),
    })
    .from(tags)
    .orderBy(asc(tags.name));
}

/** Throws a 409 if another tag already has this name (case-insensitive). */
async function assertNameAvailable(name: string, exceptId?: number) {
  const sameName = sql`lower(${tags.name}) = lower(${name})`;
  const [existing] = await db
    .select({ id: tags.id })
    .from(tags)
    .where(exceptId ? and(sameName, ne(tags.id, exceptId)) : sameName)
    .limit(1);
  if (existing) throw new HttpError(409, 'Ce tag existe déjà');
}

export async function createTag(name: string, domainId: number | null = null): Promise<TagWithDomainDTO> {
  await assertNameAvailable(name);
  await assertSkillDomainExists(domainId);
  const [tag] = await db.insert(tags).values({ name, domainId }).returning(tagColumns);
  return tag;
}

/** Renames a tag and / or changes its domain. */
export async function updateTag(
  id: number,
  changes: { name?: string; domainId?: number | null },
): Promise<TagWithDomainDTO> {
  if (changes.name !== undefined) await assertNameAvailable(changes.name, id);
  await assertSkillDomainExists(changes.domainId);
  const [tag] = await db.update(tags).set(changes).where(eq(tags.id, id)).returning(tagColumns);
  if (!tag) throw new HttpError(404, 'Tag introuvable');
  return tag;
}

export async function deleteTag(id: number) {
  const deleted = await db.delete(tags).where(eq(tags.id, id)).returning({ id: tags.id });
  if (deleted.length === 0) throw new HttpError(404, 'Tag introuvable');
}

/** Throws a 400 if any of the given tag ids does not exist. */
export async function assertTagsExist(tx: Executor, ids: number[]) {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return unique;
  const found = await tx.select({ id: tags.id }).from(tags).where(inArray(tags.id, unique));
  if (found.length !== unique.length) throw new HttpError(400, 'Un ou plusieurs tags sont introuvables');
  return unique;
}
