"use client";

import { SignOutButton, useClerk } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";

import { IconTile } from "@/components/decor";
import { useAccount, type AccountState } from "@/components/dashboard/use-account";
import {
  AlertIcon,
  CalendarIcon,
  CheckIcon,
  ClipboardCheckIcon,
  CodeIcon,
  DatabaseIcon,
  LayersIcon,
  LockIcon,
  LogOutIcon,
  MailIcon,
  PlusIcon,
  RefreshIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@/components/icons";
import { useI18n } from "@/components/language-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { Logo } from "@/components/logo";
import { buttonClass } from "@/components/ui";
import type { MeResponse } from "@/lib/api-types";
import { cn } from "@/lib/cn";
import { intlLocaleOf } from "@/lib/i18n/config";
import { format } from "@/lib/i18n/messages";

const ease = [0.22, 1, 0.36, 1] as const;
const DAY_MS = 24 * 60 * 60 * 1000;

function rise(delay: number) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease },
  };
}

function Skeleton({ className }: { className?: string }) {
  return <span className={cn("block animate-pulse rounded-lg bg-line-soft", className)} />;
}

export function DashboardView() {
  const { state, retry, refresh } = useAccount();
  const user = state.kind === "ready" ? state.user : null;
  const loadedAt = state.kind === "ready" ? state.loadedAt : 0;

  return (
    <div className="flex min-h-dvh flex-col bg-hero">
      <DashboardHeader user={user} />
      <main id="main" className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <WelcomeBanner user={user} now={loadedAt} />
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <NextBriefCard />
            <GettingStartedCard />
          </div>
          <div className="space-y-6">
            <AccountCard state={state} onRetry={retry} />
            <RawResponseCard state={state} onRefresh={refresh} />
            <PrivacyCard />
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardHeader({ user }: { user: MeResponse | null }) {
  const { t } = useI18n();
  const copy = t.dashboard;

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav aria-label={copy.overview} className="hidden flex-1 md:block">
          <ul className="flex items-center gap-1 ps-6 text-sm font-medium">
            <li>
              <span aria-current="page" className="inline-flex h-9 items-center rounded-full bg-primary-soft px-4 text-primary">
                {copy.overview}
              </span>
            </li>
            <li>
              <span className="inline-flex h-9 items-center gap-2 rounded-full px-4 text-muted">
                {copy.briefs}
                <span className="rounded-full bg-line-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted rtl:normal-case">
                  {copy.soon}
                </span>
              </span>
            </li>
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-2 md:ms-0">
          <LanguageToggle />
          <div className="flex items-center gap-2 rounded-full border border-line bg-surface p-1 ps-1 shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
            <Avatar email={user?.email} className="size-8 text-sm" />
            {user && (
              <bdi dir="ltr" className="hidden max-w-[180px] truncate text-[13px] font-medium text-ink-soft lg:block">
                {user.email}
              </bdi>
            )}
            <SignOutButton redirectUrl="/">
              <button
                type="button"
                aria-label={copy.signOut}
                title={copy.signOut}
                className="flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger-soft hover:text-danger"
              >
                <LogOutIcon className="size-4 rtl:-scale-x-100" />
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </header>
  );
}

/** Initial from the Postgres email — never from Clerk's session. */
function Avatar({ email, className }: { email?: string; className?: string }) {
  return (
    <span
      aria-hidden
      lang="en"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand-gradient font-semibold uppercase text-white",
        className,
      )}
    >
      {email ? email.charAt(0) : ""}
    </span>
  );
}

