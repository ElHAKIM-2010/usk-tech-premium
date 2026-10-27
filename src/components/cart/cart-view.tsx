"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useCart } from "@/components/cart/cart-provider";
import { formatIDR } from "@/lib/format";
import { buttonClass } from "@/lib/ui";
import type { Product } from "@/types/catalog";

interface CartViewProps {
  catalog: Product[];
  isLoggedIn: boolean;
}

export function CartView({ catalog, isLoggedIn }: CartViewProps) {
  const { lines, ready, setQuantity, removeItem, clear } = useCart();

  const items = lines.flatMap((line) => {
    const product = catalog.find((item) => item.slug === line.slug);
    if (!product) return [];

    return [
      {
        product,
        quantity: line.quantity,
        lineTotal: product.price * line.quantity,
      },
    ];
  });

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);

  if (!ready) {
    return (
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-4" aria-busy="true">
          <p className="sr-only">Memuat keranjang…</p>
          {Array.from({ length: 2 }, (_, index) => (
            <div
              key={index}
              className="flex gap-4 rounded-2xl border border-border bg-surface p-4"
            >
              <div className="size-24 animate-pulse rounded-xl bg-surface-2" />
              <div className="flex-1 space-y-3 py-2">
                <div className="h-3 w-24 animate-pulse rounded bg-surface-2" />
                <div className="h-4 w-48 animate-pulse rounded bg-surface-2" />
                <div className="h-3 w-32 animate-pulse rounded bg-surface-2" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-surface" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-3xl border border-dashed border-border px-6 py-20 text-center">
        <ShoppingBag className="mx-auto size-8 text-muted" aria-hidden="true" />
        <h2 className="mt-4 font-display text-xl font-semibold">Keranjang masih kosong</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
          Mulai dari katalog, lalu tambahkan perangkat yang ingin kamu pertimbangkan.
        </p>
        <Link href="/products" className={buttonClass("primary", "md", "mt-6")}>
          Mulai belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-12">
      <div className="min-w-0">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <p className="text-xs text-muted">
            {itemCount} item · {items.length} produk
          </p>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Kosongkan semua item dari keranjang?")) clear();
            }}
            className="text-xs text-muted transition-colors hover:text-danger"
          >
            Kosongkan
          </button>
        </div>

        <ul className="divide-y divide-border">
          {items.map(({ product, quantity, lineTotal }) => (
            <li key={product.slug} className="flex gap-3 py-5 sm:gap-4">
              <Link
                href={`/products/${product.slug}`}
                className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-2 sm:size-28"
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:justify-between">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                    {product.categoryName}
                  </p>
                  <h2 className="mt-1 font-display text-base font-semibold leading-snug">
                    <Link
                      href={`/products/${product.slug}`}
                      className="transition-colors hover:text-accent-text"
                    >
                      {product.name}
                    </Link>
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    {formatIDR(product.price)} / unit
                  </p>
                  {quantity >= product.stock ? (
                    <p className="mt-1 text-[11px] text-muted">
                      Maksimal stok tercapai ({product.stock} unit)
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:flex-col sm:items-end sm:justify-start">
                  <QuantityStepper
                    value={quantity}
                    onChange={(value) => setQuantity(product.slug, value, product.stock)}
                    max={product.stock}
                    label={`Jumlah ${product.name}`}
                  />

                  <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                    <p className="text-sm font-semibold">{formatIDR(lineTotal)}</p>
                    <button
                      type="button"
                      onClick={() => removeItem(product.slug)}
                      aria-label={`Hapus ${product.name} dari keranjang`}
                      className="inline-flex items-center gap-1 text-[11px] text-muted transition-colors hover:text-danger"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      <span className="hidden sm:inline">Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent-text transition-opacity hover:opacity-75"
        >
          Lanjut belanja
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-display text-lg font-semibold">Ringkasan</h2>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatIDR(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">Pengiriman</dt>
              <dd className="text-accent-text">Gratis</dd>
            </div>
          </dl>

          <div className="mt-5 flex items-end justify-between gap-4 border-t border-border pt-5">
            <span className="text-sm text-muted">Total</span>
            <span className="font-display text-2xl font-semibold">{formatIDR(subtotal)}</span>
          </div>

          <Link
            href={isLoggedIn ? "/checkout" : "/masuk?next=/checkout"}
            className={buttonClass("primary", "lg", "mt-5 w-full")}
          >
            {isLoggedIn ? "Lanjut ke checkout" : "Masuk untuk checkout"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <p className="mt-3 text-[11px] leading-5 text-muted">
            Harga dan stok akan diperiksa ulang oleh server saat pesanan dibuat.
          </p>

          <Link
            href="/products"
            className={buttonClass("secondary", "md", "mt-4 w-full")}
          >
            Lanjut belanja
          </Link>
        </div>
      </aside>
    </div>
  );
}
