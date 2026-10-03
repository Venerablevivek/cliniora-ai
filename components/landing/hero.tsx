"use client";

import { motion, type Variants } from "framer-motion";

import { CurvedArrow, GlassShapes, HeroWave, IconTile, SparkMarks } from "@/components/decor";
import {
  ArrowForwardIcon,
  FileTextIcon,
  GlobeIcon,
  HeartFilledIcon,
  HeartIcon,
  ListIcon,
  LockIcon,
  MessageIcon,
  PlayIcon,
  ShareIcon,
  SparklesIcon,
  StethoscopeIcon,
  UsersIcon,
} from "@/components/icons";
import { VisitBriefCard } from "@/components/landing/visit-brief-card";
import { useI18n } from "@/components/language-provider";
import { buttonClass } from "@/components/ui";
import { cn } from "@/lib/cn";

const ease = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

const trustIcons = [
  { Icon: LockIcon, tone: "mint" },
  { Icon: HeartIcon, tone: "pink" },
  { Icon: GlobeIcon, tone: "blue" },
  { Icon: FileTextIcon, tone: "violet" },
] as const;

export function Hero() {
  const { t } = useI18n();
  const { hero } = t;

  return (
    <section className="relative overflow-hidden bg-hero">
      <GlassShapes className="hidden md:block" />

      <div className="relative mx-auto grid max-w-[1280px] items-center gap-14 px-4 pb-6 pt-[112px] sm:px-6 md:pt-[128px] lg:px-8 xl:grid-cols-[minmax(0,1fr)_680px] xl:gap-6 xl:pb-10 xl:pt-[136px]">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl">
          <motion.p
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-primary shadow-[0_1px_2px_rgb(15_23_42/0.05)] backdrop-blur rtl:text-[13px] rtl:normal-case rtl:tracking-normal"
          >
            <SparklesIcon className="size-4" />
            {hero.eyebrow}
          </motion.p>

          <motion.h1
            variants={item}
            className="mt-6 text-[2.6rem] font-bold leading-[1.04] tracking-[-0.035em] text-ink sm:text-6xl xl:text-[4.1rem] rtl:text-[2.3rem] rtl:leading-[1.3] rtl:tracking-normal rtl:sm:text-[3.4rem] rtl:xl:text-[3.5rem]"
          >
            {hero.titleLead}{" "}
            <span className="text-brand-gradient block pb-1">{hero.titleHighlight}</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-5 max-w-xl text-lg leading-relaxed text-muted rtl:leading-loose"
          >
            {hero.body}
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#waitlist" className={buttonClass("primary", "xl", "w-full sm:w-auto")}>
              {hero.primaryCta}
              <ArrowForwardIcon className="size-[18px] rtl:-scale-x-100" />
            </a>
            <a href="#how-it-works" className={buttonClass("secondary", "xl", "w-full ps-2.5 sm:w-auto")}>
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-white shadow-cta">
                <PlayIcon className="size-4 translate-x-px rtl:-scale-x-100" />
              </span>
              {hero.secondaryCta}
            </a>
          </motion.div>

          <motion.ul variants={item} className="mt-10 grid grid-cols-2 gap-x-4 gap-y-5 sm:flex sm:flex-wrap sm:gap-x-5">
            {hero.trust.map((entry, index) => {
              const { Icon, tone } = trustIcons[index];
              return (
                <li key={entry.title} className="flex items-center gap-2.5">
                  <IconTile tone={tone} className="size-8 rounded-[10px]">
                    <Icon className="size-4" />
                  </IconTile>
                  <span className="text-[12.5px] leading-tight text-ink-soft">
                    <span className="block font-semibold text-ink">{entry.title}</span>
                    {entry.detail}
                  </span>
                </li>
              );
            })}
          </motion.ul>
        </motion.div>

        <HeroComposition />
      </div>

      <HeroWave />
    </section>
  );
}

