import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/types/order";

export function orderStatusLabel(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "Menunggu konfirmasi";
    case "diproses":
      return "Diproses";
    case "dikirim":
      return "Dikirim";
    case "selesai":
      return "Selesai";
    case "dibatalkan":
      return "Dibatalkan";
  }
}

export function orderStatusTone(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "border-border bg-surface-2 text-muted";
    case "diproses":
    case "dikirim":
      return "border-accent/40 bg-accent/10 text-accent-text";
    case "selesai":
      return "border-accent/50 bg-accent/15 text-accent-text";
    case "dibatalkan":
      return "border-danger/40 bg-danger/10 text-danger";
  }
}

export function paymentStatusLabel(status: PaymentStatus) {
  switch (status) {
    case "pending":
      return "Belum dibayar";
    case "paid":
      return "Lunas";
    case "failed":
      return "Pembayaran gagal";
    case "refunded":
      return "Dikembalikan";
  }
}

export function paymentStatusTone(status: PaymentStatus) {
  switch (status) {
    case "pending":
      return "border-border bg-surface-2 text-muted";
    case "paid":
      return "border-accent/50 bg-accent/15 text-accent-text";
    case "failed":
      return "border-danger/40 bg-danger/10 text-danger";
    case "refunded":
      return "border-border bg-surface-2 text-muted";
  }
}

export function paymentMethodLabel(method: PaymentMethod) {
  switch (method) {
    case "cod":
      return "Bayar saat diterima (COD)";
    case "transfer":
      return "Transfer bank";
  }
}
