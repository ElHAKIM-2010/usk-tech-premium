import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/orders/status-badges";
import { getAdminOrderByNumber } from "@/db/admin";
import { requireAdminPage } from "@/lib/admin";
import { formatIDR } from "@/lib/format";
import { paymentMethodLabel } from "@/lib/order-labels";
import { orderStatusTransitions } from "@/lib/order-status";
import { OrderStatusForm } from "../order-status-form";

export const metadata: Metadata = {
  title: "Detail pesanan",
  robots: { index: false, follow: false },
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
});

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  await requireAdminPage();
  const { orderNumber } = await params;

  if (!/^USK-[A-Z0-9]{8}$/.test(orderNumber)) notFound();

  const order = await getAdminOrderByNumber(orderNumber);
  if (!order) notFound();

  const allowedStatuses = [
    order.status,
    ...orderStatusTransitions[order.status],
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/pesanan"
          className="text-xs text-muted transition-colors hover:text-text"
        >
          ← Daftar pesanan
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            #{order.orderNumber}
          </h2>
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
        <p className="mt-1 text-sm text-muted">
          Dibuat {dateFormatter.format(order.createdAt)} · {order.itemCount} item
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-display text-lg font-semibold">Item pesanan</h3>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="label-mono pb-2 pr-3">Produk</th>
                    <th className="label-mono pb-2 pr-3">Harga</th>
                    <th className="label-mono pb-2 pr-3 text-center">Qty</th>
                    <th className="label-mono pb-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((item, index) => (
                    <tr key={`${item.productSlug}-${index}`}>
                      <td className="py-3 pr-3">
                        <p>{item.productName}</p>
                        <p className="font-mono text-[11px] text-muted">
                          /{item.productSlug}
                        </p>
                      </td>
                      <td className="py-3 pr-3 text-muted">
                        {formatIDR(item.unitPrice)}
                      </td>
                      <td className="py-3 pr-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right font-medium">
                        {formatIDR(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Subtotal</dt>
                <dd>{formatIDR(order.subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Pengiriman</dt>
                <dd>{order.shippingCost === 0 ? "Gratis" : formatIDR(order.shippingCost)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-border pt-2 font-semibold">
                <dt>Total</dt>
                <dd>{formatIDR(order.total)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Metode pembayaran</dt>
                <dd>{paymentMethodLabel(order.paymentMethod)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-display text-lg font-semibold">Pengiriman</h3>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="label-mono">Penerima</dt>
                <dd className="mt-1">{order.recipientName}</dd>
                <dd className="text-muted">{order.recipientPhone}</dd>
              </div>
              <div>
                <dt className="label-mono">Akun pemesan</dt>
                <dd className="mt-1">{order.customerName}</dd>
                <dd className="text-muted">{order.customerEmail}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="label-mono">Alamat</dt>
                <dd className="mt-1 leading-6">
                  {order.addressLine}
                  <br />
                  {order.city}, {order.province} {order.postalCode}
                </dd>
              </div>
              {order.notes ? (
                <div className="sm:col-span-2">
                  <dt className="label-mono">Catatan</dt>
                  <dd className="mt-1 leading-6 text-muted">{order.notes}</dd>
                </div>
              ) : null}
            </dl>
          </section>
        </div>

        <section className="h-fit rounded-2xl border border-border bg-surface p-6">
          <h3 className="font-display text-lg font-semibold">Ubah status</h3>
          <p className="mt-1 text-xs leading-5 text-muted">
            Status mengikuti alur: menunggu → diproses → dikirim → selesai. Membatalkan
            pesanan mengembalikan stok item ke katalog.
          </p>

          <div className="mt-5">
            <OrderStatusForm
              orderNumber={order.orderNumber}
              status={order.status}
              paymentStatus={order.paymentStatus}
              allowedStatuses={allowedStatuses}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
