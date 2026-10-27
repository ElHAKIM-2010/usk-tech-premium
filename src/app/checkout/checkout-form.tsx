"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { ArrowRight, Banknote, CheckCircle2, ShoppingBag } from "lucide-react";

import { submitCheckout } from "./actions";
import { useCart } from "@/components/cart/cart-provider";
import { initialCheckoutState } from "@/lib/checkout";
import { cn } from "@/lib/cn";
import { formatIDR } from "@/lib/format";
import { buttonClass } from "@/lib/ui";
import type { Product } from "@/types/catalog";

interface CheckoutFormProps {
  catalog: Product[];
  bankConfigured: boolean;
}

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-accent-text/60";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} className="mt-1.5 text-xs text-danger">
      {message}
    </p>
  );
}

export function CheckoutForm({ catalog, bankConfigured }: CheckoutFormProps) {
  const router = useRouter();
  const { lines, ready, clear } = useCart();
  const [state, formAction, pending] = useActionState(
    submitCheckout,
    initialCheckoutState,
  );

  const submitted = state.status === "success" && Boolean(state.orderNumber);

  useEffect(() => {
    if (state.status !== "success" || !state.orderNumber) return;

    clear();
    router.replace(`/akun/pesanan/${state.orderNumber}`);
  }, [clear, router, state.orderNumber, state.status]);

  const items = lines.flatMap((line) => {
    const product = catalog.find((entry) => entry.slug === line.slug);
    if (!product) return [];

    return [
      {
        product,
        quantity: line.quantity,
        lineTotal: product.price * line.quantity,
      },
    ];
  });

  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);
  const itemsPayload = JSON.stringify(
    items.map((item) => ({
      slug: item.product.slug,
      quantity: item.quantity,
    })),
  );
  const fieldErrors = state.fieldErrors ?? {};

  if (!ready) {
    return (
      <div
        className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]"
        aria-busy="true"
      >
        <div className="space-y-4">
          <p className="sr-only">Memuat keranjang…</p>
          {Array.from({ length: 2 }, (_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-2xl border border-border bg-surface"
            />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl border border-border bg-surface" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mt-8 rounded-3xl border border-accent/40 bg-accent/5 px-6 py-16 text-center">
        <CheckCircle2 className="mx-auto size-9 text-accent-text" aria-hidden="true" />
        <h2 className="mt-4 font-display text-xl font-semibold">
          Pesanan berhasil dibuat
        </h2>
        <p className="mt-2 text-sm text-muted">
          Nomor pesanan{" "}
          <span className="font-mono text-text">#{state.orderNumber}</span>. Mengalihkan
          ke detail pesanan…
        </p>
        <Link
          href={`/akun/pesanan/${state.orderNumber}`}
          className={buttonClass("secondary", "md", "mt-6")}
        >
          Buka detail pesanan
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-3xl border border-dashed border-border px-6 py-20 text-center">
        <ShoppingBag className="mx-auto size-8 text-muted" aria-hidden="true" />
        <h2 className="mt-4 font-display text-xl font-semibold">
          Keranjang masih kosong
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
          Tambahkan produk terlebih dahulu sebelum masuk ke checkout.
        </p>
        <Link href="/products" className={buttonClass("primary", "md", "mt-6")}>
          Mulai belanja
        </Link>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)] lg:gap-12"
    >
      <div className="min-w-0 space-y-6">
        {state.status === "error" && state.message ? (
          <div
            role="alert"
            className="rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
          >
            {state.message}
          </div>
        ) : null}

        <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold">Data penerima</h2>
          <p className="mt-1 text-xs text-muted">
            Nama dan nomor yang bisa dihubungi kurir.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="recipientName" className="text-xs font-medium">
                Nama penerima
              </label>
              <input
                id="recipientName"
                name="recipientName"
                type="text"
                autoComplete="name"
                maxLength={80}
                aria-invalid={Boolean(fieldErrors.recipientName)}
                aria-describedby={
                  fieldErrors.recipientName ? "recipientName-error" : undefined
                }
                className={cn(
                  inputClass,
                  fieldErrors.recipientName && "border-danger/60",
                )}
              />
              <FieldError
                id="recipientName-error"
                message={fieldErrors.recipientName}
              />
            </div>

            <div>
              <label htmlFor="recipientPhone" className="text-xs font-medium">
                Nomor HP
              </label>
              <input
                id="recipientPhone"
                name="recipientPhone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="081234567890"
                maxLength={20}
                aria-invalid={Boolean(fieldErrors.recipientPhone)}
                aria-describedby={
                  fieldErrors.recipientPhone ? "recipientPhone-error" : undefined
                }
                className={cn(
                  inputClass,
                  fieldErrors.recipientPhone && "border-danger/60",
                )}
              />
              <FieldError
                id="recipientPhone-error"
                message={fieldErrors.recipientPhone}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold">Alamat pengiriman</h2>
          <p className="mt-1 text-xs text-muted">
            Alamat lengkap membantu kurir menemukan lokasi tujuan.
          </p>

          <div className="mt-5 grid gap-4">
            <div>
              <label htmlFor="addressLine" className="text-xs font-medium">
                Alamat lengkap
              </label>
              <textarea
                id="addressLine"
                name="addressLine"
                rows={3}
                autoComplete="street-address"
                maxLength={300}
                placeholder="Jalan, nomor rumah, RT/RW, kecamatan"
                aria-invalid={Boolean(fieldErrors.addressLine)}
                aria-describedby={
                  fieldErrors.addressLine ? "addressLine-error" : undefined
                }
                className={cn(
                  inputClass,
                  "resize-y",
                  fieldErrors.addressLine && "border-danger/60",
                )}
              />
              <FieldError id="addressLine-error" message={fieldErrors.addressLine} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="city" className="text-xs font-medium">
                  Kota / kabupaten
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  maxLength={80}
                  aria-invalid={Boolean(fieldErrors.city)}
                  aria-describedby={fieldErrors.city ? "city-error" : undefined}
                  className={cn(inputClass, fieldErrors.city && "border-danger/60")}
                />
                <FieldError id="city-error" message={fieldErrors.city} />
              </div>

              <div>
                <label htmlFor="province" className="text-xs font-medium">
                  Provinsi
                </label>
                <input
                  id="province"
                  name="province"
                  type="text"
                  autoComplete="address-level1"
                  maxLength={80}
                  aria-invalid={Boolean(fieldErrors.province)}
                  aria-describedby={
                    fieldErrors.province ? "province-error" : undefined
                  }
                  className={cn(
                    inputClass,
                    fieldErrors.province && "border-danger/60",
                  )}
                />
                <FieldError id="province-error" message={fieldErrors.province} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="postalCode" className="text-xs font-medium">
                  Kode pos
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={5}
                  aria-invalid={Boolean(fieldErrors.postalCode)}
                  aria-describedby={
                    fieldErrors.postalCode ? "postalCode-error" : undefined
                  }
                  className={cn(
                    inputClass,
                    fieldErrors.postalCode && "border-danger/60",
                  )}
                />
                <FieldError id="postalCode-error" message={fieldErrors.postalCode} />
              </div>

              <div>
                <label htmlFor="notes" className="text-xs font-medium">
                  Catatan <span className="text-muted">(opsional)</span>
                </label>
                <input
                  id="notes"
                  name="notes"
                  type="text"
                  maxLength={300}
                  placeholder="Patokan alamat atau instruksi kurir"
                  aria-invalid={Boolean(fieldErrors.notes)}
                  aria-describedby={fieldErrors.notes ? "notes-error" : undefined}
                  className={cn(inputClass, fieldErrors.notes && "border-danger/60")}
                />
                <FieldError id="notes-error" message={fieldErrors.notes} />
              </div>
            </div>
          </div>
        </section>

        <fieldset className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <legend className="px-1 font-display text-lg font-semibold">
            Metode pembayaran
          </legend>

          <div className="mt-3 flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/5 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-accent/40 text-accent-text">
              <Banknote className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold">Transfer bank</p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Pesanan dibuat dengan pembayaran belum diverifikasi. Status pesanan
                tetap menunggu konfirmasi sampai pembayaran dicek.
              </p>
              {bankConfigured ? (
                <p className="mt-2 text-xs leading-5 text-muted">
                  Detail rekening tujuan tampil di halaman pesanan setelah checkout.
                </p>
              ) : (
                <p className="mt-2 text-xs leading-5 text-danger">
                  Rekening tujuan belum diatur oleh toko. Jangan melakukan transfer
                  sebelum instruksi tersedia di halaman pesanan.
                </p>
              )}
            </div>
          </div>
        </fieldset>

        <input type="hidden" name="items" value={itemsPayload} />
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-semibold">Ringkasan</h2>
            <Link
              href="/cart"
              className="text-xs text-muted transition-colors hover:text-text"
            >
              Ubah keranjang
            </Link>
          </div>

          <ul className="mt-5 space-y-4">
            {items.map(({ product, quantity, lineTotal }) => (
              <li key={product.slug} className="flex gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {quantity} × {formatIDR(product.price)}
                  </p>
                  {quantity > product.stock ? (
                    <p className="mt-1 text-[11px] text-danger">
                      Stok tersisa {product.stock} unit.
                    </p>
                  ) : null}
                </div>
                <p className="text-sm font-semibold">{formatIDR(lineTotal)}</p>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
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
            <span className="font-display text-2xl font-semibold">
              {formatIDR(subtotal)}
            </span>
          </div>

          {fieldErrors.items ? (
            <p role="alert" className="mt-3 text-xs text-danger">
              {fieldErrors.items}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className={buttonClass("primary", "lg", "mt-5 w-full")}
          >
            {pending ? "Membuat pesanan…" : "Buat pesanan"}
          </button>

          <p className="mt-3 text-[11px] leading-5 text-muted">
            Pesanan tersimpan dengan status menunggu konfirmasi. Stok dikurangi setelah
            pesanan berhasil dibuat, dan harga dihitung ulang dari database.
          </p>
        </div>
      </aside>
    </form>
  );
}
