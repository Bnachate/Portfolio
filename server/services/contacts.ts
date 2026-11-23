import { desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { contactMessages, type ContactStatus } from '../db/schema';
import { HttpError } from '../http';

const publicColumns = {
  id: contactMessages.id,
  name: contactMessages.name,
  email: contactMessages.email,
  subject: contactMessages.subject,
  message: contactMessages.message,
  status: contactMessages.status,
  createdAt: contactMessages.createdAt,
};

export async function listContacts() {
  return db.select(publicColumns).from(contactMessages).orderBy(desc(contactMessages.createdAt));
}

export async function createContact(input: { name: string; email: string; subject?: string; message: string }) {
  const [contact] = await db
    .insert(contactMessages)
    .values({ ...input, subject: input.subject || null })
    .returning({ id: contactMessages.id });
  return contact;
}

export async function updateContactStatus(id: number, status: ContactStatus) {
  const [contact] = await db
    .update(contactMessages)
    .set({ status })
    .where(eq(contactMessages.id, id))
    .returning(publicColumns);
  if (!contact) throw new HttpError(404, 'Message introuvable');
  return contact;
}

export async function deleteContact(id: number) {
  const deleted = await db.delete(contactMessages).where(eq(contactMessages.id, id)).returning({ id: contactMessages.id });
  if (deleted.length === 0) throw new HttpError(404, 'Message introuvable');
}
