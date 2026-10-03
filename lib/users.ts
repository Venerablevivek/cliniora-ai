import "server-only";

import { db } from "@/lib/db";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

/** The minimal Clerk user shape we mirror — satisfied by both webhook payloads and Backend API users. */
export type ClerkUserSnapshot = {
  clerkUserId: string;
  email: string;
  signedUpAt: Date;
};

type EmailLike = { id: string; emailAddress: string };

/** Resolve the primary email address from a Clerk user's list of addresses. */
export function primaryEmailOf(
  primaryEmailAddressId: string | null | undefined,
  addresses: EmailLike[],
): string | null {
  const primary = addresses.find((address) => address.id === primaryEmailAddressId) ?? addresses[0];
  return primary ? primary.emailAddress.trim().toLowerCase() : null;
}

/**
 * Idempotently mirror a Clerk user into Postgres.
 *
 * - Keyed on `clerkUserId`, so webhook retries and the `/api/me` fallback can race safely.
 * - `signedUpAt` is written once on create and never overwritten by later updates.
 * - Clerk guarantees email uniqueness among live users, so a local row that still holds this
 *   email under a different Clerk id is stale (e.g. a deleted account whose `user.deleted`
 *   event we never received). We release the email before upserting.
 */
export async function upsertUserFromClerk({ clerkUserId, email, signedUpAt }: ClerkUserSnapshot) {
  const write = () =>
    db.$transaction(async (tx) => {
      await tx.user.deleteMany({ where: { email, NOT: { clerkUserId } } });
      return tx.user.upsert({
        where: { clerkUserId },
        create: { clerkUserId, email, signedUpAt },
        update: { email },
      });
    });

  try {
    return await write();
  } catch (error) {
    // Two concurrent creates for the same user: the loser retries and takes the update path.
    if (isUniqueConstraintError(error)) return write();
    throw error;
  }
}

export async function deleteUserByClerkId(clerkUserId: string) {
  await db.user.deleteMany({ where: { clerkUserId } });
}

export async function findUserByClerkId(clerkUserId: string) {
  return db.user.findUnique({
    where: { clerkUserId },
    select: { email: true, signedUpAt: true },
  });
}
