import { handler, ok, parseBody, requireAdmin } from '@/server/http';
import { tagSchema } from '@/server/validation';
import { createTag, listTags, listTagsWithUsage } from '@/server/services/tags';

// `?usage=1` adds how many experiences and projects use each tag (public, like the content itself)
export const GET = handler(async (request) => {
  const withUsage = new URL(request.url).searchParams.get('usage') === '1';
  return ok(withUsage ? await listTagsWithUsage() : await listTags());
});

export const POST = handler(async (request) => {
  await requireAdmin();
  const { name, domainId } = await parseBody(request, tagSchema);
  return ok(await createTag(name, domainId), 201);
});
