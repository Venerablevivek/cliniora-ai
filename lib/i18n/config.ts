export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export type Direction = "ltr" | "rtl";

export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "clinora_locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export function directionOf(locale: Locale): Direction {
  return locale === "ar" ? "rtl" : "ltr";
}

/**
 * BCP 47 tag for Intl formatting. Arabic pins the Gregorian calendar and Arabic-Indic digits
 * so formatted dates/numbers match the digits used in the Arabic copy.
 */
export function intlLocaleOf(locale: Locale): string {
  return locale === "ar" ? "ar-u-ca-gregory-nu-arab" : "en-GB";
}
