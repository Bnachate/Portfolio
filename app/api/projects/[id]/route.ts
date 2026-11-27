import { handler, ok, parseBody, parseId, requireAdmin } from '@/server/http';
import { updateProjectSchema } from '@/server/validation';
import { deleteProject, updateProject } from '@/server/services/projects';

type Context = { params: Promise<{ id: string }> };

export const PATCH = handler<Context>(async (request: Request, { params }: Context) => {
  await requireAdmin();
  const id = parseId((await params).id);
  const input = await parseBody(request, updateProjectSchema);
  return ok(await updateProject(id, input));
});

export const DELETE = handler<Context>(async (_request: Request, { params }: Context) => {
  await requireAdmin();
  await deleteProject(parseId((await params).id));
  return ok(null);
});
