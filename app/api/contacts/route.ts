import { handler, ok, parseBody, requireAdmin } from '@/server/http';
import { createContactSchema } from '@/server/validation';
import { createContact, listContacts } from '@/server/services/contacts';

export const GET = handler(async () => {
  await requireAdmin();
  return ok(await listContacts());
});

// Public: used by the contact form
export const POST = handler(async (request) => {
  const { website, ...input } = await parseBody(request, createContactSchema);
  // Honeypot filled in: it's a bot. Pretend it worked without storing anything.
  if (website) return ok(null, 201);
  await createContact(input);
  return ok(null, 201);
});
