import { handler, ok, parseBody, parseId, requireAdmin } from '@/server/http';
import { updateTagSchema } from '@/server/validation';
import { deleteTag, updateTag } from '@/server/services/tags';

type Context = { params: Promise<{ id: string }> };

// Rename and / or change the domain
export const PATCH = handler<Context>(async (request, { params }) => {
  await requireAdmin();
  const id = parseId((await params).id);
  const changes = await parseBody(request, updateTagSchema);
  return ok(await updateTag(id, changes));
});

// Also removes the tag from every experience and project using it (ON DELETE CASCADE)
export const DELETE = handler<Context>(async (_request, { params }) => {
  await requireAdmin();
  await deleteTag(parseId((await params).id));
  return ok(null);
});
