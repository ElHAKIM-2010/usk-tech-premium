"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { buttonClass } from "@/lib/ui";

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Katalog</p>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
        Katalog gagal dimuat
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted">
        Terjadi kendala saat mengambil data produk. Coba muat ulang halaman ini. Jika
        masalah berlanjut, kembali ke beranda dan pilih katalog lagi.
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-[11px] text-muted">Kode: {error.digest}</p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className={buttonClass("primary", "md")}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Coba lagi
        </button>
        <Link href="/" className={buttonClass("secondary", "md")}>
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
