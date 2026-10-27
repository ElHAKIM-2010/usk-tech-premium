import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { RegisterForm } from "./register-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Daftar",
  description:
    "Buat akun USK Tech Premium. Kata sandi disimpan sebagai hash, bukan teks biasa.",
};

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/akun");

  return (
    <div className="container-page py-12 lg:py-20">
      <div className="mx-auto max-w-lg">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted">
          <Link href="/" className="transition-colors hover:text-text">
            Beranda
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-text">
            Daftar
          </span>
        </nav>

        <div className="mt-8 rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <p className="eyebrow">Akun USK</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
            Daftar<span className="text-accent-text">.</span>
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Buat akun untuk menyimpan profil. Kata sandi di-hash sebelum disimpan dan
            tidak pernah dicatat di log.
          </p>

          <RegisterForm />
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-muted">
          Dengan mendaftar, kamu menyetujui penggunaan data akun sebatas untuk layanan
          toko ini.
        </p>
      </div>
    </div>
  );
}
