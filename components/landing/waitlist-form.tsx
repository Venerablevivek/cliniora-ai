"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent } from "react";

import { AlertIcon, ArrowForwardIcon, InfoIcon, LockIcon, MailIcon, SparklesIcon, UserIcon } from "@/components/icons";
import { ReferralPanel } from "@/components/landing/referral-panel";
import { useI18n } from "@/components/language-provider";
import { buttonClass } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  readInviteFromUrl,
  readOwnCode,
  readStoredInvite,
  storeInvite,
  storeOwnCode,
} from "@/lib/referral-storage";
import {
  toFieldErrors,
  waitlistSchema,
  type FieldErrors,
  type QueueStatus,
  type WaitlistField,
  type WaitlistResponse,
} from "@/lib/validators";

type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "joined"; name: string; status: QueueStatus }
  | { kind: "returning"; status: QueueStatus }
  | { kind: "already_joined" }
  | { kind: "failed"; reason: "generic" | "network" };

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};

// Browser-only values read through useSyncExternalStore: `null` on the server and during
// hydration, then the real value — so server HTML and the first client render always match.
const noSubscribe = () => () => {};
const serverNull = () => null;
const readInvite = () => readInviteFromUrl() ?? readStoredInvite();

async function fetchStatus(code: string): Promise<QueueStatus | null> {
  try {
    const response = await fetch(`/api/waitlist/status?code=${encodeURIComponent(code)}`, { cache: "no-store" });
    return response.ok ? ((await response.json()) as QueueStatus) : null;
  } catch {
    return null;
  }
}

