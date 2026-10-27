"use server";

import { revalidatePath } from "next/cache";

import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategoryById,
  updateAdminCategory,
} from "@/db/admin";
import { getAdminUser } from "@/lib/admin";
import {
  categoryFormSchema,
  fieldErrorsFrom,
  integerField,
  type AdminActionState,
} from "@/lib/admin-schemas";
import { isForeignKeyViolation, isUniqueViolation } from "@/lib/db-errors";

function readCategoryInput(formData: FormData) {
  const parsed = categoryFormSchema.safeParse({
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "")
      .trim()
      .toLowerCase(),
    tagline: String(formData.get("tagline") ?? "").trim(),
    image: String(formData.get("image") ?? "").trim(),
    sortOrder: integerField(formData.get("sortOrder")),
  });

  if (!parsed.success) {
    return { ok: false as const, fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  return { ok: true as const, data: parsed.data };
}

export async function saveCategory(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await getAdminUser();
  if (!admin) return { status: "error", message: "Akses ditolak." };

  const input = readCategoryInput(formData);

  if (!input.ok) {
    return {
      status: "error",
      message: "Periksa kembali data kategori.",
      fieldErrors: input.fieldErrors,
    };
  }

  const rawId = Number(formData.get("id") ?? 0);
  const id = Number.isInteger(rawId) && rawId > 0 ? rawId : null;

  try {
    if (id) {
      const updated = await updateAdminCategory(id, input.data);
      if (!updated) {
        return { status: "error", message: "Kategori tidak ditemukan." };
      }
    } else {
      await createAdminCategory(input.data);
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        status: "error",
        message: "Slug sudah dipakai kategori lain.",
        fieldErrors: { slug: "Slug sudah dipakai kategori lain." },
      };
    }

    console.error(
      "Simpan kategori gagal:",
      error instanceof Error ? error.name : "unknown error",
    );

    return { status: "error", message: "Kategori gagal disimpan. Silakan coba lagi." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/kategori");
  revalidatePath("/admin/produk");
  revalidatePath("/products");
  revalidatePath("/");

  return {
    status: "success",
    message: id ? "Kategori diperbarui." : "Kategori baru ditambahkan.",
  };
}

export async function deleteCategoryAction(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return;

  const id = integerField(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  const existing = await getAdminCategoryById(id);
  if (!existing) return;

  try {
    await deleteAdminCategory(id);
  } catch (error) {
    if (!isForeignKeyViolation(error)) {
      console.error(
        "Hapus kategori gagal:",
        error instanceof Error ? error.name : "unknown error",
      );
    }
    return;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/kategori");
  revalidatePath("/admin/produk");
  revalidatePath("/products");
  revalidatePath("/");
}
