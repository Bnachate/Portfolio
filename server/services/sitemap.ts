import { eq, max, sql } from 'drizzle-orm';
import { db } from '../db';
import { experiences, hero, projects, projectTags, skillDomains, tags } from '../db/schema';

/** Last change of each kind of content shown on the public pages (null when the table is empty). */
export type ContentDates = {
  hero: Date | null;
  experiences: Date | null;
  projects: Date | null;
  tags: Date | null;
  skillDomains: Date | null;
};

const toDate = (value: unknown) => (value === null || value === undefined ? null : new Date(value as string | Date));

/**
 * Latest `updated_at` of every content table, in one query. Creations, edits, tag changes and
 * reordering move these dates; deletions do not (the row is gone), which only makes lastmod lag.
 */
export async function getContentDates(): Promise<ContentDates> {
  const [row] = await db
    .select({
      hero: sql`(select max(${hero.updatedAt}) from ${hero})`,
      experiences: sql`(select max(${experiences.updatedAt}) from ${experiences})`,
      projects: sql`(select max(${projects.updatedAt}) from ${projects})`,
      tags: sql`(select max(${tags.updatedAt}) from ${tags})`,
      skillDomains: sql`(select max(${skillDomains.updatedAt}) from ${skillDomains})`,
    })
    .from(sql`(select 1) as one`);
  return {
    hero: toDate(row.hero),
    experiences: toDate(row.experiences),
    projects: toDate(row.projects),
    tags: toDate(row.tags),
    skillDomains: toDate(row.skillDomains),
  };
}

/** Last change of each case study: the project itself or one of the tags it shows. */
export async function getProjectDates(): Promise<{ id: number; updatedAt: Date }[]> {
  // Two plain queries rather than a correlated subquery: drizzle leaves columns unqualified in a
  // single-table select, so "id" inside a subquery would silently refer to the inner table.
  const [rows, tagDates] = await Promise.all([
    db.select({ id: projects.id, updatedAt: projects.updatedAt }).from(projects).orderBy(projects.position),
    db
      .select({ projectId: projectTags.projectId, latest: max(tags.updatedAt) })
      .from(projectTags)
      .innerJoin(tags, eq(tags.id, projectTags.tagId))
      .groupBy(projectTags.projectId),
  ]);
  const latestTag = new Map(tagDates.map(({ projectId, latest }) => [projectId, toDate(latest)]));
  return rows.map(({ id, updatedAt }) => {
    const tagDate = latestTag.get(id);
    return { id, updatedAt: tagDate && tagDate > updatedAt ? tagDate : updatedAt };
  });
}
