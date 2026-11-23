import { handler, ok, parseBody, requireAdmin } from '@/server/http';
import { heroSchema } from '@/server/validation';
import { getHero, saveHero } from '@/server/services/hero';

export const GET = handler(async () => ok(await getHero()));

export const PUT = handler(async (request) => {
  await requireAdmin();
  const input = await parseBody(request, heroSchema);
  return ok(await saveHero(input));
});
