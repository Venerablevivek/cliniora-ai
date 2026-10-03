"use client";

import { IconTile } from "@/components/decor";
import { HeartIcon, LockIcon, ShieldCheckIcon } from "@/components/icons";
import { WaitlistForm } from "@/components/landing/waitlist-form";
import { useI18n } from "@/components/language-provider";
import { eyebrowClass, sectionTitleClass } from "@/components/ui";
import { cn } from "@/lib/cn";

const privacyIcons = [
  { Icon: LockIcon, tone: "mint" },
  { Icon: ShieldCheckIcon, tone: "blue" },
  { Icon: HeartIcon, tone: "violet" },
] as const;

export function WaitlistSection() {
  const { t } = useI18n();
  const copy = t.waitlist;

  return (
    <section id="waitlist" className="bg-surface px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[36px] border border-white bg-hero p-6 shadow-lift ring-1 ring-primary/10 sm:p-10 lg:p-14">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -end-24 -top-24 h-[340px] w-[420px] rotate-[18deg] rounded-[72px] bg-[linear-gradient(135deg,rgb(191_219_254/0.7),rgb(165_243_252/0.3))] rtl:-rotate-[18deg]" />
          <div className="absolute -bottom-28 end-[30%] h-[240px] w-[280px] -rotate-[14deg] rounded-[60px] bg-[linear-gradient(160deg,rgb(207_250_254/0.8),rgb(219_234_254/0.2))] rtl:rotate-[14deg]" />
        </div>

        <div className="relative grid gap-12 lg:grid-cols-[1fr_minmax(0,460px)] lg:gap-16">
          <div className="flex flex-col">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#0f766e] backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inset-0 rounded-full bg-mint opacity-50 motion-safe:animate-ping" />
                <span className="relative size-2 rounded-full bg-mint" />
              </span>
              {copy.badge}
            </span>
            <p className={cn(eyebrowClass, "mt-6")}>{copy.eyebrow}</p>
            <h2 className={cn(sectionTitleClass, "mt-3")}>
              {copy.titleLead} <span className="text-brand-gradient">{copy.titleHighlight}</span>
            </h2>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-muted rtl:leading-loose">{copy.body}</p>

            <div id="privacy" className="mt-10 lg:mt-auto lg:pt-10">
              <h3 className="text-sm font-semibold text-ink">{copy.privacyTitle}</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {copy.privacyPoints.map((point, index) => {
                  const { Icon, tone } = privacyIcons[index];
                  return (
                    <li key={point.title} className="glass rounded-2xl p-4">
                      <IconTile tone={tone} className="size-9 rounded-[10px]">
                        <Icon className="size-[18px]" />
                      </IconTile>
                      <p className="mt-3 text-[14px] font-semibold text-ink">{point.title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted">{point.body}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="glass self-start rounded-[28px] p-6 sm:p-8">
            <WaitlistForm />
          </div>
        </div>
      </div>
    </section>
  );
}
