"use client";

import Link from "next/link";

import { ArrowForwardIcon } from "@/components/icons";
import { useI18n } from "@/components/language-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { Logo } from "@/components/logo";
import { buttonClass } from "@/components/ui";
import { intlLocaleOf } from "@/lib/i18n/config";
import { format } from "@/lib/i18n/messages";

export function SiteFooter() {
  const { t, locale } = useI18n();
  const year = new Intl.NumberFormat(intlLocaleOf(locale), { useGrouping: false }).format(
    new Date().getFullYear(),
  );

  const productLinks = [
    { href: "/#product", label: t.nav.product },
    { href: "/#how-it-works", label: t.nav.howItWorks },
  ];
  const companyLinks = [
    { href: "/#privacy", label: t.footer.privacy },
    { href: "/sign-in", label: t.footer.signIn },
  ];

  return (
    <footer className="relative border-t border-line/70 bg-canvas">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgb(37_99_235/0.35),rgb(6_182_212/0.35),transparent)]" />
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_auto] lg:px-8">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted">{t.footer.tagline}</p>
          <Link href="/#waitlist" className={buttonClass("secondary", "md", "mt-6")}>
            {t.footer.joinWaitlist}
            <ArrowForwardIcon className="size-4 rtl:-scale-x-100" />
          </Link>
        </div>

        {[
          { heading: t.footer.productHeading, links: productLinks },
          { heading: t.footer.companyHeading, links: companyLinks },
        ].map((group) => (
          <nav key={group.heading} aria-label={group.heading}>
            <h2 className="text-sm font-semibold text-ink">{group.heading}</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className="text-sm font-semibold text-ink">{t.common.languageLabel}</h2>
          <LanguageToggle className="mt-4" />
        </div>
      </div>

      <div className="border-t border-line/70">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-6 text-xs text-muted sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>{format(t.footer.rights, { year })}</p>
          <p>{t.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
