import type { Metadata } from "next";
import Link from "next/link";

import { listAdminCategories } from "@/db/admin";
import { requireAdminPage } from "@/lib/admin";
import { buttonClass } from "@/lib/ui";
import { ProductForm } from "../product-form";

export const metadata: Metadata = {
  title: "Tambah produk",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  await requireAdminPage();
  const categories = await listAdminCategories();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/produk"
          className="text-xs text-muted transition-colors hover:text-text"
        >
          ← Daftar produk
        </Link>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
          Tambah produk
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Produk langsung tampil di katalog setelah disimpan.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm leading-6 text-muted">
            Belum ada kategori. Buat kategori terlebih dahulu sebelum menambah produk.
          </p>
          <Link
            href="/admin/kategori/baru"
            className={buttonClass("primary", "md", "mt-4")}
          >
            Tambah kategori
          </Link>
        </div>
      ) : (
        <ProductForm
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
          }))}
        />
      )}
    </div>
  );
}
