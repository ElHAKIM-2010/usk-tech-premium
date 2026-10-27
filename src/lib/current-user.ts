import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { getDb } from "@/db";
import { users } from "@/db/schema";

export async function getCurrentUser() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) return null;

  const [user] = await getDb()
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user ?? null;
}
