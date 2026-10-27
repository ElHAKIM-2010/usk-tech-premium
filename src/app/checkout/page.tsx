import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CheckoutForm } from "./checkout-form";
import { listAllProducts } from "@/db/catalog";
import { getCurrentUser } from "@/lib/current-user";
import { getBankAccount } from "@/lib/payment";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Lengkapi data penerima dan buat pesanan USK Tech Premium.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/masuk?next=/checkout");

  const catalog = await listAllProducts();

  return (
    <div className="container-page py-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted">
        <Link href="/" className="transition-colors hover:text-text">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/cart" className="transition-colors hover:text-text">
          Keranjang
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-text">
          Checkout
        </span>
      </nav>

      <div className="mt-6 border-b border-border pb-8">
        <p className="eyebrow">Langkah terakhir</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Checkout<span className="text-accent-text">.</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
          Pesanan tercatat atas nama {user.email}. Harga dan stok akan diperiksa ulang
          oleh server sebelum pesanan dibuat.
        </p>
      </div>

      <CheckoutForm
        catalog={catalog}
        bankConfigured={getBankAccount() !== null}
      />
    </div>
  );
}
