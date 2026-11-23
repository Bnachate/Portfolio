import { handler, ok, parseBody, requireAdmin } from '@/server/http';
import { tagSchema } from '@/server/validation';
import { createTag, listTags, listTagsWithUsage } from '@/server/services/tags';

// `?usage=1` (admin only) adds how many experiences and projects use each tag
export const GET = handler(async (request) => {
  if (new URL(request.url).searchParams.get('usage') === '1') {
    await requireAdmin();
    return ok(await listTagsWithUsage());
  }
  return ok(await listTags());
});

export const POST = handler(async (request) => {
  await requireAdmin();
  const { name } = await parseBody(request, tagSchema);
  return ok(await createTag(name), 201);
});
