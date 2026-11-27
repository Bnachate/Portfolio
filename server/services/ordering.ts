import { eq } from 'drizzle-orm';
import { db, type Transaction } from '../db';
import { experiences, projects, skillDomains } from '../db/schema';
import { HttpError } from '../http';

/**
 * Saves a new display order for a whole list: positions become 0, 1, 2... following `ids`.
 * `ids` must contain every row of the table exactly once, so a stale admin page (a row added
 * or deleted meanwhile) gets a 409 instead of silently mixing up the order.
 */
export async function reorder(table: typeof experiences | typeof projects | typeof skillDomains, ids: number[]): Promise<void> {
  await db.transaction(async (tx: Transaction) => {
    const rows = await tx.select({ id: table.id }).from(table);
    const existing = new Set(rows.map((row: { id: number }) => row.id));
    if (existing.size !== ids.length || ids.some((id: number) => !existing.has(id))) {
      throw new HttpError(409, 'La liste a changé entre-temps : rechargez la page');
    }
    for (const [position, id] of ids.entries()) {
      await tx.update(table).set({ position }).where(eq(table.id, id));
    }
  });
}
