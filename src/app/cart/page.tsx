import type { Metadata } from "next";
import Link from "next/link";
import { CartView } from "@/components/cart/cart-view";
import { listAllProducts } from "@/db/catalog";
import { getCurrentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Keranjang",
  description: "Tinjau produk yang kamu pilih sebelum melanjutkan ke checkout.",
};

export default async function CartPage() {
  const [catalog, user] = await Promise.all([
    listAllProducts(),
    getCurrentUser(),
  ]);

  return (
    <div className="container-page py-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted">
        <Link href="/" className="transition-colors hover:text-text">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-text">
          Keranjang
        </span>
      </nav>

      <div className="mt-6 border-b border-border pb-8">
        <p className="eyebrow">Belanja</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Keranjang<span className="text-accent-text">.</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
          Periksa jumlah dan subtotal. Isi keranjang tetap tersimpan di perangkat ini.
        </p>
      </div>

      <CartView catalog={catalog} isLoggedIn={Boolean(user)} />
    </div>
  );
}
