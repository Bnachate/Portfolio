import { handler, ok, parseBody, requireAdmin } from '@/server/http';
import { skillDomainSchema } from '@/server/validation';
import { createSkillDomain, listSkillDomains } from '@/server/services/skill-domains';

// Public: the domains title the sections of the "Compétences" page
export const GET = handler(async () => ok(await listSkillDomains()));

export const POST = handler(async (request) => {
  await requireAdmin();
  const { name } = await parseBody(request, skillDomainSchema);
  return ok(await createSkillDomain(name), 201);
});
