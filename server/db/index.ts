import path from 'node:path';
import postgres from 'postgres';
import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { migrate as migratePostgres } from 'drizzle-orm/postgres-js/migrator';
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import * as schema from './schema';

/**
 * Database access.
 * - With DATABASE_URL set (production, or a local Postgres): uses postgres.js.
 * - Without it (local dev): uses PGlite, an embedded Postgres stored in ./.pglite.
 *   Only one process can open that folder at a time: stop `npm run dev`
 *   before running the db:* scripts.
 */

export type Database = ReturnType<typeof drizzlePostgres<typeof schema>>;
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];
// Anything that can run queries: the db itself or an open transaction
export type Executor = Database | Transaction;

const MIGRATIONS_FOLDER = path.join(process.cwd(), 'drizzle');
export const PGLITE_DIR = path.join(process.cwd(), '.pglite');

type Connection =
  | { kind: 'postgres'; db: Database; close: () => Promise<void> }
  | { kind: 'pglite'; db: Database; client: PGlite; close: () => Promise<void> };

function connect(): Connection {
  const url = process.env.DATABASE_URL;

  if (url) {
    // prepare: false keeps it compatible with transaction-mode poolers (Neon, Supabase)
    const client = postgres(url, { prepare: false, max: 5 });
    return {
      kind: 'postgres',
      db: drizzlePostgres(client, { schema }),
      close: () => client.end(),
    };
  }

  // On Vercel the filesystem is ephemeral: an embedded database would silently lose data.
  // Locally, PGlite is fine for both `npm run dev` and `npm start`.
  if (process.env.VERCEL) {
    throw new Error('DATABASE_URL must be set on Vercel (Project Settings > Environment Variables)');
  }

  // PGLITE_DATA_DIR lets the tests use a throwaway in-memory database ("memory://")
  const client = new PGlite(process.env.PGLITE_DATA_DIR || PGLITE_DIR);
  return {
    kind: 'pglite',
    // Both drivers expose the same query builder API
    db: drizzlePglite(client, { schema }) as unknown as Database,
    client,
    close: () => client.close(),
  };
}

// Cache the connection across hot reloads in dev to avoid opening it twice
const globalForDb = globalThis as unknown as { __portfolioDb?: Connection };

function getConnection(): Connection {
  if (!globalForDb.__portfolioDb) {
    globalForDb.__portfolioDb = connect();
  }
  return globalForDb.__portfolioDb;
}

// Lazy proxy so that importing this module never opens a connection by itself
export const db = new Proxy({} as Database, {
  get(_target: Database, prop: string | symbol): unknown {
    const real = getConnection().db as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === 'function' ? value.bind(real) : value;
  },
});

export async function runMigrations(): Promise<void> {
  const conn = getConnection();
  if (conn.kind === 'pglite') {
    await migratePglite(conn.db as unknown as Parameters<typeof migratePglite>[0], {
      migrationsFolder: MIGRATIONS_FOLDER,
    });
  } else {
    await migratePostgres(conn.db, { migrationsFolder: MIGRATIONS_FOLDER });
  }
}

export async function closeDb(): Promise<void> {
  if (globalForDb.__portfolioDb) {
    await globalForDb.__portfolioDb.close();
    globalForDb.__portfolioDb = undefined;
  }
}

export { schema };
