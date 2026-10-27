import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/current-user";

export async function getAdminUser() {
  const user = await getCurrentUser();
  return user?.role === "admin" ? user : null;
}

export async function requireAdminPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/masuk?next=/admin");
  if (user.role !== "admin") notFound();

  return user;
}
