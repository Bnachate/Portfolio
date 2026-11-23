import { asc, eq } from 'drizzle-orm';
import type { z } from 'zod';
import { db, type Executor } from '../db';
import { projects, projectTags } from '../db/schema';
import { HttpError } from '../http';
import type { createProjectSchema, updateProjectSchema } from '../validation';
import { assertTagsExist, type TagDTO } from './tags';

export type ProjectDTO = {
  id: number;
  title: string;
  description: string;
  projectImageUrl: string;
  githubUrl: string | null;
  demoUrl: string | null;
  position: number;
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

  return rows.map(({ projectTags: links, ...project }) => ({
    ...project,
    tags: links.map((link) => link.tag).sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

export const listProjects = () => findProjects(db);

async function getProject(tx: Executor, id: number) {
  const [project] = await findProjects(tx, id);
  if (!project) throw new HttpError(404, 'Projet introuvable');
  return project;
}

async function setTags(tx: Executor, projectId: number, tagIds: number[]) {
  const ids = await assertTagsExist(tx, tagIds);
  await tx.delete(projectTags).where(eq(projectTags.projectId, projectId));
  if (ids.length > 0) {
    await tx.insert(projectTags).values(ids.map((tagId) => ({ projectId, tagId })));
  }
}

export async function createProject({ tags = [], ...fields }: CreateInput) {
  return db.transaction(async (tx) => {
    const [{ id }] = await tx.insert(projects).values(fields).returning({ id: projects.id });
    await setTags(tx, id, tags);
    return getProject(tx, id);
  });
}

export async function updateProject(id: number, { tags, ...fields }: UpdateInput) {
  return db.transaction(async (tx) => {
    await getProject(tx, id);
    if (Object.keys(fields).length > 0) {
      await tx.update(projects).set(fields).where(eq(projects.id, id));
    }
    if (tags) await setTags(tx, id, tags);
    return getProject(tx, id);
  });
}

export async function deleteProject(id: number) {
  const deleted = await db.delete(projects).where(eq(projects.id, id)).returning({ id: projects.id });
  if (deleted.length === 0) throw new HttpError(404, 'Projet introuvable');
}
