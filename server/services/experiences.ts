import { asc, desc, eq } from 'drizzle-orm';
import type { z } from 'zod';
import { db, type Executor } from '../db';
import { experiences, experienceTags } from '../db/schema';
import { HttpError } from '../http';
import type { createExperienceSchema, updateExperienceSchema } from '../validation';
import { assertTagsExist, type TagDTO } from './tags';
import { reorder } from './ordering';

export type ExperienceDTO = {
  id: number;
  job: string;
  company: string;
  description: string;
  startDate: string;
  endDate: string | null;
  position: number;
  tags: TagDTO[];
};

type CreateInput = z.infer<typeof createExperienceSchema>;
type UpdateInput = z.infer<typeof updateExperienceSchema>;

async function findExperiences(tx: Executor, id?: number): Promise<ExperienceDTO[]> {
  const rows = await tx.query.experiences.findMany({
    where: id ? eq(experiences.id, id) : undefined,
    orderBy: [asc(experiences.position), desc(experiences.startDate)],
    columns: { createdAt: false, updatedAt: false },
    with: { experienceTags: { with: { tag: { columns: { id: true, name: true } } } } },
  });

  return rows.map(({ experienceTags: links, ...experience }) => ({
    ...experience,
    tags: links.map((link) => link.tag),
  }));
}

export const listExperiences = () => findExperiences(db);

/** Saves a new display order: `ids` must list every experience exactly once. */
export const reorderExperiences = (ids: number[]) => reorder(experiences, ids);

async function getExperience(tx: Executor, id: number) {
  const [experience] = await findExperiences(tx, id);
  if (!experience) throw new HttpError(404, 'Expérience introuvable');
  return experience;
}

async function setTags(tx: Executor, experienceId: number, tagIds: number[]) {
  const ids = await assertTagsExist(tx, tagIds);
  await tx.delete(experienceTags).where(eq(experienceTags.experienceId, experienceId));
  if (ids.length > 0) {
    await tx.insert(experienceTags).values(ids.map((tagId) => ({ experienceId, tagId })));
  }
}

export async function createExperience({ tags = [], ...fields }: CreateInput) {
  return db.transaction(async (tx) => {
    const [{ id }] = await tx.insert(experiences).values(fields).returning({ id: experiences.id });
    await setTags(tx, id, tags);
    return getExperience(tx, id);
  });
}

export async function updateExperience(id: number, { tags, ...fields }: UpdateInput) {
  return db.transaction(async (tx) => {
    const current = await getExperience(tx, id);

    const startDate = fields.startDate ?? current.startDate;
    const endDate = fields.endDate !== undefined ? fields.endDate : current.endDate;
    if (endDate && endDate < startDate) {
      throw new HttpError(400, 'endDate: La date de fin doit être après la date de début');
    }

    // Always touch the row, so a change of tags alone also moves updated_at (sitemap lastmod)
    if (Object.keys(fields).length > 0 || tags) {
      await tx.update(experiences).set({ ...fields, updatedAt: new Date() }).where(eq(experiences.id, id));
    }
    if (tags) await setTags(tx, id, tags);
    return getExperience(tx, id);
  });
}

export async function deleteExperience(id: number) {
  const deleted = await db.delete(experiences).where(eq(experiences.id, id)).returning({ id: experiences.id });
  if (deleted.length === 0) throw new HttpError(404, 'Expérience introuvable');
}
