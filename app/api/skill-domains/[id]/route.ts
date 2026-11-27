import { handler, ok, parseBody, parseId, requireAdmin } from '@/server/http';
import { skillDomainSchema } from '@/server/validation';
import { deleteSkillDomain, renameSkillDomain } from '@/server/services/skill-domains';

type Context = { params: Promise<{ id: string }> };

export const PATCH = handler<Context>(async (request: Request, { params }: Context) => {
  await requireAdmin();
  const id = parseId((await params).id);
  const { name } = await parseBody(request, skillDomainSchema);
  return ok(await renameSkillDomain(id, name));
});

// Its tags are kept and move to "Autres" (ON DELETE SET NULL)
export const DELETE = handler<Context>(async (_request: Request, { params }: Context) => {
  await requireAdmin();
  await deleteSkillDomain(parseId((await params).id));
  return ok(null);
});
