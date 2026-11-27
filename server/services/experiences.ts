import { asc, desc, eq } from 'drizzle-orm';
import type { z } from 'zod';
import { db, type Executor } from '../db';
import { companies, experiences, experienceTags } from '../db/schema';
import { HttpError } from '../http';
import type { createExperienceSchema, updateExperienceSchema } from '../validation';
import { assertTagsExist, type TagDTO } from './tags';
import { findOrCreateCompany } from './companies';
import { reorder } from './ordering';

export type ExperienceDTO = {
  id: number;
  job: string;
  /** Name of the employer (from the companies table) */
  company: string;
  companyId: number;
  /** URL segment of the employer page, /experience/[slug] */
  companySlug: string;
  description: string;
  startDate: string;
  endDate: string | null;
  position: number;
  tags: TagDTO[];
};

type CreateInput = z.infer<typeof createExperienceSchema>;
type UpdateInput = z.infer<typeof updateExperienceSchema>;

async function findExperiences(tx: Executor, where?: { id?: number; companyId?: number }): Promise<ExperienceDTO[]> {
  const rows = await tx.query.experiences.findMany({
    where: where?.id ? eq(experiences.id, where.id) : where?.companyId ? eq(experiences.companyId, where.companyId) : undefined,
    orderBy: [asc(experiences.position), desc(experiences.startDate)],
    // `company` is the deprecated copy of the name: the companies table is the source
    columns: { createdAt: false, updatedAt: false, company: false },
    with: {
      companyRef: { columns: { name: true, slug: true } },
      experienceTags: { with: { tag: { columns: { id: true, name: true } } } },
    },
  });

  return rows.map(({ experienceTags: links, companyRef, ...experience }) => ({
    ...experience,
    company: companyRef.name,
    companySlug: companyRef.slug,
    tags: links.map((link) => link.tag),
  }));
}

export const listExperiences = () => findExperiences(db);

/** Positions held at one employer, in display order. */
export const listCompanyExperiences = (companyId: number) => findExperiences(db, { companyId });

/** Saves a new display order: `ids` must list every experience exactly once. */
export const reorderExperiences = (ids: number[]) => reorder(experiences, ids);

async function getExperience(tx: Executor, id: number) {
  const [experience] = await findExperiences(tx, { id });
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

/** The typed company name becomes a link to its employer (found whatever the case, or created). */
async function companyFields(tx: Executor, name: string) {
  const company = await findOrCreateCompany(tx, name);
  return { companyId: company.id, company: company.name };
}

export async function createExperience({ tags = [], company, ...fields }: CreateInput) {
  return db.transaction(async (tx) => {
    const [{ id }] = await tx
      .insert(experiences)
      .values({ ...fields, ...(await companyFields(tx, company)) })
      .returning({ id: experiences.id });
    await setTags(tx, id, tags);
    return getExperience(tx, id);
  });
}

export async function updateExperience(id: number, { tags, company, ...fields }: UpdateInput) {
  return db.transaction(async (tx) => {
    const current = await getExperience(tx, id);

    const startDate = fields.startDate ?? current.startDate;
    const endDate = fields.endDate !== undefined ? fields.endDate : current.endDate;
    if (endDate && endDate < startDate) {
      throw new HttpError(400, 'endDate: La date de fin doit être après la date de début');
    }

    // Always touch the row, so a change of tags alone also moves updated_at (sitemap lastmod)
    if (Object.keys(fields).length > 0 || tags || company !== undefined) {
      const link = company !== undefined ? await companyFields(tx, company) : {};
      await tx.update(experiences).set({ ...fields, ...link, updatedAt: new Date() }).where(eq(experiences.id, id));
    }
    if (tags) await setTags(tx, id, tags);
    return getExperience(tx, id);
  });
}

export async function deleteExperience(id: number) {
  const deleted = await db.delete(experiences).where(eq(experiences.id, id)).returning({ id: experiences.id });
  if (deleted.length === 0) throw new HttpError(404, 'Expérience introuvable');
}

/** An employer as the public site shows it: its context and the positions held there. */
export type EmployerDTO = {
  id: number;
  name: string;
  slug: string;
  sector: string | null;
  websiteUrl: string | null;
  context: string | null;
  /** First day at the company */
  startDate: string;
  /** Last day, or null while a position there is current */
  endDate: string | null;
  experiences: ExperienceDTO[];
};

function toEmployers(rows: (typeof companies.$inferSelect)[], positions: ExperienceDTO[]): EmployerDTO[] {
  const byId = new Map(rows.map((company) => [company.id, company]));
  const employers = new Map<number, EmployerDTO>();
  // Positions come in display order: an employer takes the place of its first position
  for (const experience of positions) {
    const company = byId.get(experience.companyId);
    if (!company) continue;
    let employer = employers.get(company.id);
    if (!employer) {
      const { id, name, slug, sector, websiteUrl, context } = company;
      employer = { id, name, slug, sector, websiteUrl, context, startDate: experience.startDate, endDate: experience.endDate, experiences: [] };
      employers.set(company.id, employer);
    }
    employer.experiences.push(experience);
    if (experience.startDate < employer.startDate) employer.startDate = experience.startDate;
    if (employer.endDate !== null && (experience.endDate === null || experience.endDate > employer.endDate)) {
      employer.endDate = experience.endDate;
    }
  }
  return [...employers.values()];
}

/** Employers with at least one position, in the order of the experience list (public). */
export async function listEmployers(): Promise<EmployerDTO[]> {
  const [rows, positions] = await Promise.all([db.select().from(companies), listExperiences()]);
  return toEmployers(rows, positions);
}

/** One employer page, or null when the slug is unknown or the company has no position. */
export async function findEmployer(slug: string): Promise<EmployerDTO | null> {
  const [company] = await db.select().from(companies).where(eq(companies.slug, slug)).limit(1);
  if (!company) return null;
  return toEmployers([company], await listCompanyExperiences(company.id))[0] ?? null;
}
