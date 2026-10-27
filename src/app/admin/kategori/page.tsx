import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { DeleteButton } from "@/components/admin/delete-button";
import { listAdminCategories } from "@/db/admin";
import { requireAdminPage } from "@/lib/admin";
import { buttonClass } from "@/lib/ui";
import { deleteCategoryAction } from "./actions";

export const metadata: Metadata = {
  title: "Kelola kategori",
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  await requireAdminPage();
  const categories = await listAdminCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Kategori</h2>
          <p className="mt-1 text-sm text-muted">
            {categories.length} kategori. Kategori yang masih dipakai produk tidak bisa
            dihapus.
          </p>
        </div>

        <Link href="/admin/kategori/baru" className={buttonClass("primary", "md")}>
          <Plus className="size-4" aria-hidden="true" />
          Tambah kategori
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm leading-6 text-muted">
            Belum ada kategori.{" "}
            <Link
              href="/admin/kategori/baru"
              className="text-text underline underline-offset-4"
            >
              Tambahkan kategori pertama
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="label-mono px-5 py-3">Kategori</th>
                <th className="label-mono px-3 py-3">Slug</th>
                <th className="label-mono px-3 py-3">Urutan</th>
                <th className="label-mono px-3 py-3">Produk</th>
                <th className="label-mono px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-5 py-4 align-top">
                    <p className="font-medium">{category.name}</p>
                    <p className="mt-0.5 max-w-sm text-xs text-muted">
                      {category.tagline}
                    </p>
                  </td>
                  <td className="px-3 py-4 align-top font-mono text-[11px] text-muted">
                    /{category.slug}
                  </td>
                  <td className="px-3 py-4 align-top text-muted">
                    {category.sortOrder}
                  </td>
                  <td className="px-3 py-4 align-top text-muted">
                    {category.productCount}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/kategori/${category.id}`}
                        className={buttonClass("secondary", "sm")}
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteCategoryAction}
                        id={category.id}
                        confirmText={`Hapus kategori "${category.name}"?`}
                        disabled={category.productCount > 0}
                        disabledReason={`Masih dipakai ${category.productCount} produk. Pindahkan produk ke kategori lain terlebih dahulu.`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
