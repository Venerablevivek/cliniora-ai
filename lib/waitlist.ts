import "server-only";

import { db } from "@/lib/db";
import { isTransactionTimeoutError, isUniqueConstraintError, TRANSACTION_OPTIONS } from "@/lib/prisma-errors";
import type { QueueStatus } from "@/lib/validators";

type Ranked = { id: string; referralCode: string; referralCount: number; createdAt: Date };

/**
 * Queue order: more referrals first; ties go to whoever joined earlier (then id, so every
 * position is unique and stable). Position is 1 + the number of entries ranked ahead.
 */
export async function getQueueStatus(entry: Ranked): Promise<QueueStatus> {
  const [ahead, total] = await Promise.all([
    db.waitlistEntry.count({
      where: {
        OR: [
          { referralCount: { gt: entry.referralCount } },
          { referralCount: entry.referralCount, createdAt: { lt: entry.createdAt } },
          { referralCount: entry.referralCount, createdAt: entry.createdAt, id: { lt: entry.id } },
        ],
      },
    }),
    db.waitlistEntry.count(),
  ]);

  return {
    referralCode: entry.referralCode,
    position: ahead + 1,
    total,
    referralCount: entry.referralCount,
  };
}

export async function getQueueStatusByCode(referralCode: string): Promise<QueueStatus | null> {
  const entry = await db.waitlistEntry.findUnique({
    where: { referralCode },
    select: { id: true, referralCode: true, referralCount: true, createdAt: true },
  });
  return entry ? getQueueStatus(entry) : null;
}

export type JoinResult =
  | ({ status: "joined"; name: string } & QueueStatus)
  | { status: "already_joined" };

const MAX_ATTEMPTS = 3;

/**
 * Add someone to the waitlist, crediting the referrer if a valid code was supplied.
 *
 * The insert and the referrer's increment run in one transaction, so a referral is counted
 * exactly when the new entry is actually created — never for duplicates or failed inserts.
 * Unknown codes are ignored (the person still joins).
 */
export async function joinWaitlist(input: { name: string; email: string; ref?: string }): Promise<JoinResult> {
  for (let attempt = 1; ; attempt++) {
    try {
      const entry = await db.$transaction(async (tx) => {
        const referrer = input.ref
          ? await tx.waitlistEntry.findUnique({ where: { referralCode: input.ref }, select: { id: true } })
          : null;

        const created = await tx.waitlistEntry.create({
          data: { name: input.name, email: input.email, referredById: referrer?.id },
          select: { id: true, name: true, referralCode: true, referralCount: true, createdAt: true },
        });

        if (referrer) {
          // Atomic `referralCount = referralCount + 1`, safe under concurrent sign-ups.
          await tx.waitlistEntry.update({
            where: { id: referrer.id },
            data: { referralCount: { increment: 1 } },
          });
        }
        return created;
      }, TRANSACTION_OPTIONS);

      return { status: "joined", name: entry.name, ...(await getQueueStatus(entry)) };
    } catch (error) {
      // A cold database can be slow to hand out a transaction; nothing was written, so retry.
      if (isTransactionTimeoutError(error) && attempt < MAX_ATTEMPTS) continue;
      if (!isUniqueConstraintError(error)) throw error;

      // Two unique columns can collide: the email (a real duplicate) or, astronomically
      // rarely, the generated referral code (just try again).
      const existing = await db.waitlistEntry.findUnique({ where: { email: input.email }, select: { id: true } });
      if (existing) return { status: "already_joined" };
      if (attempt >= MAX_ATTEMPTS) throw error;
    }
  }
}
