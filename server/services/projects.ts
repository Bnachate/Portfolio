import { asc, eq } from 'drizzle-orm';
import type { z } from 'zod';
import { db, type Executor, type Transaction } from '../db';
import { onlyRow } from '../db/rows';
import { projects, projectTags } from '../db/schema';
import { HttpError } from '../http';
import type { createProjectSchema, updateProjectSchema } from '../validation';
import { assertTagsExist, type TagDTO } from './tags';
import { reorder } from './ordering';

export type ProjectDTO = {
  id: number;
  title: string;
  description: string;
  projectImageUrl: string;
  githubUrl: string | null;
  demoUrl: string | null;
  position: number;
  // Case study, null while not written yet
  kind: string | null;
  scope: string | null;
  role: string | null;
  context: string | null;
  achievements: string | null;
  results: string | null;
  tags: TagDTO[];
};

type CreateInput = z.infer<typeof createProjectSchema>;
type UpdateInput = z.infer<typeof updateProjectSchema>;

async function findProjects(tx: Executor, id?: number): Promise<ProjectDTO[]> {
  const rows = await tx.query.projects.findMany({
    where: id ? eq(projects.id, id) : undefined,
    orderBy: [asc(projects.position), asc(projects.id)],
    columns: { createdAt: false, updatedAt: false },
    with: { projectTags: { with: { tag: { columns: { id: true, name: true } } } } },
  });

  return rows.map(({ projectTags: links, ...project }: (typeof rows)[number]) => ({
    ...project,
    tags: links.map((link: { tag: TagDTO }) => link.tag).sort((a: TagDTO, b: TagDTO) => a.name.localeCompare(b.name)),
  }));
}

export const listProjects = (): Promise<ProjectDTO[]> => findProjects(db);

/** One project for its public case study page, or null if it does not exist. */
export async function findProject(id: number): Promise<ProjectDTO | null> {
  const [project] = await findProjects(db, id);
  return project ?? null;
}

/** Saves a new display order: `ids` must list every project exactly once. */
export const reorderProjects = (ids: number[]): Promise<void> => reorder(projects, ids);

async function getProject(tx: Executor, id: number): Promise<ProjectDTO> {
  const [project] = await findProjects(tx, id);
  if (!project) throw new HttpError(404, 'Projet introuvable');
  return project;
}

async function setTags(tx: Executor, projectId: number, tagIds: number[]): Promise<void> {
  const ids = await assertTagsExist(tx, tagIds);
  await tx.delete(projectTags).where(eq(projectTags.projectId, projectId));
  if (ids.length > 0) {
    await tx.insert(projectTags).values(ids.map((tagId: number) => ({ projectId, tagId })));
  }
}

export async function createProject({ tags = [], ...fields }: CreateInput): Promise<ProjectDTO> {
  return db.transaction(async (tx: Transaction) => {
    const { id } = onlyRow(await tx.insert(projects).values(fields).returning({ id: projects.id }), 'insert project');
    await setTags(tx, id, tags);
    return getProject(tx, id);
  });
}

export async function updateProject(id: number, { tags, ...fields }: UpdateInput): Promise<ProjectDTO> {
  return db.transaction(async (tx: Transaction) => {
    await getProject(tx, id);
    // Always touch the row, so a change of tags alone also moves updated_at (sitemap lastmod)
    if (Object.keys(fields).length > 0 || tags) {
      await tx.update(projects).set({ ...fields, updatedAt: new Date() }).where(eq(projects.id, id));
    }
    if (tags) await setTags(tx, id, tags);
    return getProject(tx, id);
  });
}

export async function deleteProject(id: number): Promise<void> {
  const deleted = await db.delete(projects).where(eq(projects.id, id)).returning({ id: projects.id });
  if (deleted.length === 0) throw new HttpError(404, 'Projet introuvable');
}
