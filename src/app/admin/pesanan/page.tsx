import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";

import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/orders/status-badges";
import { listAdminOrders } from "@/db/admin";
import { requireAdminPage } from "@/lib/admin";
import { orderStatusValues } from "@/lib/admin-schemas";
import { formatIDR } from "@/lib/format";
import { orderStatusLabel } from "@/lib/order-labels";
import { buttonClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Kelola pesanan",
  robots: { index: false, follow: false },
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireAdminPage();
  const { status: rawStatus, q } = await searchParams;
  const status = orderStatusValues.find((value) => value === rawStatus);
  const query = typeof q === "string" ? q.trim() : "";
  const orders = await listAdminOrders({ status, query: query || undefined });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">Pesanan</h2>
        <p className="mt-1 text-sm text-muted">
          {orders.length} pesanan{status ? ` dengan status ${orderStatusLabel(status)}` : ""}
          {query ? ` cocok dengan "${query}"` : ""}.
        </p>
      </div>

      <form
        action="/admin/pesanan"
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 transition-colors focus-within:border-accent-text/60">
          <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Cari nomor pesanan, nama, atau email"
            aria-label="Cari pesanan"
            className="w-full bg-transparent text-sm text-text outline-none placeholder:text-muted focus-visible:outline-none"
          />
        </div>

        <select
          name="status"
          defaultValue={status ?? ""}
          aria-label="Filter status pesanan"
          className="rounded-full border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-accent-text/60"
        >
          <option value="">Semua status</option>
          {orderStatusValues.map((value) => (
            <option key={value} value={value}>
              {orderStatusLabel(value)}
            </option>
          ))}
        </select>

        <button type="submit" className={buttonClass("secondary", "sm", "sm:self-stretch")}>
          Terapkan
        </button>
      </form>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm leading-6 text-muted">
            Tidak ada pesanan yang cocok.{" "}
            {status || query ? (
              <Link href="/admin/pesanan" className="text-text underline underline-offset-4">
                Reset filter
              </Link>
            ) : (
              "Pesanan pelanggan akan muncul di sini."
            )}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="label-mono px-5 py-3">Pesanan</th>
                <th className="label-mono px-3 py-3">Pelanggan</th>
                <th className="label-mono px-3 py-3">Status</th>
                <th className="label-mono px-3 py-3 text-right">Total</th>
                <th className="label-mono px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.orderNumber}>
                  <td className="px-5 py-4 align-top">
                    <p className="font-mono text-[11px]">#{order.orderNumber}</p>
                    <p className="mt-1 text-xs text-muted">
                      {dateFormatter.format(order.createdAt)} · {order.itemCount} item
                    </p>
                  </td>
                  <td className="px-3 py-4 align-top">
                    <p>{order.customerName}</p>
                    <p className="text-xs text-muted">{order.customerEmail}</p>
                  </td>
                  <td className="px-3 py-4 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      <OrderStatusBadge status={order.status} />
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </div>
                  </td>
                  <td className="px-3 py-4 text-right align-top font-semibold">
                    {formatIDR(order.total)}
                  </td>
                  <td className="px-5 py-4 text-right align-top">
                    <Link
                      href={`/admin/pesanan/${order.orderNumber}`}
                      className={buttonClass("secondary", "sm")}
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
