"use client";

import { useAuth } from "@clerk/nextjs";
import { MotionConfig } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { directionOf, isLocale, LOCALE_COOKIE, type Direction, type Locale } from "@/lib/i18n/config";
import { messages, type Messages } from "@/lib/i18n/messages";

type LanguageContextValue = {
  locale: Locale;
  dir: Direction;
  t: Messages;
  setLocale: (locale: Locale) => void;
  /** The signed-in user's language as saved in Postgres (null when signed out or not saved yet). */
  savedLocale: Locale | null;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const ONE_YEAR = 60 * 60 * 24 * 365;
// A brand-new account may not be in Postgres yet (webhook lag); retry briefly.
const PREFERENCE_RETRY_MS = [1500, 3000];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function writeDeviceLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}

function readDeviceLocale(): Locale | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  return match && isLocale(match[1]) ? match[1] : null;
}

/** The saved preference, `null` if none is saved, or `undefined` if it couldn't be loaded. */
async function fetchSavedLocale(): Promise<Locale | null | undefined> {
  for (let attempt = 0; attempt <= PREFERENCE_RETRY_MS.length; attempt++) {
    try {
      const response = await fetch("/api/me/preferences", { cache: "no-store" });
      if (response.ok) {
        const { locale } = (await response.json()) as { locale: unknown };
        return isLocale(locale) ? locale : null;
      }
      if (response.status !== 404 || attempt === PREFERENCE_RETRY_MS.length) return undefined;
    } catch {
      return undefined;
    }
    await sleep(PREFERENCE_RETRY_MS[attempt]);
  }
  return undefined;
}

async function saveLocale(locale: Locale): Promise<boolean> {
  try {
    const response = await fetch("/api/me/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
      keepalive: true,
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function LanguageProvider({
  initialLocale,
  savedLocale: serverSavedLocale,
  signedIn: serverSignedIn,
  children,
}: {
  initialLocale: Locale;
  /** Saved preference as read by the server for this request (only meaningful when signed in). */
  savedLocale: Locale | null;
  signedIn: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [locale, setLocaleState] = useState(initialLocale);
  const [savedLocale, setSavedLocale] = useState<Locale | null>(serverSignedIn ? serverSavedLocale : null);
  const [, startTransition] = useTransition();

  // Latest locale for async callbacks (kept in sync after each render).
  const localeRef = useRef(locale);
  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  /** Switch this device to `next`: cookie (for SSR), <html lang/dir>, state, server components. */
  const applyLocale = useCallback(
    (next: Locale) => {
      writeDeviceLocale(next);
      const root = document.documentElement;
      root.lang = next;
      root.dir = directionOf(next);
      setLocaleState(next);
      startTransition(() => router.refresh());
    },
    [router],
  );

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === localeRef.current) return;
      applyLocale(next);
      // Signed in? Remember the choice on the account too, so other devices follow it.
      if (isSignedIn) {
        void saveLocale(next).then((ok) => ok && setSavedLocale(next));
      }
    },
    [applyLocale, isSignedIn],
  );

  // Reconcile the device with the account once per signed-in user (also after a client-side
  // sign-in, where the root layout doesn't re-render):
  //  - nothing saved yet        → save the current language;
  //  - saved, no device choice  → adopt the saved language;
  //  - saved, device has choice → respect the device (it's the more recent, local decision).
  const reconciledFor = useRef<string | null>(null);
  const serverDataFor = useRef<boolean>(serverSignedIn);
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId || reconciledFor.current === userId) return;
    reconciledFor.current = userId;

    let cancelled = false;
    let finished = false;
    (async () => {
      let saved: Locale | null | undefined;
      if (serverDataFor.current) {
        saved = serverSavedLocale;
        serverDataFor.current = false;
      } else {
        saved = await fetchSavedLocale();
      }
      if (cancelled || saved === undefined) return;

      if (saved === null) {
        const current = localeRef.current;
        if (await saveLocale(current)) setSavedLocale(current);
      } else {
        setSavedLocale(saved);
        // No choice made on this device yet: adopt the account's language (and remember it here).
        if (readDeviceLocale() === null) {
          if (saved !== localeRef.current) applyLocale(saved);
          else writeDeviceLocale(saved);
        }
      }
      finished = true;
    })();

    return () => {
      cancelled = true;
      // Allow a re-run (e.g. React Strict Mode's double effect) if we didn't get to finish.
      if (!finished) reconciledFor.current = null;
    };
  }, [isLoaded, isSignedIn, userId, serverSavedLocale, applyLocale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      dir: directionOf(locale),
      t: messages[locale],
      setLocale,
      savedLocale: isSignedIn ? savedLocale : null,
    }),
    [locale, setLocale, isSignedIn, savedLocale],
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
