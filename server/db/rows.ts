/**
 * The row a statement is known to return (an INSERT / UPDATE ... RETURNING, an aggregate without
 * GROUP BY). With noUncheckedIndexedAccess, `rows[0]` is `T | undefined`: this turns a broken
 * assumption into a clear error instead of a crash further away.
 */
export function onlyRow<T>(rows: readonly T[], what: string): T {
  const row: T | undefined = rows[0];
  if (row === undefined) throw new Error(`Expected a row: ${what}`);
  return row;
}
