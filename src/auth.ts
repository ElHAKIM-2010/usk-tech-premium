import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { users } from "@/db/schema";
import { consumeRateLimit, peekRateLimit } from "@/lib/rate-limit";

const AUTH_ATTEMPT_LIMIT = 10;
const AUTH_ATTEMPT_WINDOW_SECONDS = 15 * 60;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/masuk" },
  providers: [
    Credentials({
      name: "Email dan kata sandi",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Kata sandi", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials.password === "string" ? credentials.password : "";

        if (!email || !password) return null;

        const attemptKey = `auth:email:${email}`;
        const status = await peekRateLimit(
          attemptKey,
          AUTH_ATTEMPT_LIMIT,
          AUTH_ATTEMPT_WINDOW_SECONDS,
        );

        if (!status.allowed) return null;

        const db = getDb();
        const [user] = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            passwordHash: users.passwordHash,
          })
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) {
          await consumeRateLimit(
            attemptKey,
            AUTH_ATTEMPT_LIMIT,
            AUTH_ATTEMPT_WINDOW_SECONDS,
          );
          return null;
        }

        const valid = await compare(password, user.passwordHash);
        if (!valid) {
          await consumeRateLimit(
            attemptKey,
            AUTH_ATTEMPT_LIMIT,
            AUTH_ATTEMPT_WINDOW_SECONDS,
          );
          return null;
        }

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
});
