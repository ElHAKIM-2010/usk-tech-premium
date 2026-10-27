import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type QueryResultRow } from "pg";

import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pgPool?: Pool };

let pool: Pool | undefined;

export function getPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  pool =
    globalForDb.pgPool ??
    new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });

  globalForDb.pgPool = pool;

  return pool;
}

export function query<R extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  return getPool().query<R>(text, params);
}

let database: NodePgDatabase<typeof schema> | undefined;

export function getDb() {
  database ??= drizzle(getPool(), { schema });
  return database;
}
