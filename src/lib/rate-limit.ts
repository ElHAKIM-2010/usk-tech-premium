import { sql } from "drizzle-orm";
import { headers } from "next/headers";

import { getDb } from "@/db";

export interface RateLimitStatus {
  allowed: boolean;
  retryAfterSeconds: number;
}

const ALLOWED: RateLimitStatus = { allowed: true, retryAfterSeconds: 0 };

function readWindow(row: unknown) {
  const value = row as { count?: unknown; window_start?: unknown } | undefined;
  if (!value) return null;

  const windowStart = new Date(String(value.window_start));

  return {
    count: Number(value.count),
    windowStart,
  };
}

function blockedFor(windowStart: Date, windowSeconds: number): RateLimitStatus {
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((windowStart.getTime() + windowSeconds * 1000 - Date.now()) / 1000),
  );

  return { allowed: false, retryAfterSeconds };
}

export async function peekRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitStatus> {
  let result;

  try {
    result = await getDb().execute(
      sql`select count, window_start from rate_limits where key = ${key} limit 1`,
    );
  } catch {
    // Limiter tidak boleh mengunci pengguna saat database sedang tidak tersedia.
    return ALLOWED;
  }

  const row = readWindow(result.rows[0]);

  if (!row) return ALLOWED;
  if (Date.now() - row.windowStart.getTime() >= windowSeconds * 1000) return ALLOWED;
  if (row.count < limit) return ALLOWED;

  return blockedFor(row.windowStart, windowSeconds);
}

export async function consumeRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitStatus> {
  const db = getDb();
  let result;

  try {
    result = await db.execute(sql`
      insert into rate_limits (key, count, window_start)
      values (${key}, 1, now())
      on conflict (key) do update set
        count = case
          when rate_limits.window_start < now() - (${windowSeconds}::int * interval '1 second')
            then 1
          else rate_limits.count + 1
        end,
        window_start = case
          when rate_limits.window_start < now() - (${windowSeconds}::int * interval '1 second')
            then now()
          else rate_limits.window_start
        end
      returning count, window_start
    `);
  } catch {
    return ALLOWED;
  }

  const row = readWindow(result.rows[0]);

  if (Math.random() < 0.02) {
    db.execute(sql`delete from rate_limits where window_start < now() - interval '1 day'`).catch(
      () => undefined,
    );
  }

  if (!row || row.count <= limit) return ALLOWED;

  return blockedFor(row.windowStart, windowSeconds);
}

export async function getClientIp() {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for");
  const candidate =
    forwarded?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip")?.trim();

  return candidate ? candidate.slice(0, 64) : null;
}

export function retryAfterText(seconds: number) {
  if (seconds < 60) return "kurang dari 1 menit";

  const minutes = Math.ceil(seconds / 60);
  return `${minutes} menit`;
}
