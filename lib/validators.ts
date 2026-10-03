import { z } from "zod";

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
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
export type WaitlistField = keyof WaitlistInput;

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
    const field = issue.path[0] as WaitlistField | undefined;
    if (field && !result[field]) result[field] = issue.message as WaitlistErrorCode;
  }
  return result;
}

/** Response contract for `POST /api/waitlist`. */
export type WaitlistResponse =
  | { status: "joined"; name: string }
  | { status: "already_joined" }
  | { status: "invalid"; fieldErrors: FieldErrors }
  | { status: "error" };
