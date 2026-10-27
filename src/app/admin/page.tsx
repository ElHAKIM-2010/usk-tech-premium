import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/orders/status-badges";
import { getAdminDashboard } from "@/db/admin";
import { requireAdminPage } from "@/lib/admin";
import { formatIDR } from "@/lib/format";
import { buttonClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Ringkasan admin",
  robots: { index: false, follow: false },
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function AdminDashboardPage() {
  await requireAdminPage();
  const data = await getAdminDashboard();

  const stats = [
    {
      label: "Pendapatan lunas",
      value: formatIDR(data.paidRevenue),
      hint: "Hanya pesanan yang sudah ditandai lunas.",
    },
    {
      label: "Total pesanan",
      value: data.orderCount,
      hint: `${data.pendingOrderCount} menunggu konfirmasi.`,
    },
    {
      label: "Menunggu pembayaran",
      value: data.awaitingPaymentCount,
      hint: "Periksa transfer masuk secara manual.",
    },
    {
      label: "Stok menipis",
      value: data.lowStockCount,
      hint: "Produk dengan stok 5 unit atau kurang.",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-surface p-5">
            <p className="label-mono">{stat.label}</p>
            <p className="mt-3 font-display text-2xl font-semibold tracking-tight">
              {stat.value}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted">{stat.hint}</p>
          </div>
        ))}
      </section>

      <p className="text-xs text-muted">
        {data.productCount} produk · {data.categoryCount} kategori ·{" "}
        {data.lowStockProducts.length} produk perlu perhatian stok.
      </p>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Pesanan terbaru</h2>
            <Link
              href="/admin/pesanan"
              className="text-xs text-muted transition-colors hover:text-text"
            >
              Semua pesanan
            </Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-muted">
              Belum ada pesanan. Pesanan pelanggan akan muncul di sini.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="label-mono pb-2 pr-3">Pesanan</th>
                    <th className="label-mono pb-2 pr-3">Pelanggan</th>
                    <th className="label-mono pb-2 pr-3">Status</th>
                    <th className="label-mono pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.recentOrders.map((order) => (
                    <tr key={order.orderNumber}>
                      <td className="py-3 pr-3 align-top">
                        <Link
                          href={`/admin/pesanan/${order.orderNumber}`}
                          className="font-mono text-[11px] transition-colors hover:text-accent-text"
                        >
                          #{order.orderNumber}
                        </Link>
                        <p className="mt-1 text-xs text-muted">
                          {dateFormatter.format(order.createdAt)} · {order.itemCount} item
                        </p>
                      </td>
                      <td className="py-3 pr-3 align-top">
                        <p className="text-sm">{order.customerName}</p>
                        <p className="text-xs text-muted">{order.customerEmail}</p>
                      </td>
                      <td className="py-3 pr-3 align-top">
                        <div className="flex flex-wrap gap-1.5">
                          <OrderStatusBadge status={order.status} />
                          <PaymentStatusBadge status={order.paymentStatus} />
                        </div>
                      </td>
                      <td className="py-3 text-right align-top font-semibold">
                        {formatIDR(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-lg font-semibold">Stok menipis</h2>

          {data.lowStockProducts.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-muted">
              Semua produk memiliki stok di atas 5 unit.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {data.lowStockProducts.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm">{product.name}</p>
                    <p className="text-xs text-muted">
                      {product.stock === 0
                        ? "Stok habis"
                        : `Sisa ${product.stock} unit`}
                    </p>
                  </div>
                  <Link
                    href={`/admin/produk/${product.id}`}
                    aria-label={`Kelola stok ${product.name}`}
                    className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-muted transition-colors hover:border-accent-text/50 hover:text-accent-text"
                  >
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/admin/produk?q="
            className={buttonClass("secondary", "sm", "mt-5 w-full")}
          >
            Kelola produk
          </Link>
        </section>
      </div>
    </div>
  );
}
