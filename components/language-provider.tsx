"use client";

import { MotionConfig } from "framer-motion";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState, useTransition } from "react";

import { directionOf, LOCALE_COOKIE, type Direction, type Locale } from "@/lib/i18n/config";
import { messages, type Messages } from "@/lib/i18n/messages";

type LanguageContextValue = {
  locale: Locale;
  dir: Direction;
  t: Messages;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const ONE_YEAR = 60 * 60 * 24 * 365;

export function LanguageProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState(initialLocale);
  const [, startTransition] = useTransition();

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;

      // Persist for SSR so the next request renders the right lang/dir with no flash.
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${ONE_YEAR}; samesite=lax`;

      // Update the document immediately — this is what flips the whole layout to RTL.
      const root = document.documentElement;
      root.lang = next;
      root.dir = directionOf(next);

      setLocaleState(next);

      // Re-render server components (page metadata, Clerk's localization) in the background.
      startTransition(() => router.refresh());
    },
    [locale, router],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, dir: directionOf(locale), t: messages[locale], setLocale }),
    [locale, setLocale],
  );

  return (
    <LanguageContext.Provider value={value}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LanguageContext.Provider>
  );
}

export function useI18n(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useI18n must be used inside <LanguageProvider>");
  return context;
}
