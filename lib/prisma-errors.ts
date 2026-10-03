import { Prisma } from "@/lib/generated/prisma/client";

/** True when a write failed because it violated a unique constraint (Postgres 23505). */
export function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

/**
 * True when an interactive transaction couldn't start or finish in time (P2028) — typically a
 * serverless Postgres (e.g. Neon) waking from auto-suspend. Safe to retry: nothing was committed.
 */
export function isTransactionTimeoutError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2028";
}

/**
 * Interactive-transaction limits sized for serverless Postgres cold starts. Prisma's defaults
 * (2s to start, 5s to run) are too tight when the database has to wake up first.
 */
export const TRANSACTION_OPTIONS = { maxWait: 10_000, timeout: 15_000 } as const;
