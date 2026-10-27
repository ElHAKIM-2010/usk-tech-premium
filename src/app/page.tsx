import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { CategoryCard } from "@/components/catalog/category-card";
import { HeroCarousel } from "@/components/catalog/hero-carousel";
import { ProductCard } from "@/components/catalog/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { buttonClass } from "@/lib/ui";
import { formatIDR } from "@/lib/format";
import {
  countProducts,
  getFeaturedProducts,
  getNewestProducts,
  listCategories,
} from "@/db/catalog";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const services = [
  {
    title: "Kurasi manual",
    description:
      "Katalog dibatasi pada perangkat yang relevan, bukan daftar tanpa akhir.",
  },
  {
    title: "Spesifikasi jelas",
    description:
      "Setiap produk menampilkan informasi utama sebelum kamu mengambil keputusan.",
  },
  {
    title: "Harga transparan",
    description:
      "Harga dalam Rupiah, lengkap dengan harga pembanding bila sedang berlaku.",
  },
];

export default async function HomePage() {
  const [categoryList, featuredProducts, newProducts, productCount] =
    await Promise.all([
      listCategories(),
      getFeaturedProducts(6),
      getNewestProducts(3),
      countProducts(),
    ]);

  const heroProduct =
    featuredProducts.find((product) => product.slug === "asus-rog-zephyrus-g14") ??
    featuredProducts[0] ??
    newProducts[0];

  const carouselProducts = heroProduct
    ? [heroProduct, ...featuredProducts.filter((product) => product.slug !== heroProduct.slug)]
    : [];

  return (
    <div className="pb-20 lg:pb-28">
      <section className="container-page pt-5 lg:pt-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface">
          <div className="grid lg:grid-cols-[1.05fr_1fr]">
            <div className="relative flex flex-col justify-center p-7 sm:p-12 lg:p-16">
              <p className="eyebrow animate-rise">USK Tech Premium · Koleksi 2026</p>

              <h1
                className="animate-rise mt-5 font-display text-[2.75rem] font-semibold leading-[1.02] tracking-tight sm:text-6xl"
                style={{ animationDelay: "80ms" }}
              >
                Teknologi pilihan,
                <br />
                <span className="text-muted">tanpa kompromi.</span>
              </h1>

              <p
                className="animate-rise mt-6 max-w-md text-sm leading-7 text-muted sm:text-base"
                style={{ animationDelay: "160ms" }}
              >
                Laptop, smartphone, audio, dan aksesori yang dikurasi untuk kerja,
                kreativitas, dan waktu luang. Spesifikasi jelas, harga terbuka.
              </p>

              <div
                className="animate-rise mt-8 flex flex-wrap items-center gap-3"
                style={{ animationDelay: "240ms" }}
              >
                <Link href="/products" className={buttonClass("primary", "lg")}>
                  Jelajahi katalog
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/products?category=laptop"
                  className={buttonClass("secondary", "lg")}
                >
                  Lihat laptop
                </Link>
              </div>

              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-border pt-6">
                <div>
                  <dt className="label-mono">Produk</dt>
                  <dd className="mt-1.5 font-display text-xl font-semibold">
                    {productCount} kurasi
                  </dd>
                </div>
                <div>
                  <dt className="label-mono">Kategori</dt>
                  <dd className="mt-1.5 font-display text-xl font-semibold">
                    {categoryList.length}
                  </dd>
                </div>
                <div>
                  <dt className="label-mono">Mata uang</dt>
                  <dd className="mt-1.5 font-display text-xl font-semibold">IDR</dd>
                </div>
              </dl>
            </div>

            <div className="relative min-h-[26rem] overflow-hidden bg-surface-2 lg:min-h-[38rem]">
              {carouselProducts.length > 0 ? (
                <HeroCarousel products={carouselProducts} />
              ) : (
                <Image
                  src="/hero-laptop.jpg"
                  alt="Laptop di meja kerja dengan pencahayaan hangat"
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pt-16 lg:pt-24">
        <SectionHeading
          eyebrow="01 — Kategori"
          title="Mulai dari kebutuhanmu."
          description="Enam kategori utama, dipilih agar kamu tidak perlu menyaring ratusan produk tanpa arah."
          action={{ href: "/products", label: "Semua produk" }}
        />

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categoryList.map((category, index) => {
            const large = index === 0;
            const wide = index === categoryList.length - 1;

            return (
              <CategoryCard
                key={category.slug}
                category={category}
                index={index}
                large={large}
                className={
                  large
                    ? "sm:col-span-2 lg:row-span-2"
                    : wide
                      ? "sm:col-span-2 lg:col-span-4"
                      : undefined
                }
              />
            );
          })}
        </div>
      </section>

      <section className="container-page pt-16 lg:pt-24">
        <SectionHeading
          eyebrow="02 — Pilihan editor"
          title="Produk unggulan."
          description="Perangkat yang paling sering masuk daftar pertimbangan, dengan alasan yang bisa kamu periksa sendiri."
          action={{ href: "/products", label: "Lihat semua" }}
        />

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="container-page pt-16 lg:pt-24">
        <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative flex min-h-[20rem] flex-col justify-between overflow-hidden rounded-3xl bg-accent p-7 text-accent-ink sm:p-10 lg:p-12">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-16 font-display text-[12rem] font-extrabold leading-none tracking-tighter opacity-[0.08]"
            >
              USK
            </span>

            <p className="relative font-mono text-[10px] uppercase tracking-[0.2em] opacity-70">
              Setup & produktivitas
            </p>

            <div className="relative mt-10 max-w-md">
              <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Setup yang bekerja secepat kamu.
              </h2>
              <p className="mt-3 text-sm leading-6 opacity-75">
                Keyboard, mouse, dan headset yang membuat sesi kerja terasa lebih
                rapi — tanpa dekorasi berlebihan.
              </p>
              <Link
                href="/products?category=keyboard-mouse"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent-ink px-5 py-3 text-sm font-semibold text-accent transition-opacity hover:opacity-90"
              >
                Lihat keyboard & mouse
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <Link
            href="/products?category=headset"
            className="group relative block min-h-[20rem] overflow-hidden rounded-3xl border border-border bg-surface-2"
          >
            <Image
              src="/products/sony-wh-1000xm6.jpg"
              alt="Headset over-ear untuk fokus dan imersi"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-[1.04]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/0"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-7 text-white">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                  Fokus tanpa gangguan
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
                  Headset pilihan.
                </h2>
              </div>
              <span
                aria-hidden="true"
                className="grid size-10 place-items-center rounded-full border border-white/25 text-white transition-colors group-hover:border-accent group-hover:text-accent"
              >
                <ArrowUpRight className="size-4" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section className="container-page pt-16 lg:pt-24">
        <SectionHeading
          eyebrow="03 — Baru masuk"
          title="Rilis terbaru."
          description="Tiga perangkat terbaru di katalog, diurutkan dari tanggal rilis."
          action={{ href: "/products?sort=newest", label: "Urutkan terbaru" }}
        />

        <div className="mt-6 divide-y divide-border border-y border-border">
          {newProducts.map((product, index) => (
            <Link
              key={product.slug}
              href={`/products/${product.slug}`}
              className="group flex items-center gap-4 py-5"
            >
              <span className="hidden w-8 font-mono text-xs text-muted sm:block">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-2">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  {product.categoryName}
                </p>
                <h3 className="mt-1 truncate font-display text-base font-semibold tracking-tight">
                  {product.name}
                </h3>
                <p className="mt-0.5 text-sm text-muted sm:hidden">
                  {formatIDR(product.price)}
                </p>
              </div>

              <p className="hidden text-xs text-muted sm:block">
                {dateFormatter.format(new Date(product.releasedAt))}
              </p>
              <p className="hidden w-32 text-right text-sm font-semibold md:block">
                {formatIDR(product.price)}
              </p>
              <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted transition-colors group-hover:border-accent-text/50 group-hover:text-accent-text"
              >
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pt-16 lg:pt-24">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
          {services.map((service, index) => (
            <div key={service.title} className="bg-bg p-6 sm:p-7">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-text">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-3 font-display text-lg font-semibold tracking-tight">
                {service.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">{service.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
