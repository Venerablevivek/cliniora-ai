import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import type { MeErrorResponse, MeResponse } from "@/lib/api-types";
import { findUserByClerkId, primaryEmailOf, upsertUserFromClerk } from "@/lib/users";

const noStore = { "Cache-Control": "private, no-store" };

/**
 * Returns the signed-in user's account record from *our* Postgres database.
 * Clerk is used for exactly one thing here: resolving the session to a `clerkUserId`.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json<MeErrorResponse>({ error: "UNAUTHENTICATED" }, { status: 401, headers: noStore });
  }

  try {
    const user = (await findUserByClerkId(userId)) ?? (await syncFromClerk(userId));
    if (!user) {
      return NextResponse.json<MeErrorResponse>({ error: "USER_NOT_SYNCED" }, { status: 404, headers: noStore });
    }

    return NextResponse.json<MeResponse>(
      { email: user.email, signedUpAt: user.signedUpAt.toISOString() },
      { headers: noStore },
    );
  } catch (error) {
    console.error("[api/me] failed to load user", error);
    return NextResponse.json<MeErrorResponse>({ error: "INTERNAL_ERROR" }, { status: 500, headers: noStore });
  }
}

/**
 * Safety net for the window between sign-up and webhook delivery (or a missed webhook in
 * local dev). Fetches the user server-to-server from Clerk's Backend API and writes it through
 * the same idempotent upsert the webhook uses — the response is still the Postgres row.
 */
async function syncFromClerk(clerkUserId: string) {
  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(clerkUserId);
  const email = primaryEmailOf(clerkUser.primaryEmailAddressId, clerkUser.emailAddresses);
  if (!email) return null;

  console.info(`[api/me] user ${clerkUserId} not yet synced by webhook; synced via Backend API`);
  const user = await upsertUserFromClerk({
    clerkUserId,
    email,
    signedUpAt: new Date(clerkUser.createdAt),
  });
  return { email: user.email, signedUpAt: user.signedUpAt };
}