function WelcomeBanner({ user, now }: { user: MeResponse | null; now: number }) {
  const { t, locale } = useI18n();
  const copy = t.dashboard;

  let tenure: string | null = null;
  if (user) {
    const days = Math.floor((now - new Date(user.signedUpAt).getTime()) / DAY_MS);
    const n = new Intl.NumberFormat(intlLocaleOf(locale)).format(days);
    tenure = days < 1 ? copy.joinedToday : days === 1 ? copy.memberDay : format(copy.memberDays, { days: n });
  }

  return (
    <motion.section
      {...rise(0)}
      className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(120deg,#1d4ed8_0%,#2563eb_45%,#0ea5e9_80%,#06b6d4_100%)] p-6 text-white shadow-lift sm:p-10"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -end-16 -top-20 h-[300px] w-[360px] rotate-[18deg] rounded-[64px] bg-white/10 rtl:-rotate-[18deg]" />
        <div className="absolute -bottom-24 end-[22%] h-[220px] w-[260px] -rotate-[12deg] rounded-[56px] bg-white/10 rtl:rotate-[12deg]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.18)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(90deg,transparent,black)] rtl:[mask-image:linear-gradient(-90deg,transparent,black)]" />
      </div>

      <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/25 backdrop-blur">
            <SparklesIcon className="size-3.5" />
            {copy.memberBadge}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl rtl:leading-snug rtl:tracking-normal">
            {copy.greeting}
          </h1>
          <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-white/80">{copy.greetingBody}</p>
          <div className="mt-5 flex min-h-8 flex-wrap items-center gap-2">
            {user ? (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-primary">
                  <CalendarIcon className="size-3.5" />
                  {tenure}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium ring-1 ring-white/25">
                  <DatabaseIcon className="size-3.5" />
                  {copy.source}
                </span>
              </>
            ) : (
              <span className="block h-7 w-40 animate-pulse rounded-full bg-white/20" />
            )}
          </div>
        </div>

        {/* Decorative mini brief */}
        <div aria-hidden className="hidden w-[250px] rotate-[3deg] rounded-[22px] bg-white/95 p-4 text-ink shadow-float md:block rtl:-rotate-[3deg]">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <ClipboardCheckIcon className="size-[18px]" />
            </span>
            <div>
              <p className="text-[13px] font-semibold">{t.brief.label}</p>
              <p className="text-[11px] text-muted">{copy.soon}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <span className="block h-2 w-full rounded-full bg-ink/10" />
            <span className="block h-2 w-4/5 rounded-full bg-ink/10" />
            <span className="block h-2 w-3/5 rounded-full bg-ink/10" />
          </div>
          <div className="mt-4 flex items-center gap-1.5 rounded-xl bg-mint-soft px-2.5 py-2 text-[11px] font-medium text-[#0f766e]">
            <ShieldCheckIcon className="size-3.5" />
            {t.brief.notDiagnosis}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function NextBriefCard() {
  const { t } = useI18n();
  const copy = t.dashboard.nextBrief;

  return (
    <motion.section {...rise(0.08)} className="relative overflow-hidden rounded-[28px] border border-line bg-surface p-6 shadow-soft sm:p-8">
      <div className="grid items-center gap-8 sm:grid-cols-[1fr_minmax(0,240px)]">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary rtl:normal-case rtl:tracking-normal">
            {copy.eyebrow}
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink rtl:tracking-normal">{copy.title}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted rtl:leading-loose">{copy.body}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" disabled className={buttonClass("primary", "lg")}>
              <PlusIcon className="size-[18px]" />
              {copy.cta}
            </button>
            <span className="rounded-full bg-line-soft px-3 py-1 text-xs font-semibold text-muted">{t.common.comingSoon}</span>
          </div>
        </div>

        <div aria-hidden className="relative h-[200px] rounded-[22px] bg-[linear-gradient(150deg,#eaf3ff,#e9fbff)] p-4">
          <div className="absolute inset-0 rounded-[22px] bg-dots opacity-40" />
          <div className="glass relative mx-auto mt-3 w-[85%] -rotate-[3deg] rounded-2xl p-3 rtl:rotate-[3deg]">
            <p className="text-[11px] font-semibold text-muted">{t.brief.reasonLabel}</p>
            <span className="mt-2 block h-1.5 w-11/12 rounded-full bg-ink/10" />
            <span className="mt-1.5 block h-1.5 w-2/3 rounded-full bg-ink/10" />
          </div>
          <div className="glass relative mx-auto mt-3 w-[85%] rotate-[2deg] rounded-2xl p-3 rtl:-rotate-[2deg]">
            <p className="text-[11px] font-semibold text-muted">{t.brief.questionsLabel}</p>
            <span className="mt-2 block h-1.5 w-4/5 rounded-full bg-primary/20" />
            <span className="mt-1.5 block h-1.5 w-3/5 rounded-full bg-primary/20" />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function GettingStartedCard() {
  const { t, locale } = useI18n();
  const copy = t.dashboard.steps;
  const done = 1;
  const total = copy.items.length;
  const n = new Intl.NumberFormat(intlLocaleOf(locale));

  return (
    <motion.section {...rise(0.14)} className="rounded-[28px] border border-line bg-surface p-6 shadow-soft sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">{copy.title}</h2>
        <span className="text-sm font-medium text-muted">
          {format(copy.progress, { done: n.format(done), total: n.format(total) })}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        className="mt-4 h-2 overflow-hidden rounded-full bg-line-soft"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(done / total) * 100}%` }}
          transition={{ duration: 0.8, delay: 0.3, ease }}
          className="h-full rounded-full bg-brand-gradient"
        />
      </div>

      <ol className="mt-6 grid gap-3 sm:grid-cols-3">
        {copy.items.map((step, index) => {
          const complete = index < done;
          return (
            <li
              key={step.title}
              className={cn(
                "rounded-2xl border p-4",
                complete ? "border-mint/30 bg-mint-soft/60" : "border-line-soft bg-canvas",
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-sm font-semibold",
                  complete ? "bg-mint text-white" : "border border-line bg-surface text-muted",
                )}
              >
                {complete ? <CheckIcon className="size-4" strokeWidth={2.5} /> : n.format(index + 1)}
              </span>
              <p className="mt-3 text-[14px] font-semibold text-ink">{step.title}</p>
              <p className="mt-1 text-[13px] leading-snug text-muted">{step.body}</p>
            </li>
          );
        })}
      </ol>
    </motion.section>
  );
}

function AccountCard({ state, onRetry }: { state: AccountState; onRetry: () => void }) {
  const { t, locale } = useI18n();
  const { openUserProfile } = useClerk();
  const copy = t.dashboard;

  if (state.kind === "error") {
    return (
      <motion.section {...rise(0.1)} role="alert" className="rounded-[28px] border border-line bg-surface p-6 text-center shadow-soft sm:p-8">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger">
          <AlertIcon className="size-6" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-ink">{copy.errorTitle}</h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{copy.errorBody}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={onRetry} className={buttonClass("primary", "md")}>
            {copy.retry}
          </button>
          <SignOutButton redirectUrl="/">
            <button type="button" className={buttonClass("secondary", "md")}>
              {copy.signOut}
            </button>
          </SignOutButton>
        </div>
      </motion.section>
    );
  }

  const user = state.kind === "ready" ? state.user : null;
  const signedUp = user
    ? new Intl.DateTimeFormat(intlLocaleOf(locale), { dateStyle: "long", timeStyle: "short" }).format(
        new Date(user.signedUpAt),
      )
    : null;

  return (
    <motion.section {...rise(0.1)} aria-busy={!user} className="overflow-hidden rounded-[28px] border border-line bg-surface shadow-soft">
      <div className="flex items-center gap-4 border-b border-line-soft bg-[linear-gradient(140deg,#f3f8ff,#effbff)] p-6">
        {user ? (
          <Avatar email={user.email} className="size-14 text-xl shadow-cta" />
        ) : (
          <Skeleton className="size-14 rounded-full" />
        )}
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-ink">{copy.cardTitle}</h2>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-mint-soft px-2.5 py-0.5 text-[11px] font-semibold text-[#0f766e]">
            <DatabaseIcon className="size-3.5" />
            {copy.source}
          </span>
        </div>
      </div>

      <dl className="divide-y divide-line-soft px-6">
        <Row icon={<MailIcon className="size-[18px]" />} label={copy.emailLabel}>
          {user ? (
            <bdi dir="ltr" className="break-all">
              {user.email}
            </bdi>
          ) : (
            <Skeleton className="mt-1 h-4 w-44" />
          )}
        </Row>
        <Row icon={<CalendarIcon className="size-[18px]" />} label={copy.signedUpLabel}>
          {user ? <time dateTime={user.signedUpAt}>{signedUp}</time> : <Skeleton className="mt-1 h-4 w-36" />}
        </Row>
        <Row icon={<ShieldCheckIcon className="size-[18px]" />} label={copy.statusLabel}>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-mint" />
            {copy.statusActive}
          </span>
        </Row>
        <Row icon={<LayersIcon className="size-[18px]" />} label={copy.sourceLabel}>
          {copy.sourceValue}
        </Row>
      </dl>

      <div className="border-t border-line-soft p-4">
        {state.kind === "syncing" || state.kind === "loading" ? (
          <p role="status" className="px-2 py-1.5 text-[13px] leading-relaxed text-muted">
            {state.kind === "syncing" ? (
              <>
                <span className="font-semibold text-ink">{copy.syncingTitle}</span> — {copy.syncingBody}
              </>
            ) : (
              copy.loading
            )}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => openUserProfile()} className={buttonClass("secondary", "md", "px-3")}>
              <SettingsIcon className="size-4" />
              {copy.manageAccount}
            </button>
            <SignOutButton redirectUrl="/">
              <button type="button" className={buttonClass("secondary", "md", "px-3")}>
                <LogOutIcon className="size-4 rtl:-scale-x-100" />
                {copy.signOut}
              </button>
            </SignOutButton>
          </div>
        )}
      </div>
    </motion.section>
  );
}

/** Shows the exact `/api/me` payload so reviewers can verify where the data comes from. */
function RawResponseCard({ state, onRefresh }: { state: AccountState; onRefresh: () => void }) {
  const { t, locale } = useI18n();
  const copy = t.dashboard.raw;
  if (state.kind !== "ready") return null;

  const time = new Intl.DateTimeFormat(intlLocaleOf(locale), { timeStyle: "medium" }).format(state.loadedAt);

  return (
    <motion.section {...rise(0.14)} className="overflow-hidden rounded-[28px] border border-line bg-surface shadow-soft">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-3 p-5 [&::-webkit-details-marker]:hidden">
          <IconTile tone="violet" className="size-9 rounded-[10px]">
            <CodeIcon className="size-[18px]" />
          </IconTile>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold text-ink">{copy.title}</h2>
            <p className="text-xs text-muted">
              <code dir="ltr" className="font-mono">GET /api/me</code> · 200
            </p>
          </div>
          <span aria-hidden className="text-muted transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <div className="border-t border-line-soft px-5 pb-5 pt-4">
          <p className="text-[13px] leading-relaxed text-muted">{copy.body}</p>
          <pre
            dir="ltr"
            className="mt-3 overflow-x-auto rounded-2xl bg-ink p-4 text-start font-mono text-[12px] leading-relaxed text-[#c7e3ff]"
          >
            {JSON.stringify(state.user, null, 2)}
          </pre>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted">
            <span>{format(copy.fetchedAt, { time })}</span>
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold text-primary hover:bg-primary-soft"
            >
              <RefreshIcon className="size-3.5" />
              {copy.refresh}
            </button>
          </div>
        </div>
      </details>
    </motion.section>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3.5 py-4">
      <IconTile tone="blue" className="size-9 rounded-[10px]">
        {icon}
      </IconTile>
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium text-muted">{label}</dt>
        <dd className="mt-0.5 text-[14.5px] font-medium text-ink">{children}</dd>
      </div>
    </div>
  );
}

function PrivacyCard() {
  const { t } = useI18n();
  const copy = t.dashboard;
  return (
    <motion.section {...rise(0.18)} className="rounded-[28px] border border-line bg-surface p-6 shadow-soft">
      <IconTile tone="mint">
        <LockIcon className="size-5" />
      </IconTile>
      <h2 className="mt-4 text-base font-semibold text-ink">{copy.privacy.title}</h2>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted rtl:leading-loose">{copy.privacy.body}</p>
      <Link href="/" className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">
        {copy.backHome}
      </Link>
    </motion.section>
  );
}
