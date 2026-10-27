import Link from "next/link";
import { Search } from "lucide-react";
import { buttonClass } from "@/lib/ui";
import { cn } from "@/lib/cn";

interface CategoryLink {
  name: string;
  href: string;
  active: boolean;
}

interface FilterSidebarProps {
  q: string;
  minPrice?: number;
  maxPrice?: number;
  sort: string;
  activeCategory?: string;
  categoryLinks: CategoryLink[];
  resetHref: string;
  hasFilters: boolean;
}

interface FilterPanelProps extends FilterSidebarProps {
  idPrefix: string;
}

function FilterPanel({
  q,
  minPrice,
  maxPrice,
  sort,
  activeCategory,
  categoryLinks,
  resetHref,
  hasFilters,
  idPrefix,
}: FilterPanelProps) {
  return (
    <div className="space-y-7 p-5">
      <form action="/products" method="get" className="space-y-5">
        {sort !== "featured" ? <input type="hidden" name="sort" value={sort} /> : null}
        {activeCategory ? (
          <input type="hidden" name="category" value={activeCategory} />
        ) : null}

        <div>
          <label htmlFor={`${idPrefix}-q`} className="label-mono">
            Pencarian
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-bg px-3 py-2.5 focus-within:border-accent-text/60">
            <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
            <input
              id={`${idPrefix}-q`}
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Nama produk"
              className="w-full bg-transparent text-sm text-text outline-none placeholder:text-muted focus-visible:outline-none"
            />
          </div>
        </div>

        <fieldset>
          <legend className="label-mono">Rentang harga</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <label htmlFor={`${idPrefix}-min`} className="sr-only">
                Harga minimum
              </label>
              <input
                id={`${idPrefix}-min`}
                name="min"
                type="number"
                inputMode="numeric"
                min={0}
                step={100000}
                defaultValue={minPrice ?? ""}
                placeholder="Min"
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none placeholder:text-muted focus:border-accent-text/60"
              />
            </div>
            <div>
              <label htmlFor={`${idPrefix}-max`} className="sr-only">
                Harga maksimum
              </label>
              <input
                id={`${idPrefix}-max`}
                name="max"
                type="number"
                inputMode="numeric"
                min={0}
                step={100000}
                defaultValue={maxPrice ?? ""}
                placeholder="Maks"
                className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text outline-none placeholder:text-muted focus:border-accent-text/60"
              />
            </div>
          </div>
          <p className="mt-2 text-[11px] leading-4 text-muted">Dalam Rupiah, tanpa titik.</p>
        </fieldset>

        <button type="submit" className={buttonClass("primary", "md", "w-full")}>
          Terapkan filter
        </button>

        {hasFilters ? (
          <Link
            href={resetHref}
            className="block text-center text-xs font-medium text-muted transition-colors hover:text-text"
          >
            Reset semua filter
          </Link>
        ) : null}
      </form>

      <div>
        <p className="label-mono">Kategori</p>
        <ul className="mt-3 space-y-1">
          {categoryLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                aria-current={link.active ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  link.active
                    ? "bg-accent font-semibold text-accent-ink"
                    : "text-muted hover:bg-surface-2 hover:text-text",
                )}
              >
                {link.name}
                <span aria-hidden="true" className="font-mono text-[10px] opacity-60">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function FilterSidebar(props: FilterSidebarProps) {
  return (
    <>
      <details className="rounded-2xl border border-border bg-surface lg:hidden">
        <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-display text-base font-semibold">
          Filter & pencarian
          <span aria-hidden="true" className="text-xs font-normal text-muted">
            Buka
          </span>
        </summary>
        <div className="border-t border-border">
          <FilterPanel {...props} idPrefix="mobile" />
        </div>
      </details>

      <aside className="hidden lg:block">
        <div className="sticky top-24 overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-display text-base font-semibold">Filter</h2>
          </div>
          <FilterPanel {...props} idPrefix="desktop" />
        </div>
      </aside>
    </>
  );
}
