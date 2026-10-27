"use server";

import { revalidatePath } from "next/cache";

import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProductById,
  updateAdminProduct,
  updateAdminProductStock,
} from "@/db/admin";
import { getAdminUser } from "@/lib/admin";
import {
  fieldErrorsFrom,
  integerField,
  optionalIntegerField,
  optionalText,
  parseSpecsInput,
  productFormSchema,
  stockFormSchema,
  type AdminActionState,
} from "@/lib/admin-schemas";
import { isUniqueViolation } from "@/lib/db-errors";

function readProductInput(formData: FormData) {
  const specs = parseSpecsInput(String(formData.get("specs") ?? ""));

  if (!specs.ok) {
    return { ok: false as const, fieldErrors: { specs: specs.message } };
  }

  const parsed = productFormSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "")
      .trim()
      .toLowerCase(),
    categoryId: integerField(formData.get("categoryId")),
    description: String(formData.get("description") ?? "").trim(),
    price: integerField(formData.get("price")),
    compareAtPrice: optionalIntegerField(formData.get("compareAtPrice")),
    stock: integerField(formData.get("stock")),
    image: String(formData.get("image") ?? "").trim(),
    badge: optionalText(formData.get("badge")),
    featured: formData.get("featured") === "on",
    isNew: formData.get("isNew") === "on",
    releasedAt: String(formData.get("releasedAt") ?? "").trim(),
    specs: specs.specs,
  });

  if (!parsed.success) {
    return { ok: false as const, fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  return { ok: true as const, data: parsed.data };
}

export async function saveProduct(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await getAdminUser();
  if (!admin) return { status: "error", message: "Akses ditolak." };

  const input = readProductInput(formData);

  if (!input.ok) {
    return {
      status: "error",
      message: "Periksa kembali data produk.",
      fieldErrors: input.fieldErrors,
    };
  }

  const rawId = Number(formData.get("id") ?? 0);
  const id = Number.isInteger(rawId) && rawId > 0 ? rawId : null;

  try {
    if (id) {
      const updated = await updateAdminProduct(id, input.data);
      if (!updated) {
        return { status: "error", message: "Produk tidak ditemukan." };
      }
    } else {
      await createAdminProduct(input.data);
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        status: "error",
        message: "Slug sudah dipakai produk lain.",
        fieldErrors: { slug: "Slug sudah dipakai produk lain." },
      };
    }

    console.error(
      "Simpan produk gagal:",
      error instanceof Error ? error.name : "unknown error",
    );

    return { status: "error", message: "Produk gagal disimpan. Silakan coba lagi." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/produk");
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath(`/products/${input.data.slug}`);

  return {
    status: "success",
    message: id ? "Produk diperbarui." : "Produk baru ditambahkan.",
  };
}

export async function deleteProductAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return;

  const id = integerField(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  const existing = await getAdminProductById(id);
  if (!existing) return;

  try {
    await deleteAdminProduct(id);
  } catch (error) {
    console.error(
      "Hapus produk gagal:",
      error instanceof Error ? error.name : "unknown error",
    );
    return;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/produk");
  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath(`/products/${existing.slug}`);
}

export async function updateStockAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await getAdminUser();
  if (!admin) return { status: "error", message: "Akses ditolak." };

  const parsed = stockFormSchema.safeParse({
    productId: integerField(formData.get("productId")),
    stock: integerField(formData.get("stock")),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Stok tidak valid.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const product = await getAdminProductById(parsed.data.productId);
  if (!product) {
    return { status: "error", message: "Produk tidak ditemukan." };
  }

  const updated = await updateAdminProductStock(
    parsed.data.productId,
    parsed.data.stock,
  );

  if (!updated) {
    return { status: "error", message: "Stok gagal diperbarui." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/produk");
  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);

  return { status: "success", message: "Stok diperbarui." };
}
