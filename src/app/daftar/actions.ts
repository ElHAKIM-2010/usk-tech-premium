"use server";

import { AuthError } from "next-auth";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

import { signIn } from "@/auth";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import {
  consumeRateLimit,
  getClientIp,
  retryAfterText,
} from "@/lib/rate-limit";

const REGISTER_LIMIT = 5;
const REGISTER_WINDOW_SECONDS = 60 * 60;

export interface RegisterState {
  error?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function errorCode(error: unknown): unknown {
  if (typeof error !== "object" || error === null) return undefined;
  if ("code" in error) return (error as { code?: unknown }).code;
  if ("cause" in error) return errorCode((error as { cause?: unknown }).cause);
  return undefined;
}

function isUniqueViolation(error: unknown) {
  return errorCode(error) === "23505";
}

export async function register(
  _state: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (name.length < 2 || name.length > 80) {
    return { error: "Nama harus 2–80 karakter." };
  }

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { error: "Alamat email tidak valid." };
  }

  if (password.length < 8) {
    return { error: "Kata sandi minimal 8 karakter." };
  }

  if (password.length > 72) {
    return { error: "Kata sandi maksimal 72 karakter." };
  }

  if (password !== confirm) {
    return { error: "Konfirmasi kata sandi tidak cocok." };
  }

  const ip = await getClientIp();
  const limitKey = ip ? `register:ip:${ip}` : `register:email:${email}`;
  const status = await consumeRateLimit(
    limitKey,
    REGISTER_LIMIT,
    REGISTER_WINDOW_SECONDS,
  );

  if (!status.allowed) {
    return {
      error: `Terlalu banyak pendaftaran. Coba lagi dalam ${retryAfterText(status.retryAfterSeconds)}.`,
    };
  }

  const db = getDb();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return { error: "Email ini sudah terdaftar. Silakan masuk." };
  }

  const passwordHash = await hash(password, 12);

  try {
    await db.insert(users).values({ name, email, passwordHash });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "Email ini sudah terdaftar. Silakan masuk." };
    }

    console.error(
      "Registrasi gagal:",
      error instanceof Error ? error.name : "unknown error",
    );
    throw error;
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/akun" });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Akun dibuat, tetapi masuk otomatis gagal. Silakan masuk manual.",
      };
    }

    throw error;
  }

  return {};
}
