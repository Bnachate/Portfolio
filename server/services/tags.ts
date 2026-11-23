import { asc, eq, inArray } from 'drizzle-orm';
import { db, type Executor } from '../db';
import { tags } from '../db/schema';
import { HttpError } from '../http';

export type TagDTO = { id: number; name: string };

export async function listTags(): Promise<TagDTO[]> {
  return db.select({ id: tags.id, name: tags.name }).from(tags).orderBy(asc(tags.name));
}

export async function createTag(name: string): Promise<TagDTO> {
  const [existing] = await db.select({ id: tags.id }).from(tags).where(eq(tags.name, name)).limit(1);
  if (existing) throw new HttpError(409, 'Ce tag existe déjà');

  const [tag] = await db.insert(tags).values({ name }).returning({ id: tags.id, name: tags.name });
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
