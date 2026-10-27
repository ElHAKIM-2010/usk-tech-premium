import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdminCategoryById } from "@/db/admin";
import { requireAdminPage } from "@/lib/admin";
import { CategoryForm } from "../category-form";

export const metadata: Metadata = {
  title: "Edit kategori",
  robots: { index: false, follow: false },
};

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const categoryId = Number(id);

  if (!Number.isInteger(categoryId) || categoryId <= 0) notFound();

  const category = await getAdminCategoryById(categoryId);
  if (!category) notFound();

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
          Edit {category.name}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Perubahan nama kategori ikut tampil pada produk terkait.
        </p>
      </div>

      <CategoryForm category={category} />
    </div>
  );
}
