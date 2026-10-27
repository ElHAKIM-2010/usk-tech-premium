import Link from "next/link";
import { categories } from "@/data/catalog";

export function Footer({ userName }: { userName?: string | null }) {
  return (
    <footer className="mt-auto border-t border-border bg-surface/40">
      <div className="container-page py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl font-extrabold tracking-tight">
              USK<span className="text-accent-text">.</span>
            </p>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
              Elektronik pilihan dengan informasi yang jelas. Laptop, smartphone,
              audio, dan aksesori untuk kerja maupun waktu luang.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              Katalog aktif
            </p>
          </div>

          <nav aria-label="Kategori">
            <p className="label-mono">Kategori</p>
            <ul className="mt-4 space-y-3 text-sm">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="text-muted transition-colors hover:text-text"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <nav aria-label="Toko">
              <p className="label-mono">Toko</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link href="/" className="text-muted transition-colors hover:text-text">
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-muted transition-colors hover:text-text">
                    Semua produk
                  </Link>
                </li>
                <li>
                  <Link href="/cart" className="text-muted transition-colors hover:text-text">
                    Keranjang
                  </Link>
                </li>
                {userName ? (
                  <li>
                    <Link href="/akun" className="text-muted transition-colors hover:text-text">
                      Akun saya
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link href="/masuk" className="text-muted transition-colors hover:text-text">
                        Masuk
                      </Link>
                    </li>
                    <li>
                      <Link href="/daftar" className="text-muted transition-colors hover:text-text">
                        Daftar
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>

            <p className="label-mono mt-8">Pesanan</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/cart" className="text-muted transition-colors hover:text-text">
                  Checkout
                </Link>
              </li>
              <li>
                <Link
                  href="/akun/pesanan"
                  className="text-muted transition-colors hover:text-text"
                >
                  Riwayat pesanan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} USK Tech Premium.</p>
          <p>Dibangun dengan Next.js, Tailwind CSS, dan Neon PostgreSQL.</p>
        </div>
      </div>
    </footer>
  );
}
