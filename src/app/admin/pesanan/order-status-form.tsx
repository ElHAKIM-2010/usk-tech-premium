"use client";

import { useActionState, useState } from "react";

import { initialAdminActionState } from "@/lib/admin-schemas";
import {
  orderStatusLabel,
  paymentStatusLabel,
} from "@/lib/order-labels";
import { buttonClass } from "@/lib/ui";
import type { OrderStatus, PaymentStatus } from "@/types/order";
import { updateOrderStatusAction } from "./actions";

const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-bg px-3.5 py-3 text-sm text-text outline-none focus:border-accent-text/60";

export function OrderStatusForm({
  orderNumber,
  status,
  paymentStatus,
  allowedStatuses,
}: {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  allowedStatuses: OrderStatus[];
}) {
  const [state, formAction, pending] = useActionState(
    updateOrderStatusAction,
    initialAdminActionState,
  );
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(status);
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentStatus>(paymentStatus);

  const statusLocked = allowedStatuses.length <= 1;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="orderNumber" value={orderNumber} />

      {state.status === "error" ? (
        <p
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {state.message}
        </p>
      ) : null}

      {state.status === "success" ? (
        <p
          role="status"
          className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent-text"
        >
          {state.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="status" className="label-mono">
          Status pesanan
        </label>
        {statusLocked ? (
          <>
            <input type="hidden" name="status" value={status} />
            <p className="mt-2 rounded-xl border border-border bg-bg px-3.5 py-3 text-sm text-muted">
              {orderStatusLabel(status)} — status akhir, tidak bisa diubah lagi.
            </p>
          </>
        ) : (
          <select
            id="status"
            name="status"
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(event.target.value as OrderStatus)
            }
            className={inputClass}
          >
            {allowedStatuses.map((option) => (
              <option key={option} value={option}>
                {orderStatusLabel(option)}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label htmlFor="paymentStatus" className="label-mono">
          Status pembayaran
        </label>
        <select
          id="paymentStatus"
          name="paymentStatus"
          value={selectedPayment}
          onChange={(event) =>
            setSelectedPayment(event.target.value as PaymentStatus)
          }
          className={inputClass}
        >
          {PAYMENT_STATUSES.map((option) => (
            <option key={option} value={option}>
              {paymentStatusLabel(option)}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs leading-5 text-muted">
          Tandai lunas hanya setelah transfer benar-benar diterima. Sistem tidak
          memverifikasi pembayaran otomatis.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className={buttonClass("primary", "md", "w-full")}
      >
        {pending ? "Menyimpan…" : "Simpan status"}
      </button>
    </form>
  );
}
