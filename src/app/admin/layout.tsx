import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdminPage } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdminPage();

  return (
    <div className="container-page py-6 lg:py-10">
      <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[17rem_minmax(0,1fr)]">
        <AdminSidebar name={admin.name} email={admin.email} />

        <div className="min-w-0">
          <header className="border-b border-border pb-6">
            <p className="eyebrow">Panel admin</p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Kontrol toko<span className="text-accent-text">.</span>
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Kelola katalog, pesanan, dan stok toko dari satu tempat.
            </p>
          </header>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
