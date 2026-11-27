import { and, asc, count, eq, ne, sql } from 'drizzle-orm';
import type { z } from 'zod';
import { db, type Executor } from '../db';
import { companies, experiences } from '../db/schema';
import { HttpError } from '../http';
import type { updateCompanySchema } from '../validation';

export type CompanyDTO = {
  id: number;
  name: string;
  slug: string;
  sector: string | null;
  websiteUrl: string | null;
  context: string | null;
};

/** Admin list: every company, with the number of positions pointing to it. */
export type CompanyWithUsageDTO = CompanyDTO & { experienceCount: number };

const companyColumns = {
  id: companies.id,
  name: companies.name,
  slug: companies.slug,
  sector: companies.sector,
  websiteUrl: companies.websiteUrl,
  context: companies.context,
};

/** "Octelio Conseil" -> "octelio-conseil" (accents removed, anything else becomes a dash). */
export function slugify(name: string) {
  const slug = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'entreprise';
}

/** A slug no other company uses: "acme", then "acme-2", "acme-3"... */
async function uniqueSlug(tx: Executor, name: string, exceptId?: number) {
  const base = slugify(name);
  const rows = await tx
    .select({ id: companies.id, slug: companies.slug })
    .from(companies)
    .where(sql`${companies.slug} = ${base} or ${companies.slug} like ${`${base}-%`}`);
  const taken = new Set(rows.filter((row) => row.id !== exceptId).map((row) => row.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

const sameName = (name: string) => sql`lower(${companies.name}) = lower(${name})`;

/**
 * Company of a position, found by name whatever the case, or created (positions are typed
 * with a free company name in the admin; its context is filled in the "Entreprises" tab).
 */
export async function findOrCreateCompany(tx: Executor, name: string): Promise<{ id: number; name: string }> {
  const [existing] = await tx.select({ id: companies.id, name: companies.name }).from(companies).where(sameName(name)).limit(1);
  if (existing) return existing;
  const [created] = await tx
    .insert(companies)
    .values({ name, slug: await uniqueSlug(tx, name) })
    .returning({ id: companies.id, name: companies.name });
  return created;
}

export async function listCompaniesWithUsage(): Promise<CompanyWithUsageDTO[]> {
  // A join, not a correlated subquery: drizzle leaves columns unqualified in a single-table select,
  // so "id" inside a subquery on experiences would be the position id, not the company id
  return db
    .select({ ...companyColumns, experienceCount: count(experiences.id) })
    .from(companies)
    .leftJoin(experiences, eq(experiences.companyId, companies.id))
    .groupBy(companies.id)
    .orderBy(asc(sql`lower(${companies.name})`));
}

type UpdateInput = z.infer<typeof updateCompanySchema>;

export async function updateCompany(id: number, changes: UpdateInput): Promise<CompanyDTO> {
  return db.transaction(async (tx) => {
    const [current] = await tx.select({ id: companies.id }).from(companies).where(eq(companies.id, id));
    if (!current) throw new HttpError(404, 'Entreprise introuvable');

    const values: Partial<typeof companies.$inferInsert> = { ...changes };
    if (changes.name !== undefined) {
      const [duplicate] = await tx
        .select({ id: companies.id })
        .from(companies)
        .where(and(sameName(changes.name), ne(companies.id, id)))
        .limit(1);
      if (duplicate) throw new HttpError(409, 'Cette entreprise existe déjà');
      values.slug = await uniqueSlug(tx, changes.name, id);
      // Keep the deprecated copy on the positions in step with the new name
      await tx.update(experiences).set({ company: changes.name }).where(eq(experiences.companyId, id));
    }
    const [company] = await tx.update(companies).set(values).where(eq(companies.id, id)).returning(companyColumns);
    return company;
  });
}

/** Refused while a position points to it: delete or move those positions first. */
export async function deleteCompany(id: number) {
  const [used] = await db.select({ id: experiences.id }).from(experiences).where(eq(experiences.companyId, id)).limit(1);
  if (used) throw new HttpError(409, 'Cette entreprise a encore des postes : supprimez-les ou rattachez-les à une autre entreprise');
  const deleted = await db.delete(companies).where(eq(companies.id, id)).returning({ id: companies.id });
  if (deleted.length === 0) throw new HttpError(404, 'Entreprise introuvable');
}
