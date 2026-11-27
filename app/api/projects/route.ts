import { handler, ok, parseBody, requireAdmin } from '@/server/http';
import { createProjectSchema } from '@/server/validation';
import { createProject, listProjects } from '@/server/services/projects';

export const GET = handler(async () => ok(await listProjects()));

export const POST = handler(async (request: Request) => {
  await requireAdmin();
  const input = await parseBody(request, createProjectSchema);
  return ok(await createProject(input), 201);
});
