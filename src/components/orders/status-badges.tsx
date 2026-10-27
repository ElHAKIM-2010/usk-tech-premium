import { cn } from "@/lib/cn";
import {
  orderStatusLabel,
  orderStatusTone,
  paymentStatusLabel,
  paymentStatusTone,
} from "@/lib/order-labels";
import type { OrderStatus, PaymentStatus } from "@/types/order";

const badgeClass =
  "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn(badgeClass, orderStatusTone(status))}>
      {orderStatusLabel(status)}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={cn(badgeClass, paymentStatusTone(status))}>
      {paymentStatusLabel(status)}
    </span>
  );
}
