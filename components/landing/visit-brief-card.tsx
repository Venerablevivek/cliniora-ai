"use client";

import {
  BarsIcon,
  CalendarIcon,
  ClockIcon,
  PillIcon,
  ShieldCheckIcon,
  SignalIcon,
  SparklesIcon,
  StethoscopeIcon,
} from "@/components/icons";
import { useI18n } from "@/components/language-provider";
import { cn } from "@/lib/cn";
import { intlLocaleOf } from "@/lib/i18n/config";

const summaryIcons = [ClockIcon, BarsIcon, SignalIcon, PillIcon];

/** Static product preview: what a finished Clinora brief looks like. */
export function VisitBriefCard({ className }: { className?: string }) {
  const { t, locale } = useI18n();
  const { brief } = t;

  return (
    <article
      aria-label={brief.label}
      className={cn(
        "overflow-hidden rounded-[28px] border border-white bg-surface/95 shadow-float ring-1 ring-ink/[0.04]",
        className,
      )}
    >
      <header className="flex items-start gap-3 px-5 pb-4 pt-5 sm:px-6">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <CalendarIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-ink">{brief.label}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
            <StethoscopeIcon className="size-3.5 shrink-0" />
            <span>{brief.appointment}</span>
          </p>
        </div>
        <span className="hidden shrink-0 items-center gap-1 rounded-full bg-mint-soft px-2.5 py-1 text-[11px] font-semibold text-[#0f766e] min-[400px]:inline-flex">
          <SparklesIcon className="size-3.5" />
          {brief.aiGenerated}
        </span>
      </header>

      <div className="space-y-5 border-t border-line-soft px-5 py-5 sm:px-6">
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted rtl:tracking-normal">
            {brief.reasonLabel}
          </h3>
          <p className="mt-1.5 text-[15px] font-semibold leading-snug text-ink">{brief.reason}</p>
        </section>

        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted rtl:tracking-normal">
            {brief.summaryLabel}
          </h3>
          <dl className="mt-2.5 grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2">
            {brief.summary.map((item, index) => {
              const ItemIcon = summaryIcons[index];
              return (
                <div
                  key={item.term}
                  className="flex gap-2.5 rounded-2xl border border-line-soft bg-[linear-gradient(180deg,#fbfdff,#f5f9ff)] p-3"
                >
                  <ItemIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <dt className="text-[11px] font-medium text-muted">{item.term}</dt>
                    <dd className="mt-0.5 text-[13px] font-medium leading-snug text-ink">{item.detail}</dd>
                  </div>
                </div>
              );
            })}
          </dl>
        </section>

        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted rtl:tracking-normal">
            {brief.questionsLabel}
          </h3>
          <ol className="mt-2.5 space-y-2.5">
            {brief.questions.map((question, index) => (
              <li key={question} className="flex gap-2.5 text-[13.5px] leading-snug text-ink-soft">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-primary/30 text-[11px] font-semibold text-primary">
                  {(index + 1).toLocaleString(intlLocaleOf(locale))}
                </span>
                {question}
              </li>
            ))}
          </ol>
        </section>
      </div>

      <footer className="mx-3 mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[linear-gradient(90deg,#ecfdf8,#effaff)] px-4 py-3">
        <p className="flex items-center gap-2 text-xs font-medium text-ink-soft">
          <ShieldCheckIcon className="size-4 text-mint" />
          {brief.status}
        </p>
        <span className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-[11px] font-medium text-muted">
          {brief.notDiagnosis}
        </span>
      </footer>
    </article>
  );
}
