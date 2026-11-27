import { handler, ok, parseBody, requireAdmin } from '@/server/http';
import { heroSchema } from '@/server/validation';
import { getCurrentUser } from '@/server/auth';
import { getHero, getPublicHero, saveHero } from '@/server/services/hero';

// The contact email is only returned to the admin
export const GET = handler(async () => ok((await getCurrentUser()) ? await getHero() : await getPublicHero()));

export const PUT = handler(async (request: Request) => {
  await requireAdmin();
  const input = await parseBody(request, heroSchema);
  return ok(await saveHero(input));
});
