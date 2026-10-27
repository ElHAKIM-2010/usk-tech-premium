import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { users } from "../src/db/schema";
import type { UserRole } from "../src/types/user";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
const email = process.argv[2]?.trim().toLowerCase();
const role: UserRole = process.argv[3] === "customer" ? "customer" : "admin";

if (!connectionString) {
  throw new Error("DATABASE_URL_UNPOOLED atau DATABASE_URL harus tersedia.");
}

if (!email) {
  console.error("Pakai: npm run db:admin -- email@contoh.com [customer]");
  process.exit(1);
}

const pool = new Pool({ connectionString, max: 1 });
const db = drizzle(pool);

async function main() {
  const [row] = await db
    .update(users)
    .set({ role })
    .where(eq(users.email, email))
    .returning({ email: users.email, role: users.role });

  if (!row) {
    console.error(`Akun ${email} tidak ditemukan.`);
    process.exitCode = 1;
    return;
  }

  console.log(`Akun ${row.email} sekarang memiliki role ${row.role}.`);
}

main().finally(() => pool.end());
