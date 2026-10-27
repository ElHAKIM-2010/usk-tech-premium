import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { discountPercent, formatIDR } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/catalog";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  className?: string;
}

export function ProductCard({ product, priority = false, className }: ProductCardProps) {
  const discount = discountPercent(product.price, product.compareAtPrice);

  return (
    <Link
      href={`/products/${product.slug}`}
      aria-label={`${product.name} — ${formatIDR(product.price)}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition duration-300 hover:-translate-y-1 hover:border-accent-text/40",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-surface-2">
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.badge ? (
            <span className="rounded-md bg-bg/90 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-text">
              {product.badge}
            </span>
          ) : null}
          {discount > 0 ? (
            <span className="rounded-md bg-accent px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-accent-ink">
              −{discount}%
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          <span>{product.categoryName}</span>
          <span className="inline-flex items-center gap-1 text-text">
            <Star className="size-3 fill-accent text-accent" aria-hidden="true" />
            {product.rating.toFixed(1)}
          </span>
        </div>

        <h3 className="mt-2 font-display text-base font-semibold leading-snug tracking-tight">
          {product.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted">{product.description}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-sm font-semibold">{formatIDR(product.price)}</p>
            {product.compareAtPrice ? (
              <p className="mt-0.5 text-[11px] text-muted line-through">
                {formatIDR(product.compareAtPrice)}
              </p>
            ) : null}
          </div>
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted transition-colors group-hover:border-accent-text/50 group-hover:text-accent-text"
          >
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
