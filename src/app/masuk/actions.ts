"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import {
  consumeRateLimit,
  getClientIp,
  peekRateLimit,
  retryAfterText,
} from "@/lib/rate-limit";

const EMAIL_ATTEMPT_LIMIT = 5;
const EMAIL_ATTEMPT_WINDOW_SECONDS = 15 * 60;
const IP_ATTEMPT_LIMIT = 15;
const IP_ATTEMPT_WINDOW_SECONDS = 5 * 60;

export interface LoginState {
  error?: string;
}

function safeRedirect(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/akun";
}

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  const emailKey = `login:email:${email}`;
  const ip = await getClientIp();
  const ipKey = ip ? `login:ip:${ip}` : null;

  const [emailStatus, ipStatus] = await Promise.all([
    peekRateLimit(emailKey, EMAIL_ATTEMPT_LIMIT, EMAIL_ATTEMPT_WINDOW_SECONDS),
    ipKey
      ? peekRateLimit(ipKey, IP_ATTEMPT_LIMIT, IP_ATTEMPT_WINDOW_SECONDS)
      : Promise.resolve({ allowed: true, retryAfterSeconds: 0 }),
  ]);

  if (!emailStatus.allowed || !ipStatus.allowed) {
    const wait = Math.max(
      emailStatus.retryAfterSeconds,
      ipStatus.retryAfterSeconds,
    );

    return {
      error: `Terlalu banyak percobaan masuk. Coba lagi dalam ${retryAfterText(wait)}.`,
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: safeRedirect(formData.get("next")),
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      await consumeRateLimit(
        emailKey,
        EMAIL_ATTEMPT_LIMIT,
        EMAIL_ATTEMPT_WINDOW_SECONDS,
      );

      if (ipKey) {
        await consumeRateLimit(ipKey, IP_ATTEMPT_LIMIT, IP_ATTEMPT_WINDOW_SECONDS);
      }

      return { error: "Email atau kata sandi tidak cocok." };
    }

    throw error;
  }
}
