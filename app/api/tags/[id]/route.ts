import { handler, ok, parseBody, parseId, requireAdmin } from '@/server/http';
import { tagSchema } from '@/server/validation';
import { deleteTag, updateTag } from '@/server/services/tags';

type Context = { params: Promise<{ id: string }> };

export const PATCH = handler<Context>(async (request, { params }) => {
  await requireAdmin();
  const id = parseId((await params).id);
  const { name } = await parseBody(request, tagSchema);
  return ok(await updateTag(id, name));
});

// Also removes the tag from every experience and project using it (ON DELETE CASCADE)
export const DELETE = handler<Context>(async (_request, { params }) => {
  await requireAdmin();
  await deleteTag(parseId((await params).id));
  return ok(null);
});
