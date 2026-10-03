"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useId, useRef, useState, type FormEvent } from "react";

import { AlertIcon, ArrowForwardIcon, CheckIcon, InfoIcon, LockIcon, MailIcon, UserIcon } from "@/components/icons";
import { useI18n } from "@/components/language-provider";
import { buttonClass } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  toFieldErrors,
  waitlistSchema,
  type FieldErrors,
  type WaitlistField,
  type WaitlistResponse,
} from "@/lib/validators";

type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "joined"; name: string }
  | { kind: "already_joined" }
  | { kind: "failed"; reason: "generic" | "network" };

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};

export function WaitlistForm() {
  const { t } = useI18n();
  const copy = t.waitlist;
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, setState] = useState<FormState>({ kind: "idle" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    // Validate locally first for instant feedback; the API re-validates with the same schema.
    const parsed = waitlistSchema.safeParse({ name: data.get("name"), email: data.get("email") });
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
        case "joined":
          setState({ kind: "joined", name: result.name });
          break;
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

  const done = state.kind === "joined" || state.kind === "already_joined";
  const submitting = state.kind === "submitting";

  return (
    <div className="relative" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" {...fade} className="flex h-full flex-col items-center py-6 text-center">
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.05 }}
              className={cn(
                "flex size-14 items-center justify-center rounded-full",
                state.kind === "joined" ? "bg-mint-soft text-mint" : "bg-primary-soft text-primary",
              )}
            >
              {state.kind === "joined" ? (
                <CheckIcon className="size-7" strokeWidth={2.25} />
              ) : (
                <InfoIcon className="size-7" />
              )}
            </motion.span>
            <h3 className="mt-5 text-xl font-semibold text-ink">
              {state.kind === "joined" ? (
                <WithName template={copy.successTitle} name={state.name} />
              ) : (
                copy.duplicateTitle
              )}
            </h3>
            <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-muted">
              {state.kind === "joined" ? copy.successBody : copy.duplicateBody}
            </p>
            <button
              type="button"
              onClick={() => setState({ kind: "idle" })}
              className={buttonClass("secondary", "md", "mt-6")}
            >
              {copy.reset}
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
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

/** Inserts a user-supplied name isolated in <bdi>, so a Latin name can't scramble Arabic punctuation. */
function WithName({ template, name }: { template: string; name: string }) {
  const [before, after = ""] = template.split("{name}");
  return (
    <>
      {before}
      <bdi>{name}</bdi>
      {after}
    </>
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
