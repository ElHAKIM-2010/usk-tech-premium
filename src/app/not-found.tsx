import Link from "next/link";
import { buttonClass } from "@/lib/ui";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Halaman tidak ditemukan.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted">
        Alamat ini tidak tersedia atau produk yang kamu cari sudah tidak ada di katalog.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/products" className={buttonClass("primary", "md")}>
          Lihat katalog
        </Link>
        <Link href="/" className={buttonClass("secondary", "md")}>
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
