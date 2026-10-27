import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun USK Tech Premium untuk melihat ringkasan akunmu.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/akun");

  const params = await searchParams;
  const next =
    params.next?.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/akun";

  return (
    <div className="container-page py-12 lg:py-20">
      <div className="mx-auto max-w-md">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted">
          <Link href="/" className="transition-colors hover:text-text">
            Beranda
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-text">
            Masuk
          </span>
        </nav>

        <div className="mt-8 rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <p className="eyebrow">Akun USK</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
            Masuk<span className="text-accent-text">.</span>
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Gunakan email dan kata sandi yang kamu daftarkan untuk mengakses halaman
            akun.
          </p>

          <LoginForm next={next} />
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-muted">
          Belum siap mendaftar?{" "}
          <Link href="/products" className="text-accent-text hover:opacity-75">
            Jelajahi katalog
          </Link>{" "}
          tanpa akun.
        </p>
      </div>
    </div>
  );
}
