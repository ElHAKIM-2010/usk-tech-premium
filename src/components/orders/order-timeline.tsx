import { Check, X } from "lucide-react";

import { cn } from "@/lib/cn";
import type { OrderStatus } from "@/types/order";

const steps = [
  {
    status: "pending",
    label: "Menunggu konfirmasi",
    hint: "Pesanan diterima dan pembayaran diperiksa.",
  },
  {
    status: "diproses",
    label: "Diproses",
    hint: "Barang disiapkan untuk dikirim.",
  },
  {
    status: "dikirim",
    label: "Dikirim",
    hint: "Paket dalam perjalanan ke alamat tujuan.",
  },
  {
    status: "selesai",
    label: "Selesai",
    hint: "Pesanan sudah diterima.",
  },
] as const;

const activeSteps: OrderStatus[] = ["pending", "diproses", "dikirim", "selesai"];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "dibatalkan") {
    return (
      <section className="rounded-2xl border border-danger/40 bg-danger/5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full border border-danger/40 bg-danger/10 text-danger">
            <X className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">Pesanan dibatalkan</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Stok produk sudah dikembalikan ke katalog. Hubungi toko bila kamu butuh
              bantuan lain.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const currentIndex = activeSteps.indexOf(status);

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold">Alur pesanan</h2>
      <ol className="mt-5 grid gap-4 sm:grid-cols-4">
        {steps.map((step, index) => {
          const done = index <= currentIndex;
          const current = index === currentIndex;

          return (
            <li key={step.status} className="flex gap-3 sm:flex-col sm:gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full border font-mono text-xs",
                  done
                    ? "border-accent/50 bg-accent/15 text-accent-text"
                    : "border-border text-muted",
                )}
              >
                {done ? <Check className="size-4" /> : index + 1}
              </span>
              <div>
                <p
                  className={cn(
                    "text-xs font-semibold",
                    done ? "text-text" : "text-muted",
                    current && "text-accent-text",
                  )}
                >
                  {step.label}
                </p>
                <p className="mt-1 text-[11px] leading-5 text-muted">{step.hint}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
