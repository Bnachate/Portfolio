import { handler, ok, parseBody, requireAdmin } from '@/server/http';
import { reorderSchema } from '@/server/validation';
import { listExperiences, reorderExperiences } from '@/server/services/experiences';

// New display order of the experiences (admin "move up / down" buttons): every id, in order
export const PUT = handler(async (request: Request) => {
  await requireAdmin();
  const { ids } = await parseBody(request, reorderSchema);
  await reorderExperiences(ids);
  return ok(await listExperiences());
});
