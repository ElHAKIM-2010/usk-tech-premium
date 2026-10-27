import { z } from "zod";

import type { ProductSpec } from "@/types/catalog";
import type { OrderStatus, PaymentStatus } from "@/types/order";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const localImagePattern = /^\/(?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9._-]+$/;

export const orderStatusValues = [
  "pending",
  "diproses",
  "dikirim",
  "selesai",
  "dibatalkan",
] as const satisfies readonly OrderStatus[];

export interface AdminActionState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const initialAdminActionState: AdminActionState = { status: "idle" };

export function fieldErrorsFrom(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }

  return fieldErrors;
}

export const paymentStatusValues = [
  "pending",
  "paid",
  "failed",
  "refunded",
] as const satisfies readonly PaymentStatus[];

export const productFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nama produk minimal 2 karakter.")
      .max(120, "Nama produk maksimal 120 karakter."),
    slug: z
      .string()
      .trim()
      .min(2, "Slug minimal 2 karakter.")
      .max(80, "Slug maksimal 80 karakter.")
      .regex(slugPattern, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
    categoryId: z
      .number({ error: "Pilih kategori." })
      .int("Kategori tidak valid.")
      .positive("Pilih kategori."),
    description: z
      .string()
      .trim()
      .min(20, "Deskripsi minimal 20 karakter.")
      .max(2000, "Deskripsi maksimal 2000 karakter."),
    price: z
      .number({ error: "Harga wajib diisi dengan angka." })
      .int("Harga harus bilangan bulat.")
      .min(1000, "Harga minimal Rp 1.000.")
      .max(1_000_000_000, "Harga terlalu besar."),
    compareAtPrice: z
      .number({ error: "Harga coret harus berupa angka." })
      .int("Harga coret harus bilangan bulat.")
      .min(1000, "Harga coret minimal Rp 1.000.")
      .max(1_000_000_000, "Harga coret terlalu besar.")
      .nullable(),
    stock: z
      .number({ error: "Stok wajib diisi dengan angka." })
      .int("Stok harus bilangan bulat.")
      .min(0, "Stok tidak boleh negatif.")
      .max(100000, "Stok maksimal 100.000."),
    image: z
      .string()
      .trim()
      .min(1, "Path gambar wajib diisi.")
      .max(200, "Path gambar terlalu panjang.")
      .regex(localImagePattern, "Gunakan path lokal, mis. /products/nama.jpg."),
    badge: z.string().trim().max(30, "Badge maksimal 30 karakter.").nullable(),
    featured: z.boolean(),
    isNew: z.boolean(),
    releasedAt: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal rilis harus format YYYY-MM-DD.")
      .refine((value) => !Number.isNaN(Date.parse(value)), "Tanggal rilis tidak valid."),
    specs: z
      .array(
        z.object({
          label: z.string().trim().min(1, "Label spesifikasi wajib diisi.").max(40),
          value: z.string().trim().min(1, "Nilai spesifikasi wajib diisi.").max(120),
        }),
      )
      .max(12, "Maksimal 12 baris spesifikasi."),
  })
  .superRefine((data, ctx) => {
    if (data.compareAtPrice !== null && data.compareAtPrice <= data.price) {
      ctx.addIssue({
        code: "custom",
        path: ["compareAtPrice"],
        message: "Harga coret harus lebih besar dari harga jual.",
      });
    }
  });

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama kategori minimal 2 karakter.")
    .max(60, "Nama kategori maksimal 60 karakter."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug minimal 2 karakter.")
    .max(60, "Slug maksimal 60 karakter.")
    .regex(slugPattern, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
  tagline: z
    .string()
    .trim()
    .min(5, "Tagline minimal 5 karakter.")
    .max(140, "Tagline maksimal 140 karakter."),
  image: z
    .string()
    .trim()
    .min(1, "Path gambar wajib diisi.")
    .max(200, "Path gambar terlalu panjang.")
    .regex(localImagePattern, "Gunakan path lokal, mis. /products/nama.jpg."),
  sortOrder: z
    .number({ error: "Urutan wajib diisi dengan angka." })
    .int("Urutan harus bilangan bulat.")
    .min(0, "Urutan tidak boleh negatif.")
    .max(999, "Urutan maksimal 999."),
});

export const stockFormSchema = z.object({
  productId: z.number({ error: "Produk tidak valid." }).int().positive(),
  stock: z
    .number({ error: "Stok wajib diisi dengan angka." })
    .int("Stok harus bilangan bulat.")
    .min(0, "Stok tidak boleh negatif.")
    .max(100000, "Stok maksimal 100.000."),
});

export const orderFormSchema = z.object({
  status: z.enum(orderStatusValues, { error: "Status pesanan tidak valid." }),
  paymentStatus: z.enum(paymentStatusValues, {
    error: "Status pembayaran tidak valid.",
  }),
});

export function integerField(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!/^\d+$/.test(raw)) return Number.NaN;
  return Number(raw);
}

export function optionalIntegerField(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  return integerField(value);
}

export function optionalText(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  return raw ? raw : null;
}

export function parseSpecsInput(raw: string) {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const specs: ProductSpec[] = [];

  for (const line of lines) {
    const separator = line.indexOf(":");
    if (separator < 1) {
      return { ok: false as const, message: "Tiap baris spesifikasi harus berformat Label: Nilai." };
    }

    const label = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();

    if (!label || !value) {
      return { ok: false as const, message: "Tiap baris spesifikasi harus berformat Label: Nilai." };
    }

    specs.push({ label, value });
  }

  return { ok: true as const, specs };
}

export function specsToText(specs: ProductSpec[]) {
  return specs.map((spec) => `${spec.label}: ${spec.value}`).join("\n");
}
