import { z } from "zod";

/** Referral codes are 8 characters of 0-9/A-Z (the database generates uppercase hex). */
export const REFERRAL_CODE_PATTERN = /^[0-9A-Z]{8}$/;

/** Normalize a code from a URL or user input; returns null if it can't be a valid code. */
export function normalizeReferralCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const code = value.trim().toUpperCase();
  return REFERRAL_CODE_PATTERN.test(code) ? code : null;
}

/**
 * Shared by the waitlist form (instant feedback) and `POST /api/waitlist` (source of truth).
 * Messages are stable codes, not prose, so the client can render them in English or Arabic.
 */
export const waitlistSchema = z.object({
  name: z
    .string({ error: "name_required" })
    .trim()
    .min(1, { error: "name_required" })
    .min(2, { error: "name_too_short" })
    .max(80, { error: "name_too_long" }),
  email: z
    .string({ error: "email_required" })
    .trim()
    .toLowerCase()
    .min(1, { error: "email_required" })
    .max(254, { error: "email_invalid" })
    .pipe(z.email({ error: "email_invalid" })),
  /** Optional invite code from a referral link. Anything malformed is dropped, never an error. */
  ref: z
    .string()
    .trim()
    .toUpperCase()
    .regex(REFERRAL_CODE_PATTERN)
    .optional()
    .catch(undefined),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
export type WaitlistField = "name" | "email";

export type WaitlistErrorCode =
  | "name_required"
  | "name_too_short"
  | "name_too_long"
  | "email_required"
  | "email_invalid";

export type FieldErrors = Partial<Record<WaitlistField, WaitlistErrorCode>>;

/** Collapse Zod issues into one code per field (the first one wins). */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if ((field === "name" || field === "email") && !result[field]) {
      result[field] = issue.message as WaitlistErrorCode;
    }
  }
  return result;
}

/** Where someone stands in the queue, and how many friends they've brought in. */
export type QueueStatus = {
  referralCode: string;
  position: number;
  total: number;
  referralCount: number;
};

/** Response contract for `POST /api/waitlist`. */
export type WaitlistResponse =
  | ({ status: "joined"; name: string } & QueueStatus)
  | { status: "already_joined" }
  | { status: "invalid"; fieldErrors: FieldErrors }
  | { status: "error" };
