import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
}

export function Pagination({ page, totalPages, hrefForPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Navigasi halaman"
      className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-xs text-muted">
        Halaman {page} dari {totalPages}
      </p>

      <div className="flex items-center gap-1">
        {page > 1 ? (
          <Link
            href={hrefForPage(page - 1)}
            aria-label="Halaman sebelumnya"
            className="grid size-10 place-items-center rounded-full border border-border text-muted transition-colors hover:border-text/30 hover:text-text"
          >
            <ChevronLeft className="size-4" />
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="grid size-10 place-items-center rounded-full border border-border text-muted opacity-40"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </span>
        )}

        {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
          <Link
            key={number}
            href={hrefForPage(number)}
            aria-label={`Halaman ${number}`}
            aria-current={number === page ? "page" : undefined}
            className={cn(
              "grid size-10 place-items-center rounded-full text-sm font-medium transition-colors",
              number === page
                ? "bg-accent text-accent-ink"
                : "border border-border text-muted hover:border-text/30 hover:text-text",
            )}
          >
            {number}
          </Link>
        ))}

        {page < totalPages ? (
          <Link
            href={hrefForPage(page + 1)}
            aria-label="Halaman berikutnya"
            className="grid size-10 place-items-center rounded-full border border-border text-muted transition-colors hover:border-text/30 hover:text-text"
          >
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="grid size-10 place-items-center rounded-full border border-border text-muted opacity-40"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
}
