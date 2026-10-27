import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { DeleteButton } from "@/components/admin/delete-button";
import { StockForm } from "@/components/admin/stock-form";
import { listAdminProducts } from "@/db/admin";
import { requireAdminPage } from "@/lib/admin";
import { formatIDR } from "@/lib/format";
import { buttonClass } from "@/lib/ui";
import { deleteProductAction } from "./actions";

export const metadata: Metadata = {
  title: "Kelola produk",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdminPage();
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const items = await listAdminProducts(query || undefined);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Produk</h2>
          <p className="mt-1 text-sm text-muted">
            {items.length} produk{query ? ` cocok dengan "${query}"` : " di katalog"}.
          </p>
        </div>

        <Link href="/admin/produk/baru" className={buttonClass("primary", "md")}>
          <Plus className="size-4" aria-hidden="true" />
          Tambah produk
        </Link>
      </div>

      <form
        action="/admin/produk"
        role="search"
        className="flex max-w-md items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 transition-colors focus-within:border-accent-text/60"
      >
        <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Cari nama atau slug"
          aria-label="Cari produk admin"
          className="w-full bg-transparent text-sm text-text outline-none placeholder:text-muted focus-visible:outline-none"
        />
        <button type="submit" className={buttonClass("ghost", "sm")}>
          Cari
        </button>
      </form>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm leading-6 text-muted">
            Tidak ada produk yang cocok.{" "}
            {query ? (
              <Link href="/admin/produk" className="text-text underline underline-offset-4">
                Hapus pencarian
              </Link>
            ) : (
              <Link
                href="/admin/produk/baru"
                className="text-text underline underline-offset-4"
              >
                Tambahkan produk pertama
              </Link>
            )}
            .
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="label-mono px-5 py-3">Produk</th>
                <th className="label-mono px-3 py-3">Kategori</th>
                <th className="label-mono px-3 py-3">Harga</th>
                <th className="label-mono px-3 py-3">Stok</th>
                <th className="label-mono px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((product) => (
                <tr key={product.id}>
                  <td className="px-5 py-4 align-top">
                    <p className="font-medium">{product.name}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted">
                      /{product.slug}
                      {product.featured ? " · unggulan" : ""}
                    </p>
                  </td>
                  <td className="px-3 py-4 align-top text-muted">
                    {product.categoryName}
                  </td>
                  <td className="px-3 py-4 align-top font-medium">
                    {formatIDR(product.price)}
                  </td>
                  <td className="px-3 py-4 align-top">
                    <StockForm
                      productId={product.id}
                      productName={product.name}
                      stock={product.stock}
                    />
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/produk/${product.id}`}
                        className={buttonClass("secondary", "sm")}
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteProductAction}
                        id={product.id}
                        confirmText={`Hapus produk "${product.name}"? Riwayat pesanan tetap menyimpan snapshot produk ini.`}
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
