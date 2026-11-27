import { handler, ok, parseBody, parseId, requireAdmin } from '@/server/http';
import { updateCompanySchema } from '@/server/validation';
import { deleteCompany, updateCompany } from '@/server/services/companies';

type Context = { params: Promise<{ id: string }> };

export const PATCH = handler<Context>(async (request: Request, { params }: Context) => {
  await requireAdmin();
  const id = parseId((await params).id);
  const changes = await parseBody(request, updateCompanySchema);
  return ok(await updateCompany(id, changes));
});

// 409 while a position points to the company
export const DELETE = handler<Context>(async (_request: Request, { params }: Context) => {
  await requireAdmin();
  await deleteCompany(parseId((await params).id));
  return ok(null);
});
