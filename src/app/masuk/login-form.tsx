"use client";

import Link from "next/link";
import { useActionState } from "react";

import { buttonClass } from "@/lib/ui";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

const inputClass =
  "mt-2 w-full rounded-xl border border-border bg-bg px-3.5 py-3 text-sm text-text outline-none placeholder:text-muted focus:border-accent-text/60";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor="email" className="label-mono">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="nama@email.com"
          className={inputClass}
        />
      </div>

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
          autoComplete="current-password"
          placeholder="Minimal 8 karakter"
          className={inputClass}
        />
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
        {pending ? "Memeriksa…" : "Masuk"}
      </button>

      <p className="text-center text-sm text-muted">
        Belum punya akun?{" "}
        <Link href="/daftar" className="font-medium text-accent-text hover:opacity-75">
          Daftar sekarang
        </Link>
      </p>
    </form>
  );
}
