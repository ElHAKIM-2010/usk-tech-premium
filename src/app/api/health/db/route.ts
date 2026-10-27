import { NextResponse } from "next/server";
import { query } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await query<{ database: string; server_time: Date }>(
      "select current_database() as database, now() as server_time",
    );

    return NextResponse.json({
      ok: true,
      service: "postgres",
      database: result.rows[0].database,
      serverTime: result.rows[0].server_time.toISOString(),
    });
  } catch (error) {
    console.error("Postgres health check failed:", error);

    return NextResponse.json(
      { ok: false, service: "postgres", error: "Postgres unavailable" },
      { status: 503 },
    );
  }
}
