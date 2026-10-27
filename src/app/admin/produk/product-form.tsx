"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import {
  initialAdminActionState,
  specsToText,
  type AdminActionState,
} from "@/lib/admin-schemas";
import { buttonClass } from "@/lib/ui";
import type { ProductSpec } from "@/types/catalog";
import { saveProduct } from "./actions";

export interface ProductFormValues {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  description: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  image: string;
  badge: string | null;
  featured: boolean;
  isNew: boolean;
  releasedAt: string;
  specs: ProductSpec[];
}

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-bg px-3.5 py-3 text-sm text-text outline-none placeholder:text-muted focus:border-accent-text/60";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-1.5 text-xs text-danger">{message}</p>;
}

export function ProductForm({
  categories,
  product,
}: {
  categories: Array<{ id: number; name: string }>;
  product?: ProductFormValues;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveProduct,
    initialAdminActionState as AdminActionState,
  );

  useEffect(() => {
    if (state.status !== "success") return;

    if (!product) {
      router.push("/admin/produk");
      return;
    }

    router.refresh();
  }, [state.status, product, router]);

  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      {state.status === "error" ? (
        <p
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {state.message}
        </p>
      ) : null}

      {state.status === "success" ? (
        <p
          role="status"
          className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent-text"
        >
          {state.message}{" "}
          <Link href="/admin/produk" className="underline underline-offset-4">
            Kembali ke daftar produk
          </Link>
          .
        </p>
      ) : null}

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-display text-lg font-semibold">Informasi utama</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="label-mono">
              Nama produk
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={120}
              defaultValue={product?.name ?? ""}
              aria-invalid={Boolean(errors.name)}
              className={inputClass}
            />
            <FieldError message={errors.name} />
          </div>

          <div>
            <label htmlFor="slug" className="label-mono">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              required
              minLength={2}
              maxLength={80}
              defaultValue={product?.slug ?? ""}
              aria-invalid={Boolean(errors.slug)}
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-muted">
              Huruf kecil, angka, dan tanda hubung. Contoh: iphone-16.
            </p>
            <FieldError message={errors.slug} />
          </div>

          <div>
            <label htmlFor="categoryId" className="label-mono">
              Kategori
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={product?.categoryId ?? ""}
              aria-invalid={Boolean(errors.categoryId)}
              className={inputClass}
            >
              <option value="" disabled>
                Pilih kategori
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <FieldError message={errors.categoryId} />
          </div>

          <div>
            <label htmlFor="badge" className="label-mono">
              Badge (opsional)
            </label>
            <input
              id="badge"
              name="badge"
              type="text"
              maxLength={30}
              defaultValue={product?.badge ?? ""}
              placeholder="Baru, Terlaris, Hemat"
              aria-invalid={Boolean(errors.badge)}
              className={inputClass}
            />
            <FieldError message={errors.badge} />
          </div>

          <div>
            <label htmlFor="releasedAt" className="label-mono">
              Tanggal rilis
            </label>
            <input
              id="releasedAt"
              name="releasedAt"
              type="date"
              required
              defaultValue={
                product?.releasedAt ?? new Date().toISOString().slice(0, 10)
              }
              aria-invalid={Boolean(errors.releasedAt)}
              className={inputClass}
            />
            <FieldError message={errors.releasedAt} />
          </div>

          <div>
            <label htmlFor="image" className="label-mono">
              Path gambar
            </label>
            <input
              id="image"
              name="image"
              type="text"
              required
              maxLength={200}
              defaultValue={product?.image ?? "/products/"}
              placeholder="/products/nama-produk.jpg"
              aria-invalid={Boolean(errors.image)}
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-muted">
              Gunakan file lokal di folder public, mis. /products/iphone-16.jpg.
            </p>
            <FieldError message={errors.image} />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={product?.featured ?? false}
              className="size-4 rounded border-border"
            />
            Tampilkan sebagai unggulan
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isNew"
              defaultChecked={product?.isNew ?? false}
              className="size-4 rounded border-border"
            />
            Tandai sebagai produk baru
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-display text-lg font-semibold">Harga dan stok</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="price" className="label-mono">
              Harga jual (Rp)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              required
              min={1000}
              max={1000000000}
              step={1}
              defaultValue={product?.price ?? ""}
              aria-invalid={Boolean(errors.price)}
              className={inputClass}
            />
            <FieldError message={errors.price} />
          </div>

          <div>
            <label htmlFor="compareAtPrice" className="label-mono">
              Harga coret (opsional)
            </label>
            <input
              id="compareAtPrice"
              name="compareAtPrice"
              type="number"
              min={1000}
              max={1000000000}
              step={1}
              defaultValue={product?.compareAtPrice ?? ""}
              aria-invalid={Boolean(errors.compareAtPrice)}
              className={inputClass}
            />
            <FieldError message={errors.compareAtPrice} />
          </div>

          <div>
            <label htmlFor="stock" className="label-mono">
              Stok
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              required
              min={0}
              max={100000}
              step={1}
              defaultValue={product?.stock ?? 0}
              aria-invalid={Boolean(errors.stock)}
              className={inputClass}
            />
            <FieldError message={errors.stock} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-display text-lg font-semibold">Deskripsi dan spesifikasi</h2>

        <div className="mt-5 space-y-5">
          <div>
            <label htmlFor="description" className="label-mono">
              Deskripsi
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              minLength={20}
              maxLength={2000}
              defaultValue={product?.description ?? ""}
              aria-invalid={Boolean(errors.description)}
              className={inputClass}
            />
            <FieldError message={errors.description} />
          </div>

          <div>
            <label htmlFor="specs" className="label-mono">
              Spesifikasi
            </label>
            <textarea
              id="specs"
              name="specs"
              rows={5}
              defaultValue={product ? specsToText(product.specs) : ""}
              placeholder={"Layar: 6,1 inci OLED\nChip: A18\nBaterai: 3561 mAh"}
              aria-invalid={Boolean(errors.specs)}
              className={`${inputClass} font-mono text-xs`}
            />
            <p className="mt-1.5 text-xs text-muted">
              Satu baris per spesifikasi dengan format Label: Nilai. Maksimal 12 baris.
            </p>
            <FieldError message={errors.specs} />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className={buttonClass("primary", "md")}
        >
          {pending ? "Menyimpan…" : product ? "Simpan perubahan" : "Tambah produk"}
        </button>
        <Link href="/admin/produk" className={buttonClass("ghost", "md")}>
          Batal
        </Link>
      </div>
    </form>
  );
}