export function WaitlistForm() {
  const { t } = useI18n();
  const copy = t.waitlist;
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, setState] = useState<FormState>({ kind: "idle" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [refreshing, setRefreshing] = useState(false);
  const [dismissedOwnCode, setDismissedOwnCode] = useState(false);

  const urlOrStoredInvite = useSyncExternalStore(noSubscribe, readInvite, serverNull);
  const ownCode = useSyncExternalStore(noSubscribe, readOwnCode, serverNull);
  // Never credit someone with their own link.
  const inviteCode = urlOrStoredInvite && urlOrStoredInvite !== ownCode ? urlOrStoredInvite : null;

  // Remember an invite from the URL, so it still applies after browsing other sections.
  useEffect(() => {
    const fromUrl = readInviteFromUrl();
    if (fromUrl && fromUrl !== readOwnCode()) storeInvite(fromUrl);
  }, []);

  // Returning visitor who already joined on this device: show their live spot.
  useEffect(() => {
    if (!ownCode || dismissedOwnCode) return;
    let cancelled = false;
    fetchStatus(ownCode).then((status) => {
      if (cancelled) return;
      if (status) setState((current) => (current.kind === "idle" ? { kind: "returning", status } : current));
      else storeOwnCode(null); // The code no longer exists (e.g. data was reset).
    });
    return () => {
      cancelled = true;
    };
  }, [ownCode, dismissedOwnCode]);

  const refreshStatus = useCallback(async () => {
    if (state.kind !== "joined" && state.kind !== "returning") return;
    setRefreshing(true);
    const status = await fetchStatus(state.status.referralCode);
    setRefreshing(false);
    if (status) setState((current) => ("status" in current ? { ...current, status } : current));
  }, [state]);

  function reset() {
    storeOwnCode(null);
    setDismissedOwnCode(true);
    setState({ kind: "idle" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    // Validate locally first for instant feedback; the API re-validates with the same schema.
    const parsed = waitlistSchema.safeParse({
      name: data.get("name"),
      email: data.get("email"),
      ref: inviteCode ?? undefined,
    });
    if (!parsed.success) {
      const errors = toFieldErrors(parsed.error);
      setFieldErrors(errors);
      focusFirstInvalid(errors);
      return;
    }

    setFieldErrors({});
    setState({ kind: "submitting" });

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = (await response.json()) as WaitlistResponse;

      switch (result.status) {
        case "joined": {
          const { status: _kind, name, ...status } = result;
          void _kind;
          storeOwnCode(status.referralCode);
          storeInvite(null); // The invite has been used.
          // Drop ?ref= from the address bar so it isn't confused with their own link.
          const url = new URL(window.location.href);
          if (url.searchParams.has("ref")) {
            url.searchParams.delete("ref");
            window.history.replaceState(null, "", url);
          }
          setState({ kind: "joined", name, status });
          break;
        }
        case "already_joined":
          setState({ kind: "already_joined" });
          break;
        case "invalid":
          setFieldErrors(result.fieldErrors);
          setState({ kind: "idle" });
          focusFirstInvalid(result.fieldErrors);
          break;
        default:
          setState({ kind: "failed", reason: "generic" });
      }
    } catch {
      setState({ kind: "failed", reason: "network" });
    }
  }

  function focusFirstInvalid(errors: FieldErrors) {
    const field = (["name", "email"] as const).find((key) => errors[key]);
    if (field) formRef.current?.querySelector<HTMLInputElement>(`[name="${field}"]`)?.focus();
  }

  function clearFieldError(field: WaitlistField) {
    if (!fieldErrors[field]) return;
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  const submitting = state.kind === "submitting";
  const viewKey =
    state.kind === "joined" || state.kind === "returning"
      ? "referral"
      : state.kind === "already_joined"
        ? "duplicate"
        : "form";

  return (
    <div className="relative" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        {state.kind === "joined" || state.kind === "returning" ? (
          <motion.div key={viewKey} {...fade}>
            <ReferralPanel
              status={state.status}
              joinedName={state.kind === "joined" ? state.name : undefined}
              refreshing={refreshing}
              onRefresh={refreshStatus}
              onReset={reset}
            />
          </motion.div>
        ) : state.kind === "already_joined" ? (
          <motion.div key={viewKey} {...fade} className="flex flex-col items-center py-6 text-center">
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.05 }}
              className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary"
            >
              <InfoIcon className="size-7" />
            </motion.span>
            <h3 className="mt-5 text-xl font-semibold text-ink">{copy.duplicateTitle}</h3>
            <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-muted">{copy.duplicateBody}</p>
            <button type="button" onClick={reset} className={buttonClass("secondary", "md", "mt-6")}>
              {copy.reset}
            </button>
          </motion.div>
        ) : (
          <motion.form
            key={viewKey}
            {...fade}
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            className="space-y-4"
          >
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-ink rtl:tracking-normal">{copy.formTitle}</h3>
              <p className="mt-1 text-sm text-muted">{copy.formBody}</p>
            </div>

            {inviteCode && (
              <p className="flex items-start gap-2.5 rounded-2xl border border-primary/15 bg-primary-soft/70 px-3.5 py-3 text-[13px] leading-relaxed text-ink-soft">
                <SparklesIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                {copy.referral.invited}
              </p>
            )}

            <Field
              id={`${id}-name`}
              name="name"
              label={copy.nameLabel}
              placeholder={copy.namePlaceholder}
              autoComplete="name"
              icon={<UserIcon className="size-[18px]" />}
              error={fieldErrors.name && copy.errors[fieldErrors.name]}
              onInput={() => clearFieldError("name")}
              disabled={submitting}
            />
            <Field
              id={`${id}-email`}
              name="email"
              type="email"
              dir="ltr"
              label={copy.emailLabel}
              placeholder={copy.emailPlaceholder}
              autoComplete="email"
              icon={<MailIcon className="size-[18px]" />}
              inputMode="email"
              error={fieldErrors.email && copy.errors[fieldErrors.email]}
              onInput={() => clearFieldError("email")}
              disabled={submitting}
            />

            {state.kind === "failed" && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-xl bg-danger-soft px-3 py-2.5 text-sm text-danger"
              >
                <AlertIcon className="mt-px size-4 shrink-0" />
                {copy.errors[state.reason]}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={buttonClass("primary", "xl", "w-full")}
            >
              {submitting && (
                <span
                  aria-hidden
                  className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
              )}
              {submitting ? copy.submitting : copy.submit}
              {!submitting && <ArrowForwardIcon className="size-[18px] rtl:-scale-x-100" />}
            </button>
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
              <LockIcon className="size-3.5" />
              {copy.formNote}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  name: WaitlistField;
  label: string;
  error?: string;
  icon: React.ReactNode;
};

function Field({ id, label, error, dir, icon, className, ...input }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label}
      </label>
      <div className="relative">
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4",
            error ? "text-danger/70" : "text-muted",
          )}
        >
          {icon}
        </span>
      <input
        id={id}
        dir={dir}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-[52px] w-full rounded-2xl border bg-white/90 pe-4 ps-11 text-[15px] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted/70",
          "focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60",
          // An LTR field (email) inside an RTL page keeps its icon on the page's start side and
          // right-aligns its text, so it lines up with the Arabic labels above it.
          dir === "ltr" && "rtl:pl-4 rtl:pr-11 rtl:text-right rtl:placeholder:text-right",
          error ? "border-danger/60" : "border-line",
          className,
        )}
        {...input}
      />
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-[13px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
