import { handler, ok, parseBody, parseId, requireAdmin } from '@/server/http';
import { updateContactSchema } from '@/server/validation';
import { deleteContact, updateContactStatus } from '@/server/services/contacts';

type Context = { params: Promise<{ id: string }> };

export const PATCH = handler<Context>(async (request, { params }) => {
  await requireAdmin();
  const id = parseId((await params).id);
  const { status } = await parseBody(request, updateContactSchema);
  return ok(await updateContactStatus(id, status));
});

export const DELETE = handler<Context>(async (_request, { params }) => {
  await requireAdmin();
  await deleteContact(parseId((await params).id));
  return ok(null);
});
