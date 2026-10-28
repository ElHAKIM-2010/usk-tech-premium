import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { ProductCard } from "@/components/catalog/product-card";
import { PurchasePanel } from "@/components/product/purchase-panel";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { discountPercent, formatIDR } from "@/lib/format";
import { cn } from "@/lib/cn";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import {
  getOtherProducts,
  getProductBySlug,
  getRelatedProducts,
} from "@/db/catalog";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Produk tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const url = `/products/${product.slug}`;

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: SITE_NAME,
      url,
      title: product.name,
      description: product.description,
      images: [{ url: product.image, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const discount = discountPercent(product.price, product.compareAtPrice);
  const categoryName = product.categoryName;
  const inStock = product.stock > 0;

  const related = await getRelatedProducts(product.category, product.slug, 3);
  const recommendations = [...related];

  if (recommendations.length < 3) {
    const excluded = [product.slug, ...recommendations.map((item) => item.slug)];
    recommendations.push(
      ...(await getOtherProducts(excluded, 3 - recommendations.length)),
    );
  }

  const details = [
    { label: "Kategori", value: categoryName },
    { label: "Kode produk", value: product.slug },
    { label: "Tanggal rilis", value: product.releasedAt },
    { label: "Stok tercatat", value: `${product.stock} unit` },
  ];

  const productImage = product.image.startsWith("http")
    ? product.image
    : `${SITE_URL}${product.image}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [productImage],
    sku: product.slug,
    category: categoryName,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: "IDR",
      price: product.price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <div className="container-page py-8 lg:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <Link href="/" className="transition-colors hover:text-text">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/products" className="transition-colors hover:text-text">
          Katalog
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/products?category=${product.category}`}
          className="transition-colors hover:text-text"
        >
          {categoryName}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-text">
          {product.name}
        </span>
      </nav>

      <div className="mt-7 grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="animate-rise relative aspect-square overflow-hidden rounded-3xl border border-border bg-surface-2">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />

            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              {product.badge ? (
                <span className="rounded-md bg-bg/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text">
                  {product.badge}
                </span>
              ) : null}
              {discount > 0 ? (
                <span className="rounded-md bg-accent px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-accent-ink">
                  Hemat {discount}%
                </span>
              ) : null}
            </div>
          </div>

          <p className="mt-3 text-[11px] leading-5 text-muted">
            Foto ilustrasi. Warna dan detail aktual dapat berbeda.
          </p>
        </div>

        <div
          className="animate-rise"
          style={{ animationDelay: "90ms" }}
        >
          <p className="eyebrow">{categoryName}</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5 text-text">
              <Star className="size-3.5 fill-accent text-accent" aria-hidden="true" />
              {product.rating.toFixed(1)}
            </span>
            <span aria-hidden="true">·</span>
            <span>{product.reviewCount} ulasan</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className={cn("size-1.5 rounded-full", inStock ? "bg-accent" : "bg-danger")}
                aria-hidden="true"
              />
              {inStock ? `Tersedia · ${product.stock} unit` : "Stok habis"}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-3">
            <p className="font-display text-3xl font-semibold tracking-tight">
              {formatIDR(product.price)}
            </p>
            {product.compareAtPrice ? (
              <p className="pb-1 text-sm text-muted line-through">
                {formatIDR(product.compareAtPrice)}
              </p>
            ) : null}
          </div>

          <p className="mt-5 max-w-xl text-sm leading-7 text-muted">{product.description}</p>

          <PurchasePanel slug={product.slug} stock={product.stock} />

          <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
            {details.map((detail) => (
              <div key={detail.label} className="bg-bg px-4 py-3">
                <dt className="label-mono">{detail.label}</dt>
                <dd className="mt-1 break-words text-sm">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section className="mt-16 lg:mt-24">
        <Reveal>
          <SectionHeading
            eyebrow="Spesifikasi"
            title="Detail teknis."
            description="Informasi utama yang perlu kamu ketahui sebelum memilih."
          />

          <dl className="mt-6 overflow-hidden rounded-2xl border border-border">
            {product.specs.map((spec, index) => (
              <div
                key={spec.label}
                className={cn(
                  "grid grid-cols-[8rem_1fr] gap-4 px-5 py-3.5 text-sm sm:grid-cols-[12rem_1fr]",
                  index % 2 === 1 ? "bg-surface" : "bg-bg",
                  index > 0 && "border-t border-border",
                )}
              >
                <dt className="text-muted">{spec.label}</dt>
                <dd className="font-medium">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      <section className="mt-16 lg:mt-24">
        <Reveal>
          <SectionHeading
            eyebrow="Lanjut lihat"
            title="Produk terkait."
            action={{ href: `/products?category=${product.category}`, label: `Semua ${categoryName}` }}
          />
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {recommendations.map((item, index) => (
            <Reveal
              key={item.slug}
              delay={Math.min(index * 70, 210)}
              className="h-full"
            >
              <ProductCard product={item} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
