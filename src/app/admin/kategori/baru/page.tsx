import type { Metadata } from "next";
import Link from "next/link";

import { requireAdminPage } from "@/lib/admin";
import { CategoryForm } from "../category-form";

export const metadata: Metadata = {
  title: "Tambah kategori",
  robots: { index: false, follow: false },
};

export default async function NewCategoryPage() {
  await requireAdminPage();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/kategori"
          className="text-xs text-muted transition-colors hover:text-text"
        >
          ← Daftar kategori
        </Link>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
          Tambah kategori
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Kategori baru langsung tersedia sebagai filter di katalog.
        </p>
      </div>

      <CategoryForm />
    </div>
  );
}
