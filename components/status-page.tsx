"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { GlassShapes } from "@/components/decor";
import { AlertIcon, ArrowBackIcon, StethoscopeIcon } from "@/components/icons";
import { useI18n } from "@/components/language-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { Logo } from "@/components/logo";
import { buttonClass } from "@/components/ui";

/** Shared branded frame for 404 and error screens. */
export function StatusPage({ variant, onRetry }: { variant: "not-found" | "error"; onRetry?: () => void }) {
  const { t } = useI18n();
  const copy = t.status;
  const notFound = variant === "not-found";

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-hero">
      <GlassShapes className="hidden md:block" />
      <header className="relative mx-auto flex h-[72px] w-full max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Logo />
        <LanguageToggle />
      </header>

      <main id="main" className="relative flex flex-1 items-center justify-center px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="glass w-full max-w-lg rounded-[32px] p-8 text-center sm:p-12"
        >
          <span className="mx-auto flex size-16 items-center justify-center rounded-[20px] bg-brand-gradient text-white shadow-cta">
            {notFound ? <StethoscopeIcon className="size-8" /> : <AlertIcon className="size-8" />}
          </span>
          {notFound && (
            <p className="text-brand-gradient mt-6 text-6xl font-bold tracking-tight">{copy.notFoundCode}</p>
          )}
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl rtl:tracking-normal">
            {notFound ? copy.notFoundTitle : copy.errorTitle}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{notFound ? copy.notFoundBody : copy.errorBody}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {onRetry && (
              <button type="button" onClick={onRetry} className={buttonClass("primary", "lg")}>
                {copy.retry}
              </button>
            )}
            <Link href="/" className={buttonClass(onRetry ? "secondary" : "primary", "lg")}>
              <ArrowBackIcon className="size-4 rtl:-scale-x-100" />
              {copy.home}
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
