import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdminProductById, listAdminCategories } from "@/db/admin";
import { requireAdminPage } from "@/lib/admin";
import { ProductForm } from "../product-form";

export const metadata: Metadata = {
  title: "Edit produk",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) notFound();

  const [product, categories] = await Promise.all([
    getAdminProductById(productId),
    listAdminCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/produk"
            className="text-xs text-muted transition-colors hover:text-text"
          >
            ← Daftar produk
          </Link>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
            Edit {product.name}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Perubahan harga dan stok berlaku untuk pesanan baru.
          </p>
        </div>
        <Link
          href={`/products/${product.slug}`}
          className="text-xs text-muted underline underline-offset-4 transition-colors hover:text-text"
        >
          Lihat di katalog
        </Link>
      </div>

      <ProductForm
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
        product={product}
      />
    </div>
  );
}
