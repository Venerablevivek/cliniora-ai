import { eyebrowClass, sectionTitleClass } from "@/components/ui";
import { cn } from "@/lib/cn";

/** Eyebrow + heading with a gradient highlight + supporting copy. */
export function SectionHeading({
  eyebrow,
  lead,
  highlight,
  body,
  align = "center",
  className,
}: {
  eyebrow: string;
  lead: string;
  highlight: string;
  body?: string;
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-xl", className)}>
      <p className={eyebrowClass}>{eyebrow}</p>
      <h2 className={cn(sectionTitleClass, "mt-4 text-balance")}>
        {lead} <span className="text-brand-gradient">{highlight}</span>
      </h2>
      {body && <p className="mx-auto mt-4 max-w-2xl text-pretty text-[17px] leading-relaxed text-muted rtl:leading-loose">{body}</p>}
    </div>
  );
}
