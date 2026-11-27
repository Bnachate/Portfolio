import { after } from 'next/server';
import { handler, ok, parseBody, requireAdmin } from '@/server/http';
import { createContactSchema } from '@/server/validation';
import { rateLimit } from '@/server/rate-limit';
import { createContact, listContacts } from '@/server/services/contacts';
import { notifyNewContact } from '@/server/services/notifications';

export const GET = handler(async () => {
  await requireAdmin();
  return ok(await listContacts());
});

// Public: used by the contact form
export const POST = handler(async (request: Request) => {
  const { website, ...input } = await parseBody(request, createContactSchema);
  // Honeypot filled in: it's a bot. Pretend it worked without storing anything.
  if (website) return ok(null, 201);

  // At most 5 messages per hour from the same visitor
  await rateLimit(request, 'contact', { limit: 5, windowMs: 60 * 60 * 1000 });

  await createContact(input);
  // Sent after the response, so the visitor does not wait for the email provider
  after(() => notifyNewContact(input));
  return ok(null, 201);
});
