"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { createOrder } from "@/db/orders";
import { checkoutSchema, type CheckoutState } from "@/lib/checkout";
import { consumeRateLimit, retryAfterText } from "@/lib/rate-limit";

const CHECKOUT_LIMIT = 10;
const CHECKOUT_WINDOW_SECONDS = 10 * 60;

function readItems(formData: FormData): unknown {
  const raw = formData.get("items");
  if (typeof raw !== "string") return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function submitCheckout(
  _previousState: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return {
      status: "error",
      message: "Sesi berakhir. Silakan masuk kembali sebelum checkout.",
    };
  }

  const parsed = checkoutSchema.safeParse({
    recipientName: String(formData.get("recipientName") ?? "").trim(),
    recipientPhone: String(formData.get("recipientPhone") ?? "")
      .trim()
      .replace(/[\s-]/g, ""),
    addressLine: String(formData.get("addressLine") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    province: String(formData.get("province") ?? "").trim(),
    postalCode: String(formData.get("postalCode") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),
    items: readItems(formData),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};

    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }

    return {
      status: "error",
      message: "Periksa kembali data pengirimanmu.",
      fieldErrors,
    };
  }

  const [user] = await getDb()
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return {
      status: "error",
      message: "Akun tidak ditemukan. Silakan masuk kembali.",
    };
  }

  const status = await consumeRateLimit(
    `checkout:user:${user.id}`,
    CHECKOUT_LIMIT,
    CHECKOUT_WINDOW_SECONDS,
  );

  if (!status.allowed) {
    return {
      status: "error",
      message: `Terlalu banyak percobaan checkout. Coba lagi dalam ${retryAfterText(status.retryAfterSeconds)}.`,
    };
  }

  try {
    const result = await createOrder(user.id, parsed.data.items, {
      recipientName: parsed.data.recipientName,
      recipientPhone: parsed.data.recipientPhone,
      addressLine: parsed.data.addressLine,
      city: parsed.data.city,
      province: parsed.data.province,
      postalCode: parsed.data.postalCode,
      notes: parsed.data.notes,
    });

    if (!result.ok) {
      return {
        status: "error",
        message: result.message,
        fieldErrors:
          result.reason === "insufficient_stock"
            ? { items: result.message }
            : undefined,
      };
    }

    revalidatePath("/akun");
    revalidatePath("/akun/pesanan");

    return { status: "success", orderNumber: result.orderNumber };
  } catch {
    return {
      status: "error",
      message: "Pesanan gagal dibuat. Silakan coba lagi.",
    };
  }
}
