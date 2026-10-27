import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Banknote, MapPin, Package } from "lucide-react";

import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/orders/status-badges";
import { getOrderForUser } from "@/db/orders";
import { getCurrentUser } from "@/lib/current-user";
import { formatIDR } from "@/lib/format";
import { paymentMethodLabel } from "@/lib/order-labels";
import { getBankAccount } from "@/lib/payment";

export const dynamic = "force-dynamic";

interface OrderDetailPageProps {
  params: Promise<{ orderNumber: string }>;
}

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { orderNumber } = await params;

  return {
    title: `Pesanan ${orderNumber}`,
    description: "Detail pesanan USK Tech Premium.",
    robots: { index: false, follow: false },
  };
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
});

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { orderNumber } = await params;

  if (!/^USK-[A-Z0-9]{8}$/.test(orderNumber)) notFound();

  const user = await getCurrentUser();

  if (!user) {
    redirect(`/masuk?next=/akun/pesanan/${encodeURIComponent(orderNumber)}`);
  }

  const order = await getOrderForUser(orderNumber, user.id);

  if (!order) notFound();

  const bank = getBankAccount();
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

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
        <Link href="/akun/pesanan" className="transition-colors hover:text-text">
          Pesanan
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="font-mono text-text">
          #{order.orderNumber}
        </span>
      </nav>

      <div className="mt-6 border-b border-border pb-8">
        <p className="eyebrow">Detail pesanan</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          #{order.orderNumber}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Dibuat {dateFormatter.format(order.createdAt)} · {itemCount} item
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <Package className="size-5 text-muted" aria-hidden="true" />
              <h2 className="font-display text-lg font-semibold">Item pesanan</h2>
            </div>

            <ul className="mt-4 divide-y divide-border">
              {order.items.map((item) => (
                <li
                  key={item.productSlug}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-2">
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.productName}</p>
                    <p className="mt-1 text-xs text-muted">
                      {item.quantity} × {formatIDR(item.unitPrice)}
                    </p>
                  </div>

                  <p className="text-sm font-semibold">{formatIDR(item.lineTotal)}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <MapPin className="size-5 text-muted" aria-hidden="true" />
              <h2 className="font-display text-lg font-semibold">Alamat pengiriman</h2>
            </div>

            <div className="mt-4 space-y-1 text-sm leading-6">
              <p className="font-medium">{order.recipientName}</p>
              <p className="text-muted">{order.recipientPhone}</p>
              <p>{order.addressLine}</p>
              <p>
                {order.city}, {order.province} {order.postalCode}
              </p>
              {order.notes ? (
                <p className="mt-2 text-xs leading-5 text-muted">
                  Catatan: {order.notes}
                </p>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold">Ringkasan</h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Subtotal</dt>
                <dd>{formatIDR(order.subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Pengiriman</dt>
                <dd className="text-accent-text">Gratis</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Metode pembayaran</dt>
                <dd>{paymentMethodLabel(order.paymentMethod)}</dd>
              </div>
            </dl>

            <div className="mt-4 flex items-end justify-between gap-4 border-t border-border pt-4">
              <span className="text-sm text-muted">Total</span>
              <span className="font-display text-2xl font-semibold">
                {formatIDR(order.total)}
              </span>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <Banknote className="size-5 text-muted" aria-hidden="true" />
              <h2 className="font-display text-lg font-semibold">Pembayaran</h2>
            </div>

            <div className="mt-3">
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>

            {order.paymentMethod === "transfer" ? (
              order.paymentStatus === "paid" ? (
                <p className="mt-4 text-sm leading-6 text-muted">
                  Pembayaran pesanan ini sudah ditandai lunas.
                </p>
              ) : bank ? (
                <>
                  <dl className="mt-4 space-y-3 rounded-xl border border-border bg-bg p-4 text-sm">
                    <div>
                      <dt className="label-mono">Bank</dt>
                      <dd className="mt-1">{bank.bank}</dd>
                    </div>
                    <div>
                      <dt className="label-mono">Nomor rekening</dt>
                      <dd className="mt-1 font-mono text-base">{bank.number}</dd>
                    </div>
                    <div>
                      <dt className="label-mono">Atas nama</dt>
                      <dd className="mt-1">{bank.holder}</dd>
                    </div>
                    <div>
                      <dt className="label-mono">Jumlah transfer</dt>
                      <dd className="mt-1 font-semibold">{formatIDR(order.total)}</dd>
                    </div>
                    <div>
                      <dt className="label-mono">Berita transfer</dt>
                      <dd className="mt-1 font-mono">{order.orderNumber}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-[11px] leading-5 text-muted">
                    Pembayaran belum diverifikasi otomatis. Simpan bukti transfer;
                    verifikasi manual dilakukan oleh toko.
                  </p>
                </>
              ) : (
                <div className="mt-4 rounded-xl border border-danger/30 bg-danger/5 p-4 text-xs leading-5 text-danger">
                  Instruksi rekening belum diatur oleh toko. Jangan melakukan transfer
                  sebelum detail rekening tersedia. Pesanan tetap tercatat dengan status
                  menunggu konfirmasi.
                </div>
              )
            ) : (
              <p className="mt-4 text-sm leading-6 text-muted">
                Pembayaran dilakukan tunai saat barang diterima.
              </p>
            )}
          </section>

          <Link
            href="/akun/pesanan"
            className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-text"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Kembali ke riwayat pesanan
          </Link>
        </aside>
      </div>
    </div>
  );
}
