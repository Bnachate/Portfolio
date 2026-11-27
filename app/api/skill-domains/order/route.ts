import { handler, ok, parseBody, requireAdmin } from '@/server/http';
import { reorderSchema } from '@/server/validation';
import { listSkillDomains, reorderSkillDomains } from '@/server/services/skill-domains';

// New display order of the domains (admin "move up / down" buttons): every id, in order
export const PUT = handler(async (request: Request) => {
  await requireAdmin();
  const { ids } = await parseBody(request, reorderSchema);
  await reorderSkillDomains(ids);
  return ok(await listSkillDomains());
});
