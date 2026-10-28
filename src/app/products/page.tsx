import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { FilterSidebar } from "@/components/catalog/filter-sidebar";
import { Pagination } from "@/components/catalog/pagination";
import { ProductCard } from "@/components/catalog/product-card";
import { SortSelect } from "@/components/catalog/sort-select";
import { Reveal } from "@/components/ui/reveal";
import { buttonClass } from "@/lib/ui";
import { DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/site";
import { listCategories, listProducts, type ProductSort } from "@/db/catalog";

export const dynamic = "force-dynamic";

const catalogDescription =
  "Jelajahi katalog USK Tech Premium: laptop, smartphone, TWS, headset, keyboard, mouse, dan aksesori dengan filter kategori serta rentang harga.";

export const metadata: Metadata = {
  title: "Katalog",
  description: catalogDescription,
  alternates: { canonical: "/products" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE_NAME,
    url: "/products",
    title: "Katalog — USK Tech Premium",
    description: catalogDescription,
    images: [DEFAULT_OG_IMAGE],
  },
};

interface CatalogSearchParams {
  q?: string;
  category?: string;
  min?: string;
  max?: string;
  sort?: string;
  page?: string;
}

type SortValue = ProductSort;

const PAGE_SIZE = 6;

const sortValues: SortValue[] = ["featured", "newest", "price-asc", "price-desc", "rating"];

function parsePrice(value: string | undefined) {
  if (!value) return undefined;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;

  return parsed;
}

function parsePage(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;

  return parsed;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const params = await searchParams;
  const categoryList = await listCategories();

  const q = (params.q ?? "").trim().slice(0, 80);
  const activeCategory = categoryList.find(
    (category) => category.slug === params.category,
  )?.slug;
  const minPrice = parsePrice(params.min);
  const maxPrice = parsePrice(params.max);
  const sort: SortValue = sortValues.includes(params.sort as SortValue)
    ? (params.sort as SortValue)
    : "featured";
  const requestedPage = parsePage(params.page);

  function toQuery(overrides: Record<string, string | undefined | null>) {
    const base: Record<string, string | undefined | null> = {
      q: q || undefined,
      category: activeCategory,
      min: minPrice !== undefined ? String(minPrice) : undefined,
      max: maxPrice !== undefined ? String(maxPrice) : undefined,
      sort: sort !== "featured" ? sort : undefined,
      ...overrides,
    };

    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(base)) {
      if (value) search.set(key, value);
    }

    return search.toString();
  }

  function hrefWith(overrides: Record<string, string | undefined | null>) {
    const query = toQuery(overrides);
    return query ? `/products?${query}` : "/products";
  }

  const {
    products: paginated,
    total,
    page,
    totalPages,
  } = await listProducts({
    q: q || undefined,
    category: activeCategory,
    minPrice,
    maxPrice,
    sort,
    page: requestedPage,
    pageSize: PAGE_SIZE,
  });

  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const hasFilters = Boolean(q || activeCategory || minPrice !== undefined || maxPrice !== undefined);

  const categoryLinks = [
    {
      name: "Semua kategori",
      href: hrefWith({ category: undefined, page: undefined }),
      active: !activeCategory,
    },
    ...categoryList.map((category) => ({
      name: category.name,
      href: hrefWith({ category: category.slug, page: undefined }),
      active: activeCategory === category.slug,
    })),
  ];

  const activeCategoryName = activeCategory
    ? categoryList.find((category) => category.slug === activeCategory)?.name
    : undefined;

  return (
    <div className="container-page py-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted">
        <Link href="/" className="transition-colors hover:text-text">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-text">
          Katalog
        </span>
      </nav>

      <div className="animate-rise mt-6 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Katalog USK</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {activeCategoryName ? activeCategoryName : "Semua produk"}
            <span className="text-accent-text">.</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            {q
              ? `Hasil pencarian untuk “${q}”.`
              : "Gunakan filter kategori dan rentang harga untuk mempersempit pilihan."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <p className="hidden text-xs text-muted sm:block">
            {total} produk
          </p>
          <SortSelect value={sort} query={toQuery({ sort: undefined, page: undefined })} />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <FilterSidebar
          q={q}
          minPrice={minPrice}
          maxPrice={maxPrice}
          sort={sort}
          activeCategory={activeCategory}
          categoryLinks={categoryLinks}
          resetHref="/products"
          hasFilters={hasFilters}
        />

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted">
              Menampilkan {rangeStart}–{rangeEnd} dari {total} produk
            </p>

            {hasFilters ? (
              <div className="flex flex-wrap items-center gap-2">
                {activeCategoryName ? (
                  <Link
                    href={hrefWith({ category: undefined, page: undefined })}
                    className="rounded-full border border-border px-3 py-1.5 text-[11px] text-muted transition-colors hover:border-text/30 hover:text-text"
                  >
                    {activeCategoryName} ✕
                  </Link>
                ) : null}
                {q ? (
                  <Link
                    href={hrefWith({ q: undefined, page: undefined })}
                    className="rounded-full border border-border px-3 py-1.5 text-[11px] text-muted transition-colors hover:border-text/30 hover:text-text"
                  >
                    “{q}” ✕
                  </Link>
                ) : null}
                {minPrice !== undefined || maxPrice !== undefined ? (
                  <Link
                    href={hrefWith({ min: undefined, max: undefined, page: undefined })}
                    className="rounded-full border border-border px-3 py-1.5 text-[11px] text-muted transition-colors hover:border-text/30 hover:text-text"
                  >
                    Harga {minPrice !== undefined ? `≥ ${minPrice.toLocaleString("id-ID")}` : ""}
                    {minPrice !== undefined && maxPrice !== undefined ? " · " : ""}
                    {maxPrice !== undefined ? `≤ ${maxPrice.toLocaleString("id-ID")}` : ""} ✕
                  </Link>
                ) : null}
                <Link
                  href="/products"
                  className="text-[11px] font-medium text-accent-text hover:opacity-75"
                >
                  Hapus semua
                </Link>
              </div>
            ) : null}
          </div>

          {paginated.length === 0 ? (
            <div className="animate-rise mt-8 rounded-2xl border border-dashed border-border px-6 py-20 text-center">
              <SearchX className="mx-auto size-8 text-muted" aria-hidden="true" />
              <h2 className="mt-4 font-display text-lg font-semibold">Produk tidak ditemukan</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
                Coba kata kunci lain, longgarkan rentang harga, atau pilih kategori yang
                berbeda.
              </p>
              <Link href="/products" className={buttonClass("primary", "md", "mt-6")}>
                Reset pencarian
              </Link>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
              {paginated.map((product, index) => (
                <Reveal
                  key={product.slug}
                  delay={Math.min(index * 60, 240)}
                  className="h-full"
                >
                  <ProductCard
                    product={product}
                    priority={page === 1 && index < 3}
                  />
                </Reveal>
              ))}
            </div>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            hrefForPage={(target) =>
              hrefWith({ page: target > 1 ? String(target) : undefined })
            }
          />
        </div>
      </div>
    </div>
  );
}
