import { eq } from 'drizzle-orm';
import { db } from '../db';
import { experiences, projects, skillDomains } from '../db/schema';
import { HttpError } from '../http';

/**
 * Saves a new display order for a whole list: positions become 0, 1, 2... following `ids`.
 * `ids` must contain every row of the table exactly once, so a stale admin page (a row added
 * or deleted meanwhile) gets a 409 instead of silently mixing up the order.
 */
export async function reorder(table: typeof experiences | typeof projects | typeof skillDomains, ids: number[]) {
  await db.transaction(async (tx) => {
    const rows = await tx.select({ id: table.id }).from(table);
    const existing = new Set(rows.map((row) => row.id));
    if (existing.size !== ids.length || ids.some((id) => !existing.has(id))) {
      throw new HttpError(409, 'La liste a changé entre-temps : rechargez la page');
    }
    for (const [position, id] of ids.entries()) {
      await tx.update(table).set({ position }).where(eq(table.id, id));
    }
  });
}
