"use client";

import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  label = "Kuantitas",
}: QuantityStepperProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center rounded-full border border-border bg-surface"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Kurangi jumlah"
        className="grid size-10 place-items-center rounded-full text-muted transition hover:text-text disabled:opacity-35"
      >
        <Minus className="size-4" />
      </button>
      <span
        aria-live="polite"
        className="w-9 text-center font-mono text-sm tabular-nums"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Tambah jumlah"
        className="grid size-10 place-items-center rounded-full text-muted transition hover:text-text disabled:opacity-35"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