/** Satellite card that pops in after the brief, with an optional gentle float. */
function Satellite({
  className,
  delay,
  float,
  children,
}: {
  className?: string;
  delay: number;
  float?: "slow" | "normal";
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease }}
      className={cn("absolute hidden md:block", className)}
    >
      <div
        className={cn(
          float === "slow" && "motion-safe:animate-float-slow",
          float === "normal" && "motion-safe:animate-float",
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}

function HeroComposition() {
  const { t } = useI18n();
  const f = t.hero.floating;
  const inputIcons = [
    { Icon: FileTextIcon, tone: "blue" },
    { Icon: MessageIcon, tone: "cyan" },
    { Icon: ListIcon, tone: "violet" },
  ] as const;

  return (
    <div className="relative mx-auto w-full max-w-[460px] md:h-[640px] md:max-w-none md:w-[680px]">
      {/* Decorative flourishes */}
      <StethoscopeIcon
        aria-hidden
        className="absolute -end-2 -top-4 hidden size-28 rotate-12 text-primary/15 md:block rtl:-rotate-12"
        strokeWidth={1.25}
      />
      <SparkMarks className="absolute start-[132px] top-2 hidden size-9 -rotate-12 md:block" />
      <SparkMarks className="absolute end-[150px] top-0 hidden size-8 rotate-[20deg] md:block" />

      {/* The product preview */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15, ease }}
        className="relative md:absolute md:start-[128px] md:top-12 md:w-[404px]"
      >
        <VisitBriefCard className="md:-rotate-[1.5deg] md:rtl:rotate-[1.5deg]" />
      </motion.div>

      {/* Start side: inputs flowing into the brief */}
      <Satellite className="-start-2 top-[72px] w-[158px]" delay={0.4} float="slow">
        <div className="glass -rotate-[4deg] rounded-[20px] p-4 rtl:rotate-[4deg]">
          <SparklesIcon className="size-6 text-primary" />
          <p className="mt-2 text-[13px] font-semibold leading-snug text-ink">{f.notes}</p>
        </div>
      </Satellite>
      <CurvedArrow className="absolute start-[58px] top-[200px] hidden w-16 md:block" />

      <Satellite className="-start-2 top-[290px] w-[158px]" delay={0.5}>
        <ul className="glass -rotate-[3deg] space-y-2.5 rounded-[20px] p-3.5 rtl:rotate-[3deg]">
          {f.inputs.map((label, index) => {
            const { Icon, tone } = inputIcons[index];
            return (
              <li key={label} className="flex items-center gap-2.5 text-[13px] font-medium text-ink">
                <IconTile tone={tone} className="size-8 rounded-[10px]">
                  <Icon className="size-4" />
                </IconTile>
                {label}
              </li>
            );
          })}
        </ul>
      </Satellite>
      <CurvedArrow variant="up" className="absolute start-[64px] top-[448px] hidden w-16 md:block" />

      <Satellite className="start-2 top-[516px]" delay={0.6} float="normal">
        <div className="flex size-[112px] -rotate-[8deg] items-center justify-center rounded-[30px] border border-white/80 bg-[linear-gradient(145deg,rgb(224_242_254/0.95),rgb(165_243_252/0.6))] shadow-float backdrop-blur rtl:rotate-[8deg]">
          <div className="flex size-[68px] items-center justify-center rounded-[22px] bg-white/70 shadow-[inset_0_1px_0_white]">
            <HeartFilledIcon className="size-9 text-cyan drop-shadow-[0_4px_8px_rgb(6_182_212/0.45)]" />
          </div>
        </div>
      </Satellite>

      {/* End side: what you get */}
      <Satellite className="-end-8 top-[112px] w-[188px]" delay={0.55} float="slow">
        <EndCard icon={<ShareIcon className="size-[18px]" />} title={f.shareTitle} body={f.shareBody} tilt="rotate-[3deg] rtl:-rotate-[3deg]" />
      </Satellite>
      <Satellite className="-end-10 top-[296px] w-[188px]" delay={0.65}>
        <EndCard icon={<GlobeIcon className="size-[18px]" />} title={f.bilingualTitle} body={f.bilingualBody} tilt="-rotate-[2deg] rtl:rotate-[2deg]" />
      </Satellite>
      <Satellite className="-end-6 top-[476px] w-[188px]" delay={0.75} float="normal">
        <EndCard icon={<UsersIcon className="size-[18px]" />} title={f.peopleTitle} body={f.peopleBody} tilt="rotate-[4deg] rtl:-rotate-[4deg]" />
      </Satellite>
    </div>
  );
}

function EndCard({
  icon,
  title,
  body,
  tilt,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  tilt: string;
}) {
  return (
    <div className={cn("glass rounded-[20px] p-4", tilt)}>
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-cta">
          {icon}
        </span>
        <p className="text-[13.5px] font-semibold leading-tight text-ink">{title}</p>
      </div>
      <p className="mt-2 text-[12.5px] leading-snug text-muted">{body}</p>
    </div>
  );
}
