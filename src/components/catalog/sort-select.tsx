"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

interface SortSelectProps {
  value: string;
  query: string;
}

const options = [
  { value: "featured", label: "Pilihan" },
  { value: "newest", label: "Terbaru" },
  { value: "price-asc", label: "Harga terendah" },
  { value: "price-desc", label: "Harga tertinggi" },
  { value: "rating", label: "Rating tertinggi" },
];

export function SortSelect({ value, query }: SortSelectProps) {
  const router = useRouter();

  function onChange(nextValue: string) {
    const params = new URLSearchParams(query);

    if (nextValue === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", nextValue);
    }

    params.delete("page");

    const nextQuery = params.toString();
    router.push(nextQuery ? `/products?${nextQuery}` : "/products");
  }

  return (
    <div className="relative inline-flex items-center">
      <label htmlFor="sort" className="sr-only">
        Urutkan produk
      </label>
      <select
        id="sort"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="appearance-none rounded-full border border-border bg-surface py-2.5 pl-4 pr-10 text-sm text-text outline-none focus:border-accent-text/60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 size-4 text-muted"
      />
    </div>
  );
}
