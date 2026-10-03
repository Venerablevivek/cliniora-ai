import { ClerkProvider } from "@clerk/nextjs";
import { arSA } from "@clerk/localizations";
import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";

import { LanguageProvider } from "@/components/language-provider";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { directionOf } from "@/lib/i18n/config";
import { messages } from "@/lib/i18n/messages";
import { getLocale, getLocaleContext } from "@/lib/i18n/server";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
  display: "swap",
});

// Absolute base for Open Graph URLs: explicit app URL, else Vercel's deployment URL, else localhost.
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = messages[locale];
  return {
    metadataBase: new URL(appUrl),
    title: meta.title,
    description: meta.description,
    applicationName: "Clinora AI",
    openGraph: {
      type: "website",
      siteName: "Clinora AI",
      title: meta.title,
      description: meta.description,
      locale: locale === "ar" ? "ar_AR" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_AR",
    },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description },
  };
}

export const viewport: Viewport = {
  themeColor: "#F8FBFF",
  colorScheme: "light",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Resolved on the server (device cookie, then the account's saved preference) so the
  // correct lang/dir is in the very first byte of HTML.
  const { locale, savedLocale, signedIn } = await getLocaleContext();

  return (
    <html
      lang={locale}
      dir={directionOf(locale)}
      className={`${inter.variable} ${notoSansArabic.variable}`}
    >
      <body className="min-h-dvh bg-canvas text-ink">
        <ClerkProvider
          localization={locale === "ar" ? arSA : undefined}
          appearance={clerkAppearance}
        >
          <LanguageProvider initialLocale={locale} savedLocale={savedLocale} signedIn={signedIn}>
            {children}
          </LanguageProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
