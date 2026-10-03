"use client";

import { Fragment } from "react";

import { useI18n } from "@/components/language-provider";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/config";

const options: Array<{ locale: Locale; label: string }> = [
  { locale: "en", label: "EN" },
  { locale: "ar", label: "العربية" },
];

/** Visible "EN / العربية" switch. Each label is tagged with its own `lang` so it renders in the right font. */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.common.languageLabel}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-line bg-surface p-0.5 text-[13px] font-medium shadow-[0_1px_2px_rgb(15_23_42/0.04)]",
        className,
      )}
    >
      {options.map((option, index) => {
        const active = option.locale === locale;
        return (
          <Fragment key={option.locale}>
            {index > 0 && (
              <span aria-hidden className="px-0.5 text-line">
                /
              </span>
            )}
            <button
              type="button"
              lang={option.locale}
              aria-pressed={active}
              onClick={() => setLocale(option.locale)}
              className={cn(
                "h-7 rounded-full px-3 leading-none transition-colors duration-200",
                active ? "bg-primary-soft text-primary" : "text-muted hover:text-ink",
              )}
            >
              {option.label}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
