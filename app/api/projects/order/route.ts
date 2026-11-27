import { handler, ok, parseBody, requireAdmin } from '@/server/http';
import { reorderSchema } from '@/server/validation';
import { listProjects, reorderProjects } from '@/server/services/projects';

// New display order of the projects (admin "move up / down" buttons): every id, in order
export const PUT = handler(async (request: Request) => {
  await requireAdmin();
  const { ids } = await parseBody(request, reorderSchema);
  await reorderProjects(ids);
  return ok(await listProjects());
});
