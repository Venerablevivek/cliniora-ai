"use client";

import { motion } from "framer-motion";

import { CurvedArrow } from "@/components/decor";
import { CheckIcon, ClipboardCheckIcon, PencilNoteIcon, ShareIcon, SparklesIcon } from "@/components/icons";
import { SectionHeading } from "@/components/landing/section-heading";
import { useI18n } from "@/components/language-provider";
import { intlLocaleOf } from "@/lib/i18n/config";

const stepIcons = [PencilNoteIcon, SparklesIcon, ClipboardCheckIcon];

export function HowItWorks() {
  const { t, locale } = useI18n();
  const { how } = t;
  const number = new Intl.NumberFormat(intlLocaleOf(locale), { minimumIntegerDigits: 2 });
  const demos = [<NoteDemo key="note" />, <OrganizeDemo key="organize" />, <ReadyDemo key="ready" />];

  return (
    <section id="how-it-works" className="bg-surface">
      <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-14 sm:px-6 lg:px-8 lg:pb-28">
        <SectionHeading eyebrow={how.eyebrow} lead={how.titleLead} highlight={how.titleHighlight} body={how.body} />

        <ol className="relative mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
          {how.steps.map((step, index) => {
            const StepIcon = stepIcons[index];
            return (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group relative"
              >
                {index > 0 && (
                  <CurvedArrow
                    variant="up"
                    className="absolute -start-9 top-20 hidden w-12 rotate-[-10deg] md:block rtl:rotate-[10deg]"
                  />
                )}
                <div className="h-full rounded-[28px] border border-line bg-[linear-gradient(180deg,#ffffff,#f8fbff)] p-3 shadow-soft transition-[box-shadow,translate] duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <div className="relative h-48 overflow-hidden rounded-[22px] bg-[linear-gradient(150deg,#eaf3ff_0%,#e9fbff_100%)] p-4">
                    <div aria-hidden className="absolute inset-0 bg-dots opacity-40" />
                    <div className="relative h-full">{demos[index]}</div>
                  </div>
                  <div className="px-3 pb-4 pt-5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-cta">
                        <StepIcon className="size-5" />
                      </span>
                      <span className="text-sm font-bold tabular-nums text-primary/60">{number.format(index + 1)}</span>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink rtl:tracking-normal">{step.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted rtl:leading-loose">{step.body}</p>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/** Step 1 — a patient's free-text note with extracted tags. */
function NoteDemo() {
  const { demo } = useI18n().t.how;
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <div className="glass rounded-2xl p-3.5">
        <p className="text-[12.5px] leading-relaxed text-ink-soft">
          {demo.note}
          <span className="ms-0.5 inline-block h-3.5 w-px translate-y-0.5 bg-primary motion-safe:animate-pulse" />
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {demo.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-white bg-white/80 px-2.5 py-1 text-[11px] font-medium text-primary shadow-sm">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Step 2 — AI sorting the note into sections. */
function OrganizeDemo() {
  const { demo } = useI18n().t.how;
  const widths = ["w-4/5", "w-3/5", "w-2/3"];
  return (
    <div className="flex h-full flex-col justify-center">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
        <SparklesIcon className="size-3.5 motion-safe:animate-pulse" />
        {demo.organizing}
      </p>
      <div className="mt-3 space-y-2">
        {demo.sections.map((section, index) => (
          <div key={section} className="glass flex items-center gap-2.5 rounded-xl px-3 py-2">
            <span className="size-2 shrink-0 rounded-full bg-brand-gradient" />
            <span className="w-28 shrink-0 truncate text-[11.5px] font-semibold text-ink">{section}</span>
            <span className={`h-1.5 rounded-full bg-primary/15 ${widths[index]}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Step 3 — the finished, reviewed brief. */
function ReadyDemo() {
  const { t } = useI18n();
  const { demo } = t.how;
  return (
    <div className="flex h-full items-center justify-center">
      <div className="glass w-full max-w-[220px] rounded-2xl p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-ink">{t.brief.label}</span>
          <span className="flex size-6 items-center justify-center rounded-full bg-mint text-white">
            <CheckIcon className="size-3.5" strokeWidth={2.5} />
          </span>
        </div>
        <div className="mt-3 space-y-1.5">
          <span className="block h-1.5 w-full rounded-full bg-ink/10" />
          <span className="block h-1.5 w-4/5 rounded-full bg-ink/10" />
          <span className="block h-1.5 w-3/5 rounded-full bg-ink/10" />
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-line-soft pt-2.5">
          <span className="text-[11px] font-semibold text-mint">{demo.ready}</span>
          <ShareIcon className="size-3.5 text-primary" />
        </div>
        <p className="mt-1 text-[10.5px] text-muted">{demo.readyMeta}</p>
      </div>
    </div>
  );
}
