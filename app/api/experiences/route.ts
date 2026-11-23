import { handler, ok, parseBody, requireAdmin } from '@/server/http';
import { createExperienceSchema } from '@/server/validation';
import { createExperience, listExperiences } from '@/server/services/experiences';

export const GET = handler(async () => ok(await listExperiences()));

export const POST = handler(async (request) => {
  await requireAdmin();
  const input = await parseBody(request, createExperienceSchema);
  return ok(await createExperience(input), 201);
});
