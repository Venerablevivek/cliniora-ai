import { cn } from "@/lib/cn";

/** Hand-drawn style connector arrow. Mirrors automatically in RTL. */
export function CurvedArrow({ className, variant = "down" }: { className?: string; variant?: "down" | "up" }) {
  const d = variant === "down" ? "M6 6c2 22 18 34 44 34" : "M6 40c4-22 20-32 44-32";
  const head = variant === "down" ? "M42 33l9 7-9 6" : "M42 1l9 7-9 7";
  return (
    <svg
      viewBox="0 0 60 48"
      fill="none"
      aria-hidden
      className={cn("text-cyan/80 rtl:-scale-x-100", className)}
    >
      <path d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d={head} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Three short accent strokes, used as a small "spark" flourish. */
export function SparkMarks({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden className={cn("text-cyan", className)}>
      <path d="M20 4v9M6 13l6 5M34 13l-6 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Soft, translucent "glass" slabs that give the hero its depth. Purely decorative. */
export function GlassShapes({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute end-[-6%] top-[6%] h-[420px] w-[520px] rotate-[18deg] rounded-[72px] bg-[linear-gradient(135deg,rgb(191_219_254/0.75),rgb(165_243_252/0.35))] shadow-[inset_0_1px_0_rgb(255_255_255/0.9)] blur-[1px] rtl:-rotate-[18deg]" />
      <div className="absolute end-[28%] top-[2%] h-[260px] w-[300px] -rotate-[14deg] rounded-[60px] bg-[linear-gradient(160deg,rgb(219_234_254/0.9),rgb(186_230_253/0.25))] rtl:rotate-[14deg]" />
      <div className="absolute bottom-[8%] end-[34%] h-[200px] w-[240px] rotate-[24deg] rounded-[56px] bg-[linear-gradient(140deg,rgb(207_250_254/0.8),rgb(219_234_254/0.2))] rtl:-rotate-[24deg]" />
      <div className="absolute -start-24 top-[30%] h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgb(191_219_254/0.55),transparent_70%)]" />
    </div>
  );
}

/** Gentle curve that tucks the hero into the next (white) section. */
export function HeroWave({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      aria-hidden
      className={cn("block h-12 w-full text-surface sm:h-20 rtl:-scale-x-100", className)}
    >
      <path fill="currentColor" d="M0 80V36C240 70 480 6 760 22s460 52 680 8v50H0Z" />
    </svg>
  );
}

/** Small tinted square that holds an icon. */
export function IconTile({
  children,
  tone = "blue",
  className,
}: {
  children: React.ReactNode;
  tone?: "blue" | "mint" | "violet" | "pink" | "cyan";
  className?: string;
}) {
  const tones = {
    blue: "bg-primary-soft text-primary",
    mint: "bg-mint-soft text-mint",
    violet: "bg-violet-soft text-violet",
    pink: "bg-pink-soft text-pink",
    cyan: "bg-[#e6fbff] text-cyan",
  } as const;
  return (
    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tones[tone], className)}>
      {children}
    </span>
  );
}
