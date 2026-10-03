"use client";

import Link from "next/link";

import { IconTile } from "@/components/decor";
import {
  ArrowForwardIcon,
  ArrowUpRightIcon,
  GitHubIcon,
  GlobeIcon,
  LockIcon,
  ShieldCheckIcon,
} from "@/components/icons";
import { useI18n } from "@/components/language-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { Logo } from "@/components/logo";
import { buttonClass } from "@/components/ui";
import { intlLocaleOf } from "@/lib/i18n/config";
import { format } from "@/lib/i18n/messages";
import { site } from "@/lib/site";

const trustIcons = [
  { Icon: LockIcon, tone: "mint" },
  { Icon: GlobeIcon, tone: "blue" },
  { Icon: ShieldCheckIcon, tone: "violet" },
] as const;

export function SiteFooter() {
  const { t, locale } = useI18n();
  const copy = t.footer;
  const year = new Intl.NumberFormat(intlLocaleOf(locale), { useGrouping: false }).format(
    new Date().getFullYear(),
  );

  const groups = [
    {
      heading: copy.productHeading,
      links: [
        { href: "/#product", label: t.nav.product },
        { href: "/#how-it-works", label: t.nav.howItWorks },
        { href: "/#waitlist", label: copy.joinWaitlist },
      ],
    },
    {
      heading: copy.companyHeading,
      links: [
        { href: "/#privacy", label: copy.privacy },
        { href: "/sign-in", label: copy.signIn },
        { href: "/dashboard", label: copy.dashboard },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-line/70 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)]">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgb(37_99_235/0.4),rgb(6_182_212/0.4),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -end-32 -top-24 h-[360px] w-[440px] rotate-[18deg] rounded-[72px] bg-[linear-gradient(135deg,rgb(191_219_254/0.55),rgb(165_243_252/0.2))] rtl:-rotate-[18deg]"
      />

      <div className="relative mx-auto max-w-[1200px] px-4 pt-16 sm:px-6 lg:px-8 lg:pt-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-[1.2fr_0.7fr_0.7fr_1.35fr] lg:gap-10">
          {/* Brand */}
          <div className="col-span-2 max-w-sm lg:col-span-1">
            <Logo />
            <p className="mt-4 text-[15px] leading-relaxed text-muted rtl:leading-loose">{copy.tagline}</p>
            <ul className="mt-6 space-y-2.5">
              {copy.trust.map((label, index) => {
                const { Icon, tone } = trustIcons[index];
                return (
                  <li key={label} className="flex items-center gap-2.5 text-[13.5px] font-medium text-ink-soft">
                    <IconTile tone={tone} className="size-7 rounded-lg">
                      <Icon className="size-3.5" />
                    </IconTile>
                    {label}
                  </li>
                );
              })}
            </ul>
            <div className="mt-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted rtl:normal-case rtl:tracking-normal">
                {t.common.languageLabel}
              </p>
              <LanguageToggle className="mt-2.5" />
            </div>
          </div>

          {/* Link columns */}
          {groups.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h2 className="text-sm font-semibold text-ink">{group.heading}</h2>
              <ul className="mt-5 space-y-3.5 text-[14.5px] text-muted">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 transition-colors hover:text-primary"
                    >
                      {link.label}
                      <ArrowForwardIcon className="size-3.5 -translate-x-1 opacity-0 transition-[opacity,translate] group-hover:translate-x-0 group-hover:opacity-100 rtl:-scale-x-100 rtl:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Creator card */}
          <div className="col-span-2 lg:col-span-1">
            <CreatorCard />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-4 border-t border-line/80 py-6 text-[13px] text-muted md:flex-row md:items-center md:justify-between">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{format(copy.rights, { year })}</span>
            <span aria-hidden className="hidden text-line sm:inline">
              •
            </span>
            <span>
              {copy.craftedBy}{" "}
              <a
                href={site.author.githubUrl}
                target="_blank"
                rel="noreferrer"
                lang="en"
                className="font-semibold text-ink hover:text-primary"
              >
                {site.author.name}
              </a>
            </span>
          </p>
          <p className="max-w-md md:text-end">{copy.disclaimer}</p>
        </div>
      </div>

      {/* Oversized, faded wordmark as a closing flourish */}
      <div aria-hidden className="pointer-events-none relative -mt-2 select-none overflow-hidden">
        <p className="text-brand-gradient mx-auto max-w-[1200px] px-4 text-center text-[19vw] font-bold leading-[0.82] tracking-[-0.06em] opacity-[0.13] [mask-image:linear-gradient(to_bottom,black_35%,transparent)] sm:px-6 lg:px-8 lg:text-[220px] rtl:leading-[1.05] rtl:tracking-normal">
          {t.common.brand}
        </p>
      </div>
    </footer>
  );
}

function CreatorCard() {
  const { t } = useI18n();
  const copy = t.footer;

  return (
    <div className="relative">
      {/* Gradient hairline border */}
      <div className="rounded-[28px] bg-[linear-gradient(135deg,rgb(37_99_235/0.45),rgb(6_182_212/0.35),rgb(20_184_166/0.3))] p-px shadow-lift">
        <div className="relative overflow-hidden rounded-[27px] bg-white/90 p-6 backdrop-blur-xl sm:p-7">
          <div
            aria-hidden
            className="absolute -end-10 -top-10 size-40 rounded-full bg-[radial-gradient(circle,rgb(6_182_212/0.18),transparent_70%)]"
          />
          <p className="relative text-[12px] font-semibold uppercase tracking-[0.14em] text-primary rtl:normal-case rtl:tracking-normal">
            {copy.creatorEyebrow}
          </p>

          <div className="relative mt-4 flex items-center gap-4">
            <span
              lang="en"
              className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-lg font-bold text-white shadow-cta"
            >
              {site.author.initials}
              <span className="absolute -bottom-1 -end-1 flex size-5 items-center justify-center rounded-full bg-white ring-2 ring-white">
                <span className="size-2.5 rounded-full bg-mint" />
              </span>
            </span>
            <div className="min-w-0">
              <p lang="en" className="text-xl font-bold tracking-tight text-ink">
                {site.author.name}
              </p>
              <p className="text-[13.5px] text-muted">{copy.creatorRole}</p>
            </div>
          </div>

          <p className="relative mt-4 text-[13.5px] leading-relaxed text-ink-soft rtl:leading-loose">
            {copy.creatorBody}
          </p>

          <div className="relative mt-5 flex flex-wrap gap-2">
            <a
              href={site.author.githubUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonClass("primary", "md", "h-10 px-4 text-[13.5px]")}
            >
              <GitHubIcon className="size-4" />
              {copy.github}
            </a>
            <a
              href={site.repoUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonClass("secondary", "md", "h-10 px-4 text-[13.5px]")}
            >
              {copy.source}
              <ArrowUpRightIcon className="size-4 rtl:-scale-x-100" />
            </a>
          </div>

          <div className="relative mt-5 flex flex-wrap items-center gap-1.5 border-t border-line-soft pt-4">
            <span className="w-full text-[12px] font-medium text-muted">{copy.builtWith}</span>
            {site.stack.map((tech) => (
              <span
                key={tech}
                lang="en"
                className="rounded-full border border-line bg-canvas px-2.5 py-0.5 text-[11.5px] font-semibold text-ink-soft"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
