import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Category } from "@/types/catalog";

interface CategoryCardProps {
  category: Category;
  index: number;
  large?: boolean;
  className?: string;
}

export function CategoryCard({ category, index, large = false, className }: CategoryCardProps) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-border bg-surface-2 transition duration-300 hover:-translate-y-1 hover:border-accent-text/40",
        large ? "min-h-[22rem] lg:min-h-full" : "min-h-[13rem] lg:min-h-[13.5rem]",
        className,
      )}
    >
      <Image
        src={category.image}
        alt={category.name}
        fill
        sizes={large ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"}
        className="object-cover opacity-85 transition duration-700 group-hover:scale-[1.06] group-hover:opacity-100"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/0"
      />

      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
          {String(index + 1).padStart(2, "0")}
        </p>
        <h3 className={cn("mt-1.5 font-display font-semibold tracking-tight", large ? "text-2xl" : "text-lg")}>
          {category.name}
        </h3>
        <p className="mt-0.5 text-xs text-white/70">{category.tagline}</p>
      </div>
    </Link>
  );
}
