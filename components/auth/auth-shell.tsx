"use client";

import { ClerkLoading } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";

import { GlassShapes, IconTile } from "@/components/decor";
import { ArrowBackIcon, DatabaseIcon, GlobeIcon, LockIcon } from "@/components/icons";
import { useI18n } from "@/components/language-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { Logo } from "@/components/logo";

type AuthShellProps = {
  mode: "sign-in" | "sign-up";
  children: React.ReactNode;
};

const pointIcons = [
  { Icon: LockIcon, tone: "mint" },
  { Icon: DatabaseIcon, tone: "blue" },
  { Icon: GlobeIcon, tone: "violet" },
] as const;

/** Branded frame around Clerk's pre-built <SignIn /> / <SignUp /> components. */
export function AuthShell({ mode, children }: AuthShellProps) {
  const { t } = useI18n();
  const copy = t.auth;
  const title = mode === "sign-up" ? copy.signUpTitle : copy.signInTitle;
  const body = mode === "sign-up" ? copy.signUpBody : copy.signInBody;

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-hero">
      <GlassShapes className="hidden lg:block" />

      <header className="relative mx-auto flex h-[72px] w-full max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Logo />
        <LanguageToggle />
      </header>

      <main
        id="main"
        className="relative mx-auto grid w-full max-w-[1200px] flex-1 items-center gap-12 px-4 pb-16 pt-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:gap-16 lg:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-lg"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white/70 px-3 py-1.5 text-sm font-medium text-muted backdrop-blur transition-colors hover:text-primary"
          >
            <ArrowBackIcon className="size-4 rtl:-scale-x-100" />
            {copy.backHome}
          </Link>
          <h1 className="mt-6 text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl rtl:leading-snug rtl:tracking-normal">
            {title}
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-muted">{body}</p>

          <ul className="mt-8 hidden space-y-3 sm:block">
            {copy.points.map((point, index) => {
              const { Icon, tone } = pointIcons[index];
              return (
                <li key={point.title} className="glass flex items-center gap-3.5 rounded-2xl p-3.5">
                  <IconTile tone={tone}>
                    <Icon className="size-5" />
                  </IconTile>
                  <div>
                    <p className="text-[14px] font-semibold text-ink">{point.title}</p>
                    <p className="text-[13px] text-muted">{point.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>

        </motion.div>

        <div className="flex justify-center lg:justify-end">
          {/* Reserve the card's footprint so the page doesn't jump when Clerk's widget mounts. */}
          <div className="flex min-h-[520px] w-full max-w-[400px] justify-center">
            <ClerkLoading>
              <div aria-hidden className="h-[520px] w-full animate-pulse rounded-3xl border border-line bg-white/80 p-8 shadow-soft">
                <div className="mx-auto h-5 w-2/3 rounded-lg bg-line-soft" />
                <div className="mx-auto mt-3 h-3 w-1/2 rounded-lg bg-line-soft" />
                <div className="mt-8 h-10 rounded-xl bg-line-soft" />
                <div className="mt-8 h-3 w-1/3 rounded-lg bg-line-soft" />
                <div className="mt-2 h-10 rounded-xl bg-line-soft" />
                <div className="mt-5 h-3 w-1/3 rounded-lg bg-line-soft" />
                <div className="mt-2 h-10 rounded-xl bg-line-soft" />
                <div className="mt-8 h-10 rounded-xl bg-primary/20" />
              </div>
            </ClerkLoading>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
