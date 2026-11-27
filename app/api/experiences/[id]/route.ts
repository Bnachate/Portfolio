import { handler, ok, parseBody, parseId, requireAdmin } from '@/server/http';
import { updateExperienceSchema } from '@/server/validation';
import { deleteExperience, updateExperience } from '@/server/services/experiences';

type Context = { params: Promise<{ id: string }> };

export const PATCH = handler<Context>(async (request: Request, { params }: Context) => {
  await requireAdmin();
  const id = parseId((await params).id);
  const input = await parseBody(request, updateExperienceSchema);
  return ok(await updateExperience(id, input));
});

export const DELETE = handler<Context>(async (_request: Request, { params }: Context) => {
  await requireAdmin();
  await deleteExperience(parseId((await params).id));
  return ok(null);
});
