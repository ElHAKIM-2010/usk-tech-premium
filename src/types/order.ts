export type OrderStatus =
  | "pending"
  | "diproses"
  | "dikirim"
  | "selesai"
  | "dibatalkan";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentMethod = "cod" | "transfer";
