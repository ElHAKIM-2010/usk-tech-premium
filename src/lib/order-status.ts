import type { OrderStatus } from "@/types/order";

export const orderStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["diproses", "dibatalkan"],
  diproses: ["dikirim", "dibatalkan"],
  dikirim: ["selesai"],
  selesai: [],
  dibatalkan: [],
};

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus) {
  return from === to || orderStatusTransitions[from].includes(to);
}
