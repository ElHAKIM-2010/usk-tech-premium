import { z } from "zod";

export const checkoutSchema = z.object({
  recipientName: z
    .string()
    .trim()
    .min(2, "Nama penerima minimal 2 karakter.")
    .max(80, "Nama penerima maksimal 80 karakter."),
  recipientPhone: z
    .string()
    .trim()
    .regex(
      /^(?:\+62|62|0)8\d{7,11}$/,
      "Nomor HP tidak valid. Contoh: 081234567890.",
    ),
  addressLine: z
    .string()
    .trim()
    .min(10, "Alamat minimal 10 karakter.")
    .max(300, "Alamat maksimal 300 karakter."),
  city: z
    .string()
    .trim()
    .min(2, "Kota atau kabupaten wajib diisi.")
    .max(80, "Kota maksimal 80 karakter."),
  province: z
    .string()
    .trim()
    .min(2, "Provinsi wajib diisi.")
    .max(80, "Provinsi maksimal 80 karakter."),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Kode pos harus terdiri dari 5 angka."),
  notes: z.string().trim().max(300, "Catatan maksimal 300 karakter."),
  items: z
    .array(
      z.object({
        slug: z.string().trim().min(1).max(120),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "Keranjang masih kosong."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export interface CheckoutState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  orderNumber?: string;
}

export const initialCheckoutState: CheckoutState = { status: "idle" };
