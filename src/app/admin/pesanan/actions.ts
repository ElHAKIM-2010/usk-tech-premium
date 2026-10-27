"use server";

import { revalidatePath } from "next/cache";

import { updateAdminOrderStatus } from "@/db/admin";
import { getAdminUser } from "@/lib/admin";
import { orderFormSchema, type AdminActionState } from "@/lib/admin-schemas";

export async function updateOrderStatusAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await getAdminUser();
  if (!admin) return { status: "error", message: "Akses ditolak." };

  const orderNumber = String(formData.get("orderNumber") ?? "")
    .trim()
    .toUpperCase();

  if (!/^USK-[A-Z0-9]{8}$/.test(orderNumber)) {
    return { status: "error", message: "Nomor pesanan tidak valid." };
  }

  const parsed = orderFormSchema.safeParse({
    status: String(formData.get("status") ?? ""),
    paymentStatus: String(formData.get("paymentStatus") ?? ""),
  });

  if (!parsed.success) {
    return { status: "error", message: "Status pesanan tidak valid." };
  }

  const result = await updateAdminOrderStatus(
    orderNumber,
    parsed.data.status,
    parsed.data.paymentStatus,
  );

  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pesanan");
  revalidatePath(`/admin/pesanan/${orderNumber}`);
  revalidatePath("/akun");
  revalidatePath("/akun/pesanan");
  revalidatePath(`/akun/pesanan/${orderNumber}`);

  return { status: "success", message: "Status pesanan diperbarui." };
}
