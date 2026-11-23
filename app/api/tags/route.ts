import { handler, ok, parseBody, requireAdmin } from '@/server/http';
import { createTagSchema } from '@/server/validation';
import { createTag, listTags } from '@/server/services/tags';

export const GET = handler(async () => ok(await listTags()));

export const POST = handler(async (request) => {
  await requireAdmin();
  const { name } = await parseBody(request, createTagSchema);
  return ok(await createTag(name), 201);
});
