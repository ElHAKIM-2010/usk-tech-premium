import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdminPage } from "@/lib/admin";
import { buttonClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdminPage();

  return (
    <div className="container-page py-8 lg:py-12">
      <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Panel admin</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Kontrol toko<span className="text-accent-text">.</span>
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Masuk sebagai {admin.name} · {admin.email}
          </p>
        </div>

        <Link href="/" className={buttonClass("secondary", "md")}>
          Lihat toko
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <AdminNav />

      <div className="mt-8">{children}</div>
    </div>
  );
}
