"use client";

import Link from "next/link";
import { useActionState } from "react";

import { buttonClass } from "@/lib/ui";
import { register, type RegisterState } from "./actions";

const initialState: RegisterState = {};

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-bg px-3.5 py-3 text-sm text-text outline-none placeholder:text-muted focus:border-accent-text/60";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label htmlFor="name" className="label-mono">
          Nama
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
          placeholder="Nama lengkap"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="email" className="label-mono">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="nama@email.com"
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className="label-mono">
            Kata sandi
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="confirm" className="label-mono">
            Ulangi kata sandi
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            placeholder="Ulangi kata sandi"
            className={inputClass}
          />
        </div>
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className={buttonClass("primary", "lg", "w-full")}
      >
        {pending ? "Membuat akun…" : "Buat akun"}
      </button>

      <p className="text-center text-sm text-muted">
        Sudah punya akun?{" "}
        <Link href="/masuk" className="font-medium text-accent-text hover:opacity-75">
          Masuk
        </Link>
      </p>
    </form>
  );
}
