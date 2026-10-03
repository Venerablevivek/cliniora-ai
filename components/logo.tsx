"use client";

import Link from "next/link";

import { useI18n } from "@/components/language-provider";
import { cn } from "@/lib/cn";

/** Clinora mark: a brief "page" folded into a soft cross. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <defs>
        <linearGradient id="clinora-mark" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="10" fill="url(#clinora-mark)" />
      <path d="M13.5 8.5h5v5h5v5h-5v5h-5v-5h-5v-5h5z" fill="#fff" opacity="0.95" />
      <circle cx="23.5" cy="8.5" r="2" fill="#A7F3D0" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <Link
      href="/"
      aria-label={t.common.homeLabel}
      className={cn("inline-flex items-center gap-2.5 rounded-lg", className)}
    >
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight text-ink rtl:tracking-normal">
        {t.common.brand}
        <span className="ms-1 font-medium text-primary" lang="en">
          {t.common.brandSuffix}
        </span>
      </span>
    </Link>
  );
}
