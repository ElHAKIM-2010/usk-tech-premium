"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Package,
  Tags,
  X,
} from "lucide-react";

import { buttonClass } from "@/lib/ui";
import { cn } from "@/lib/cn";

const links = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin/produk", label: "Produk", icon: Package },
  { href: "/admin/kategori", label: "Kategori", icon: Tags },
  { href: "/admin/pesanan", label: "Pesanan", icon: ClipboardList },
];

interface AdminSidebarProps {
  name: string;
  email: string;
}

function SidebarBody({
  name,
  email,
  pathname,
  onNavigate,
}: AdminSidebarProps & { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Link
        href="/admin"
        onClick={onNavigate}
        className="flex items-baseline gap-2 px-2"
        aria-label="USK Tech Premium admin"
      >
        <span className="font-display text-xl font-extrabold tracking-tight">
          USK<span className="text-accent-text">.</span>
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted">
          Admin
        </span>
      </Link>

      <p className="label-mono mt-1 px-2">Kontrol toko</p>

      <nav aria-label="Navigasi admin" className="mt-6 grid gap-1">
        {links.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent/10 text-accent-text"
                  : "text-muted hover:bg-surface-2 hover:text-text",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-4">
        <p className="label-mono px-2">Masuk sebagai</p>
        <p className="mt-2 truncate px-2 text-sm font-medium">{name}</p>
        <p className="truncate px-2 text-xs text-muted">{email}</p>
        <Link
          href="/"
          className={buttonClass("secondary", "sm", "mt-4 w-full")}
        >
          Lihat toko
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export function AdminSidebar({ name, email }: AdminSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <aside className="sticky top-24 hidden h-[calc(100dvh-7rem)] flex-col overflow-y-auto rounded-2xl border border-border bg-surface p-4 lg:flex">
        <SidebarBody name={name} email={email} pathname={pathname} />
      </aside>

      <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-3 lg:hidden">
        <div className="min-w-0">
          <p className="font-display text-lg font-extrabold leading-none tracking-tight">
            USK<span className="text-accent-text">.</span>
          </p>
          <p className="mt-1 truncate text-xs text-muted">Panel admin · {name}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="admin-menu-mobile"
          aria-haspopup="dialog"
          aria-label="Buka menu admin"
          className={buttonClass("secondary", "sm", "shrink-0")}
        >
          <Menu className="size-4" aria-hidden="true" />
          Menu
        </button>
      </div>

      {open ? (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu admin"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm"
          />
          <div
            id="admin-menu-mobile"
            role="dialog"
            aria-modal="true"
            aria-label="Menu admin"
            className="fixed inset-y-0 left-0 z-70 flex w-[min(19rem,85vw)] flex-col overflow-y-auto border-r border-border bg-bg p-5"
          >
            <div className="mb-4 flex justify-end">
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu admin"
                className="grid size-9 place-items-center rounded-full border border-border text-muted transition-colors hover:border-text/30 hover:text-text"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <SidebarBody
              name={name}
              email={email}
              pathname={pathname}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
