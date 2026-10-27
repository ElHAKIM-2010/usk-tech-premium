"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const links = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/produk", label: "Produk" },
  { href: "/admin/kategori", label: "Kategori" },
  { href: "/admin/pesanan", label: "Pesanan" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi admin" className="mt-6 flex flex-wrap gap-2">
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "border-accent-text/50 bg-accent/10 text-accent-text"
                : "border-border text-muted hover:border-text/30 hover:text-text",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
