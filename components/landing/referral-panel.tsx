"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { CheckIcon, MailIcon, RefreshIcon, ShareIcon, SparklesIcon, UsersIcon } from "@/components/icons";
import { useI18n } from "@/components/language-provider";
import { buttonClass } from "@/components/ui";
import { cn } from "@/lib/cn";
import { intlLocaleOf } from "@/lib/i18n/config";
import { format, plural } from "@/lib/i18n/messages";
import { inviteUrl } from "@/lib/referral-storage";
import type { QueueStatus } from "@/lib/validators";

const noSubscribe = () => () => {};
const emptyString = () => "";
const alwaysFalse = () => false;
const readCanShare = () => typeof navigator.share === "function";

type ReferralPanelProps = {
  status: QueueStatus;
  /** Shown right after joining; omitted for a returning visitor. */
  joinedName?: string;
  refreshing: boolean;
  onRefresh: () => void;
  onReset: () => void;
};

/** Post-signup view: queue position, referral progress and share actions. */
export function ReferralPanel({ status, joinedName, refreshing, onRefresh, onReset }: ReferralPanelProps) {
  const { t, locale } = useI18n();
  const copy = t.waitlist;
  const r = copy.referral;
  const intlLocale = intlLocaleOf(locale);
  const n = new Intl.NumberFormat(intlLocale);

  const [copied, setCopied] = useState(false);

  // The site origin and Web Share support only exist in the browser: read them as external
  // values ("" / false during SSR and hydration, then the real value) — no effects or timers.
  const readLink = useCallback(() => inviteUrl(status.referralCode), [status.referralCode]);
  const link = useSyncExternalStore(noSubscribe, readLink, emptyString);
  const canNativeShare = useSyncExternalStore(noSubscribe, readCanShare, alwaysFalse);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Fallback for browsers without async clipboard access.
      const input = document.getElementById("referral-link") as HTMLInputElement | null;
      input?.select();
      document.execCommand("copy");
    }
    setCopied(true);
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: "Clinora AI", text: r.shareText, url: link });
    } catch {
      // User dismissed the share sheet.
    }
  }

  const message = `${r.shareText} ${link}`;
  const shareLinks = [
    { label: r.whatsapp, href: `https://wa.me/?text=${encodeURIComponent(message)}`, icon: <WhatsAppGlyph /> },
    {
      label: r.x,
      href: `https://x.com/intent/post?text=${encodeURIComponent(r.shareText)}&url=${encodeURIComponent(link)}`,
      icon: <XGlyph />,
    },
    {
      label: r.email,
      href: `mailto:?subject=${encodeURIComponent(r.emailSubject)}&body=${encodeURIComponent(message)}`,
      icon: <MailIcon className="size-4" />,
    },
  ];

  // How far up the queue they are: 100% at #1, ~0% at the back.
  const progress = status.total <= 1 ? 100 : Math.round(((status.total - status.position) / (status.total - 1)) * 100);

  return (
    <div className="space-y-5">
      <div className="text-center">
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.05 }}
          className="mx-auto flex size-12 items-center justify-center rounded-full bg-mint-soft text-mint"
        >
          <CheckIcon className="size-6" strokeWidth={2.25} />
        </motion.span>
        <h3 className="mt-4 text-xl font-semibold text-ink">
          {joinedName ? <WithName template={copy.successTitle} name={joinedName} /> : r.welcomeBack}
        </h3>
        {joinedName && <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{copy.successBody}</p>}
      </div>

      {/* Position */}
      <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#1d4ed8_0%,#2563eb_45%,#06b6d4_100%)] p-5 text-white shadow-cta">
        <div aria-hidden className="absolute -end-10 -top-12 size-36 rotate-12 rounded-[36px] bg-white/10 rtl:-rotate-12" />
        <div className="relative flex items-end justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/75 rtl:normal-case rtl:tracking-normal">
              {r.positionLabel}
            </p>
            <p className="mt-1 flex items-baseline gap-2">
              <motion.span
                key={status.position}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold tracking-tight tabular-nums rtl:tracking-normal"
              >
                {format(r.positionValue, { position: n.format(status.position) })}
              </motion.span>
              <span className="text-sm text-white/75">{format(r.positionOf, { total: n.format(status.total) })}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label={r.refresh}
            title={r.refresh}
            className="flex size-9 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25 transition-colors hover:bg-white/25 disabled:opacity-60"
          >
            <RefreshIcon className={cn("size-4", refreshing && "animate-spin")} />
          </button>
        </div>
        <div
          role="progressbar"
          aria-label={r.positionLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="relative mt-4 h-2 overflow-hidden rounded-full bg-white/20"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(progress, 4)}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full bg-white"
          />
        </div>
        <p className="relative mt-3 flex items-center gap-1.5 text-[13px] font-medium text-white/90">
          <UsersIcon className="size-4" />
          {plural(locale, status.referralCount, r.referrals, intlLocale)}
          {status.position === 1 && (
            <span className="ms-auto inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
              <SparklesIcon className="size-3" />
              {r.topSpot}
            </span>
          )}
        </p>
      </div>

      {/* Share */}
      <div>
        <p className="text-[15px] font-semibold text-ink">{r.shareTitle}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">{r.shareBody}</p>

        <label htmlFor="referral-link" className="mt-3 block text-[12px] font-medium text-muted">
          {r.linkLabel}
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            id="referral-link"
            readOnly
            dir="ltr"
            value={link}
            onFocus={(event) => event.currentTarget.select()}
            className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-canvas px-3 font-mono text-[12.5px] text-ink-soft outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={copyLink}
            disabled={!link}
            className={buttonClass(copied ? "secondary" : "primary", "md", "h-11 shrink-0 rounded-xl px-4")}
          >
            {copied ? <CheckIcon className="size-4" strokeWidth={2.5} /> : null}
            {copied ? r.copied : r.copy}
          </button>
        </div>
        <span className="sr-only" aria-live="polite">
          {copied ? r.copied : ""}
        </span>

        <div className="mt-3 flex flex-wrap gap-2">
          {canNativeShare && (
            <button type="button" onClick={nativeShare} className={buttonClass("secondary", "md", "h-9 px-3 text-[13px]")}>
              <ShareIcon className="size-4" />
              {r.share}
            </button>
          )}
          {shareLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className={buttonClass("secondary", "md", "h-9 px-3 text-[13px]")}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <button type="button" onClick={onReset} className="block w-full text-center text-[13px] font-medium text-muted hover:text-primary">
        {r.notYou}
      </button>
    </div>
  );
}

/** Inserts a user-supplied name isolated in <bdi>, so a Latin name can't scramble Arabic punctuation. */
export function WithName({ template, name }: { template: string; name: string }) {
  const [before, after = ""] = template.split("{name}");
  return (
    <>
      {before}
      <bdi>{name}</bdi>
      {after}
    </>
  );
}

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4 text-[#25D366]" fill="currentColor">
      <path d="M12 2.5a9.4 9.4 0 0 0-8.1 14.2L2.6 21.5l4.9-1.3A9.4 9.4 0 1 0 12 2.5Zm0 17.1a7.7 7.7 0 0 1-3.9-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A7.7 7.7 0 1 1 12 19.6Zm4.2-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.3 6.3 0 0 1-3.1-2.7c-.2-.4.2-.4.7-1.3.1-.1 0-.3 0-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.5-.3Z" />
    </svg>
  );
}

function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-3.5" fill="currentColor">
      <path d="M17.8 3h3.1l-6.8 7.7 8 10.3h-6.2l-4.9-6.3L5.4 21H2.3l7.2-8.3L1.8 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" />
    </svg>
  );
}
