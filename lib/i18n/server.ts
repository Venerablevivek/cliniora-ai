import "server-only";

import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { cache } from "react";

import { db } from "@/lib/db";

import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";

export type LocaleContext = {
  /** The locale to render this request in. */
  locale: Locale;
  /** The signed-in user's saved preference (null if none yet, or signed out). */
  savedLocale: Locale | null;
  signedIn: boolean;
};

/**
 * Resolve the UI language for this request:
 *   1. this device's explicit choice (cookie) — the most recent, local decision;
 *   2. the signed-in user's saved preference — so a new browser or device opens in their language;
 *   3. English.
 * Every language switch updates both the cookie and (when signed in) the saved preference.
 * Memoized per request so the layout and metadata share one lookup.
 */
export const getLocaleContext = cache(async (): Promise<LocaleContext> => {
  const cookieValue = (await cookies()).get(LOCALE_COOKIE)?.value;
  const cookieLocale = isLocale(cookieValue) ? cookieValue : null;

  let savedLocale: Locale | null = null;
  let signedIn = false;
  try {
    const { userId } = await auth();
    if (userId) {
      signedIn = true;
      const user = await db.user.findUnique({ where: { clerkUserId: userId }, select: { locale: true } });
      savedLocale = user?.locale ?? null;
    }
  } catch (error) {
    // Never fail a page render over a preference lookup.
    console.error("[i18n] could not load saved locale", error);
  }

  return { locale: cookieLocale ?? savedLocale ?? defaultLocale, savedLocale, signedIn };
});

export async function getLocale(): Promise<Locale> {
  return (await getLocaleContext()).locale;
}
