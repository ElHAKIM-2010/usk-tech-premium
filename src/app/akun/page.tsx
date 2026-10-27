import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, LogOut, ShieldCheck, ShoppingBag, UserRound } from "lucide-react";

import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/orders/status-badges";
import { listOrdersForUser } from "@/db/orders";
import { getCurrentUser } from "@/lib/current-user";
import { formatIDR } from "@/lib/format";
import { buttonClass } from "@/lib/ui";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Akun",
  description: "Ringkasan akun USK Tech Premium.",
};

const joinedFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const orderDateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/masuk?next=/akun");

  const orders = await listOrdersForUser(user.id, 5);
  const name = user.name || "Pelanggan USK";

  return (
    <div className="container-page py-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted">
        <Link href="/" className="transition-colors hover:text-text">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-text">
          Akun
        </span>
      </nav>

      <div className="mt-6 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Akun USK</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Halo, {name.split(" ")[0]}
            <span className="text-accent-text">.</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            Profil, pesanan, dan status akunmu tersimpan di database toko.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {user.role === "admin" ? (
            <Link href="/admin" className={buttonClass("secondary", "md")}>
              <ShieldCheck className="size-4" aria-hidden="true" />
              Panel admin
            </Link>
          ) : null}

          <form action={logout}>
            <button type="submit" className={buttonClass("secondary", "md")}>
              <LogOut className="size-4" aria-hidden="true" />
              Keluar
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-full border border-border bg-surface-2 text-accent-text">
              <UserRound className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold">{name}</p>
              <p className="text-sm text-muted">{user.email}</p>
            </div>
          </div>

          <dl className="mt-6 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
            <div className="bg-bg px-4 py-3">
              <dt className="label-mono">Email</dt>
              <dd className="mt-1 break-words text-sm">{user.email}</dd>
            </div>
            <div className="bg-bg px-4 py-3">
              <dt className="label-mono">Anggota sejak</dt>
              <dd className="mt-1 text-sm">
                {joinedFormatter.format(user.createdAt)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="size-5 text-muted" aria-hidden="true" />
              <h2 className="font-display text-lg font-semibold">Pesanan</h2>
            </div>
            {orders.length > 0 ? (
              <Link
                href="/akun/pesanan"
                className="text-xs text-muted transition-colors hover:text-text"
              >
                Semua pesanan
              </Link>
            ) : null}
          </div>

          {orders.length === 0 ? (
            <>
              <p className="mt-3 text-sm leading-6 text-muted">
                Belum ada pesanan. Pesanan yang kamu buat lewat checkout akan muncul di
                sini.
              </p>
              <Link
                href="/products"
                className={buttonClass("secondary", "md", "mt-5 w-full")}
              >
                Lihat katalog
              </Link>
            </>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {orders.map((order) => (
                <li key={order.orderNumber}>
                  <Link
                    href={`/akun/pesanan/${order.orderNumber}`}
                    className="group flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] text-muted">
                        #{order.orderNumber}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {orderDateFormatter.format(order.createdAt)} · {order.itemCount}{" "}
                        item
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <OrderStatusBadge status={order.status} />
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <p className="text-sm font-semibold">
                        {formatIDR(order.total)}
                      </p>
                      <span
                        aria-hidden="true"
                        className="grid size-8 place-items-center rounded-full border border-border text-muted transition-colors group-hover:border-accent-text/50 group-hover:text-accent-text"
                      >
                        <ArrowUpRight className="size-3.5" />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
