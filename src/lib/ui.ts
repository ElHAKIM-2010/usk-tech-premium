import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-accent/90",
  secondary:
    "border border-border bg-transparent text-text hover:border-accent-text/50 hover:text-accent-text",
  ghost: "text-muted hover:bg-surface-2 hover:text-text",
  danger: "bg-danger/10 text-danger hover:bg-danger/15",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3.5 text-sm",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra?: string,
) {
  return cn(base, variants[variant], sizes[size], extra);
}
