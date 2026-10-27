"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/cn";

interface NavbarProps {
  userName?: string | null;
}

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/products", label: "Katalog" },
  { href: "/products?category=laptop", label: "Laptop" },
  { href: "/products?category=smartphone", label: "Smartphone" },
  { href: "/products?category=aksesori", label: "Aksesori" },
];

export function Navbar({ userName }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);

  function handleMobileSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    setOpen(false);
    router.push(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
  }

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const cartLabel = ready && count > 0 ? `Keranjang, ${count} item` : "Keranjang";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-header backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-4 lg:h-[4.5rem]">
        <Link
          href="/"
          aria-label="USK Tech Premium — Beranda"
          className="flex shrink-0 items-baseline gap-2"
        >
          <span className="font-display text-2xl font-extrabold tracking-tight">
            USK<span className="text-accent-text">.</span>
          </span>
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.22em] text-muted sm:block">
            Tech Premium
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="ml-6 hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : link.href === "/products"
                  ? pathname.startsWith("/products")
                  : false;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-text" : "text-muted hover:text-text",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <form
            action="/products"
            role="search"
            className="hidden items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 transition-colors focus-within:border-accent-text/60 md:flex"
          >
            <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
            <input
              type="search"
              name="q"
              placeholder="Cari produk"
              aria-label="Cari produk"
              className="w-28 bg-transparent text-sm text-text outline-none placeholder:text-muted focus-visible:outline-none xl:w-44"
            />
          </form>

          <ThemeToggle />

          <Link
            href={userName ? "/akun" : "/masuk"}
            aria-label={userName ? `Akun ${userName}` : "Masuk ke akun"}
            className="grid size-10 place-items-center rounded-full border border-border text-muted transition-colors hover:border-text/30 hover:text-text"
          >
            <UserRound className="size-4" aria-hidden="true" />
          </Link>

          <Link
            href="/cart"
            aria-label={cartLabel}
            className="relative grid size-10 place-items-center rounded-full border border-border text-muted transition-colors hover:border-text/30 hover:text-text"
          >
            <ShoppingBag className="size-4" aria-hidden="true" />
            {ready && count > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 font-mono text-[10px] font-semibold text-accent-ink">
                {count > 99 ? "99+" : count}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            className="grid size-10 place-items-center rounded-full border border-border text-muted transition-colors hover:border-text/30 hover:text-text lg:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="menu-mobile" className="border-t border-border bg-bg lg:hidden">
          <div className="container-page space-y-5 py-5">
            <form
              action="/products"
              role="search"
              onSubmit={handleMobileSearch}
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 focus-within:border-accent-text/60"
            >
              <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
              <input
                type="search"
                name="q"
                placeholder="Cari produk atau kategori"
                aria-label="Cari produk"
                className="w-full bg-transparent text-sm text-text outline-none placeholder:text-muted focus-visible:outline-none"
              />
            </form>

            <nav aria-label="Navigasi mobile" className="grid gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-text transition-colors hover:bg-surface-2"
                >
                  {link.label}
                  <span aria-hidden="true" className="text-muted">
                    →
                  </span>
                </Link>
              ))}
            </nav>

            <div className="grid gap-1 border-t border-border pt-3">
              {userName ? (
                <Link
                  href="/akun"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-text transition-colors hover:bg-surface-2"
                >
                  Akun saya
                  <span className="max-w-[10rem] truncate text-xs font-normal text-muted">
                    {userName}
                  </span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/masuk"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-text transition-colors hover:bg-surface-2"
                  >
                    Masuk
                    <span aria-hidden="true" className="text-muted">
                      →
                    </span>
                  </Link>
                  <Link
                    href="/daftar"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-text transition-colors hover:bg-surface-2"
                  >
                    Daftar
                    <span aria-hidden="true" className="text-muted">
                      →
                    </span>
                  </Link>
                </>
              )}
            </div>

            <p className="px-4 text-xs leading-5 text-muted">
              Pesanan dan riwayatnya tersedia di halaman akun.
            </p>
          </div>
        </div>
      ) : null}
    </header>
  );
}
