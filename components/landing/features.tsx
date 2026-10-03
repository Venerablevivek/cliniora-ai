"use client";

import { motion } from "framer-motion";

import { IconTile } from "@/components/decor";
import {
  ClockIcon,
  FileTextIcon,
  GlobeIcon,
  LockIcon,
  MessageIcon,
  ShareIcon,
  SparklesIcon,
} from "@/components/icons";
import { SectionHeading } from "@/components/landing/section-heading";
import { useI18n } from "@/components/language-provider";
import { cn } from "@/lib/cn";
import { messages } from "@/lib/i18n/messages";

function Card({
  className,
  index,
  children,
}: {
  className?: string;
  index: number;
  children: React.ReactNode;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-line bg-surface p-6 shadow-soft sm:p-7",
        className,
      )}
    >
      {children}
    </motion.article>
  );
}

function CardText({ title, body }: { title: string; body: string }) {
  return (
    <>
      <h3 className="mt-5 text-xl font-semibold tracking-tight text-ink rtl:tracking-normal">{title}</h3>
      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted rtl:leading-loose">{body}</p>
    </>
  );
}

export function Features() {
  const { t } = useI18n();
  const { features } = t;

  return (
    <section id="product" className="relative overflow-hidden bg-canvas">
      <div aria-hidden className="pointer-events-none absolute -end-40 top-20 size-[520px] rounded-full bg-[radial-gradient(circle,rgb(186_230_253/0.45),transparent_70%)]" />
      <div className="relative mx-auto max-w-[1200px] px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeading
          eyebrow={features.eyebrow}
          lead={features.titleLead}
          highlight={features.titleHighlight}
          body={features.body}
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {/* Timeline — wide */}
          <Card index={0} className="lg:col-span-2">
            <div className="grid items-center gap-6 sm:grid-cols-[1fr_minmax(0,300px)]">
              <div>
                <IconTile tone="blue">
                  <ClockIcon className="size-5" />
                </IconTile>
                <CardText title={features.timeline.title} body={features.timeline.body} />
              </div>
              <ol className="relative space-y-3 rounded-[22px] bg-[linear-gradient(150deg,#eef5ff,#ecfbff)] p-5">
                <span aria-hidden className="absolute bottom-8 start-[29px] top-8 w-px bg-primary/20" />
                {features.timeline.points.map((point, index) => (
                  <li key={point} className="relative flex items-center gap-3">
                    <span
                      className={cn(
                        "relative z-10 size-3 shrink-0 rounded-full ring-4 ring-white",
                        index === 2 ? "bg-cyan" : "bg-primary/60",
                      )}
                    />
                    <span className="glass flex-1 rounded-xl px-3 py-2 text-[12.5px] font-medium text-ink">{point}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Card>

          {/* Questions */}
          <Card index={1}>
            <IconTile tone="violet">
              <MessageIcon className="size-5" />
            </IconTile>
            <CardText title={features.questions.title} body={features.questions.body} />
            <div className="mt-5 space-y-2">
              {t.brief.questions.slice(0, 2).map((question) => (
                <p
                  key={question}
                  className="flex items-start gap-2 rounded-2xl rounded-ss-md bg-violet-soft px-3 py-2 text-[12.5px] leading-snug text-ink-soft"
                >
                  <SparklesIcon className="mt-0.5 size-3.5 shrink-0 text-violet" />
                  {question}
                </p>
              ))}
            </div>
          </Card>

          {/* Bilingual */}
          <Card index={2}>
            <IconTile tone="cyan">
              <GlobeIcon className="size-5" />
            </IconTile>
            <CardText title={features.bilingual.title} body={features.bilingual.body} />
            <div className="mt-5 grid grid-cols-2 gap-2">
              {(["en", "ar"] as const).map((lang) => (
                <div
                  key={lang}
                  lang={lang}
                  dir={lang === "ar" ? "rtl" : "ltr"}
                  className="rounded-2xl border border-line-soft bg-[linear-gradient(180deg,#fbfdff,#f3f8ff)] p-3 text-start"
                >
                  <span className="text-[10px] font-bold uppercase text-primary">{lang === "en" ? "EN" : "العربية"}</span>
                  <p className="mt-1 text-[13px] font-semibold text-ink">{messages[lang].brief.label}</p>
                  <span className="mt-2 block h-1.5 w-4/5 rounded-full bg-ink/10" />
                  <span className="mt-1.5 block h-1.5 w-3/5 rounded-full bg-ink/10" />
                </div>
              ))}
            </div>
          </Card>

          {/* Share — wide */}
          <Card index={3} className="lg:col-span-2">
            <div className="grid items-center gap-6 sm:grid-cols-[1fr_minmax(0,300px)]">
              <div>
                <IconTile tone="mint">
                  <ShareIcon className="size-5" />
                </IconTile>
                <CardText title={features.share.title} body={features.share.body} />
              </div>
              <div className="flex items-center justify-center gap-3 rounded-[22px] bg-[linear-gradient(150deg,#ecfdf8,#eef6ff)] px-5 py-8">
                {[FileTextIcon, ShareIcon, LockIcon].map((Icon, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {index > 0 && <span aria-hidden className="h-px w-6 border-t border-dashed border-mint/60" />}
                    <span
                      className={cn(
                        "flex items-center justify-center rounded-2xl shadow-soft",
                        index === 1 ? "size-16 bg-brand-gradient text-white shadow-cta" : "glass size-12 text-primary",
                      )}
                    >
                      <Icon className={index === 1 ? "size-7" : "size-5"} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
