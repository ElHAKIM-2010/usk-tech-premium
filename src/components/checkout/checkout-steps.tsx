import { Check } from "lucide-react";

import { cn } from "@/lib/cn";

const steps = [
  { label: "Keranjang", description: "Produk sudah dipilih" },
  { label: "Data pengiriman", description: "Alamat dan pembayaran" },
  { label: "Pesanan dibuat", description: "Instruksi pembayaran" },
];

export function CheckoutSteps() {
  return (
    <nav aria-label="Langkah checkout" className="mt-6">
      <ol className="grid gap-3 sm:grid-cols-3">
        {steps.map((step, index) => {
          const current = index === 1;
          const done = index === 0;

          return (
            <li
              key={step.label}
              aria-current={current ? "step" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3",
                current
                  ? "border-accent/50 bg-accent/5"
                  : "border-border bg-surface",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full border font-mono text-xs",
                  done && "border-accent/50 bg-accent/15 text-accent-text",
                  current && "border-accent/60 text-accent-text",
                  !done && !current && "border-border text-muted",
                )}
              >
                {done ? <Check className="size-4" /> : index + 1}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block text-xs font-semibold",
                    current ? "text-text" : "text-muted",
                  )}
                >
                  {step.label}
                </span>
                <span className="mt-0.5 block text-[11px] text-muted">
                  {step.description}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
