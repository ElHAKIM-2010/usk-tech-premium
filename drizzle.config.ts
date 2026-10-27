import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL_UNPOOLED atau DATABASE_URL harus tersedia untuk migrasi.");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  migrations: {
    schema: "public",
    table: "__drizzle_migrations",
  },
  strict: true,
  verbose: true,
});
