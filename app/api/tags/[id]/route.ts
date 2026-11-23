import { handler, ok, parseId, requireAdmin } from '@/server/http';
import { deleteTag } from '@/server/services/tags';

type Context = { params: Promise<{ id: string }> };

export const DELETE = handler<Context>(async (_request, { params }) => {
  await requireAdmin();
  await deleteTag(parseId((await params).id));
  return ok(null);
});
