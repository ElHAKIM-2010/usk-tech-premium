import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: {
    href: string;
    label: string;
  };
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-accent-text transition hover:opacity-75"
        >
          {action.label}
          <ArrowUpRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}
