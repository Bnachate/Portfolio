import { eq, max, sql } from 'drizzle-orm';
import { db } from '../db';
import { companies, experiences, experienceTags, hero, projects, projectTags, skillDomains, tags } from '../db/schema';

/** Last change of each kind of content shown on the public pages (null when the table is empty). */
export type ContentDates = {
  hero: Date | null;
  experiences: Date | null;
  companies: Date | null;
  projects: Date | null;
  tags: Date | null;
  skillDomains: Date | null;
};

const toDate = (value: unknown) => (value === null || value === undefined ? null : new Date(value as string | Date));

const latest = (...dates: (Date | null | undefined)[]) =>
  dates.reduce<Date | null>((max, date) => (date && (!max || date > max) ? date : max), null);

/**
 * Latest `updated_at` of every content table, in one query. Creations, edits, tag changes and
 * reordering move these dates; deletions do not (the row is gone), which only makes lastmod lag.
 */
export async function getContentDates(): Promise<ContentDates> {
  const [row] = await db
    .select({
      hero: sql`(select max(${hero.updatedAt}) from ${hero})`,
      experiences: sql`(select max(${experiences.updatedAt}) from ${experiences})`,
      companies: sql`(select max(${companies.updatedAt}) from ${companies})`,
      projects: sql`(select max(${projects.updatedAt}) from ${projects})`,
      tags: sql`(select max(${tags.updatedAt}) from ${tags})`,
      skillDomains: sql`(select max(${skillDomains.updatedAt}) from ${skillDomains})`,
    })
    .from(sql`(select 1) as one`);
  return {
    hero: toDate(row.hero),
    experiences: toDate(row.experiences),
    companies: toDate(row.companies),
    projects: toDate(row.projects),
    tags: toDate(row.tags),
    skillDomains: toDate(row.skillDomains),
  };
}

// Plain or joined queries rather than correlated subqueries: drizzle leaves columns unqualified in a
// single-table select, so "id" inside a subquery would silently refer to the inner table.

/** Last change of each case study: the project itself or one of the tags it shows. */
export async function getProjectDates(): Promise<{ id: number; updatedAt: Date }[]> {
  const [rows, tagDates] = await Promise.all([
    db.select({ id: projects.id, updatedAt: projects.updatedAt }).from(projects).orderBy(projects.position),
    db
      .select({ projectId: projectTags.projectId, latest: max(tags.updatedAt) })
      .from(projectTags)
      .innerJoin(tags, eq(tags.id, projectTags.tagId))
      .groupBy(projectTags.projectId),
  ]);
  const latestTag = new Map(tagDates.map(({ projectId, latest: date }) => [projectId, toDate(date)]));
  return rows.map(({ id, updatedAt }) => ({ id, updatedAt: latest(updatedAt, latestTag.get(id))! }));
}

/**
 * Last change of each employer page (/experience/[slug]): the company, its positions or their tags.
 * Companies without a position have no page and are left out.
 */
export async function getEmployerDates(): Promise<{ slug: string; updatedAt: Date }[]> {
  const [positions, tagDates] = await Promise.all([
    db
      .select({ slug: companies.slug, company: companies.updatedAt, position: max(experiences.updatedAt) })
      .from(companies)
      .innerJoin(experiences, eq(experiences.companyId, companies.id))
      .groupBy(companies.id, companies.slug, companies.updatedAt),
    db
      .select({ slug: companies.slug, latest: max(tags.updatedAt) })
      .from(companies)
      .innerJoin(experiences, eq(experiences.companyId, companies.id))
      .innerJoin(experienceTags, eq(experienceTags.experienceId, experiences.id))
      .innerJoin(tags, eq(tags.id, experienceTags.tagId))
      .groupBy(companies.slug),
  ]);
  const latestTag = new Map(tagDates.map(({ slug, latest: date }) => [slug, toDate(date)]));
  return positions.map(({ slug, company, position }) => ({
    slug,
    updatedAt: latest(company, toDate(position), latestTag.get(slug))!,
  }));
}
