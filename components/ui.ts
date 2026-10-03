import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg" | "xl";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[background-color,box-shadow,color,transform] duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-brand-gradient text-white shadow-cta hover:shadow-[0_12px_24px_-12px_rgb(37_99_235/0.8)]",
  secondary:
    "border border-line bg-surface text-ink shadow-[0_1px_2px_rgb(15_23_42/0.04)] hover:border-primary/30 hover:text-primary",
  ghost: "text-ink-soft hover:bg-line-soft hover:text-ink",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
  xl: "h-14 px-7 text-base",
};

/** Shared button styles for both <button> and <Link>/<a>. */
export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export const eyebrowClass =
  "inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-primary rtl:normal-case rtl:tracking-normal";

/** Section heading sizes shared across the landing page. */
export const sectionTitleClass =
  "text-3xl font-bold tracking-[-0.03em] text-ink sm:text-[2.6rem] sm:leading-[1.12] rtl:leading-snug rtl:tracking-normal";
