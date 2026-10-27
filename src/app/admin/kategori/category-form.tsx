"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { initialAdminActionState } from "@/lib/admin-schemas";
import { buttonClass } from "@/lib/ui";
import { saveCategory } from "./actions";

export interface CategoryFormValues {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  image: string;
  sortOrder: number;
}

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-bg px-3.5 py-3 text-sm text-text outline-none placeholder:text-muted focus:border-accent-text/60";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-1.5 text-xs text-danger">{message}</p>;
}

export function CategoryForm({ category }: { category?: CategoryFormValues }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveCategory,
    initialAdminActionState,
  );

  useEffect(() => {
    if (state.status !== "success") return;

    if (!category) {
      router.push("/admin/kategori");
      return;
    }

    router.refresh();
  }, [state.status, category, router]);

  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}

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
          <Link href="/admin/kategori" className="underline underline-offset-4">
            Kembali ke daftar kategori
          </Link>
          .
        </p>
      ) : null}

      <section className="rounded-2xl border border-border bg-surface p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="label-mono">
              Nama kategori
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={60}
              defaultValue={category?.name ?? ""}
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
              maxLength={60}
              defaultValue={category?.slug ?? ""}
              aria-invalid={Boolean(errors.slug)}
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-muted">
              Dipakai di URL filter, mis. laptop.
            </p>
            <FieldError message={errors.slug} />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="tagline" className="label-mono">
              Tagline
            </label>
            <input
              id="tagline"
              name="tagline"
              type="text"
              required
              minLength={5}
              maxLength={140}
              defaultValue={category?.tagline ?? ""}
              aria-invalid={Boolean(errors.tagline)}
              className={inputClass}
            />
            <FieldError message={errors.tagline} />
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
              defaultValue={category?.image ?? "/products/"}
              placeholder="/products/kategori.jpg"
              aria-invalid={Boolean(errors.image)}
              className={inputClass}
            />
            <FieldError message={errors.image} />
          </div>

          <div>
            <label htmlFor="sortOrder" className="label-mono">
              Urutan tampil
            </label>
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              required
              min={0}
              max={999}
              step={1}
              defaultValue={category?.sortOrder ?? 0}
              aria-invalid={Boolean(errors.sortOrder)}
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-muted">Angka kecil tampil lebih dulu.</p>
            <FieldError message={errors.sortOrder} />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className={buttonClass("primary", "md")}
        >
          {pending ? "Menyimpan…" : category ? "Simpan perubahan" : "Tambah kategori"}
        </button>
        <Link href="/admin/kategori" className={buttonClass("ghost", "md")}>
          Batal
        </Link>
      </div>
    </form>
  );
}
