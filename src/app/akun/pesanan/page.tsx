import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, ReceiptText } from "lucide-react";

import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/orders/status-badges";
import { listOrdersForUser } from "@/db/orders";
import { getCurrentUser } from "@/lib/current-user";
import { formatIDR } from "@/lib/format";
import { buttonClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Riwayat pesanan",
  description: "Daftar pesanan yang pernah dibuat di USK Tech Premium.",
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function OrdersPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/masuk?next=/akun/pesanan");

  const orders = await listOrdersForUser(user.id);

  return (
    <div className="container-page py-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted">
        <Link href="/" className="transition-colors hover:text-text">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/akun" className="transition-colors hover:text-text">
          Akun
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-text">
          Pesanan
        </span>
      </nav>

      <div className="mt-6 border-b border-border pb-8">
        <p className="eyebrow">Akun USK</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Riwayat pesanan<span className="text-accent-text">.</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
          Semua pesanan yang tercatat pada akun {user.email}.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-border px-6 py-20 text-center">
          <ReceiptText className="mx-auto size-8 text-muted" aria-hidden="true" />
          <h2 className="mt-4 font-display text-xl font-semibold">
            Belum ada pesanan
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
            Pesanan yang kamu buat lewat checkout akan muncul di halaman ini.
          </p>
          <Link href="/products" className={buttonClass("primary", "md", "mt-6")}>
            Mulai belanja
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {orders.map((order) => (
            <li key={order.orderNumber}>
              <Link
                href={`/akun/pesanan/${order.orderNumber}`}
                className="group flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted">#{order.orderNumber}</p>
                  <p className="mt-1 text-sm">
                    {dateFormatter.format(order.createdAt)} · {order.itemCount} item
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <p className="text-sm font-semibold">{formatIDR(order.total)}</p>
                  <span
                    aria-hidden="true"
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted transition-colors group-hover:border-accent-text/50 group-hover:text-accent-text"
                  >
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
