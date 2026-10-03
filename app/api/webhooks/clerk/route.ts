import type { UserJSON, WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Webhook, WebhookVerificationError } from "svix";

import { deleteUserByClerkId, primaryEmailOf, upsertUserFromClerk } from "@/lib/users";

/**
 * Clerk → Postgres user sync. Clerk delivers webhooks through Svix; we verify the signature
 * against the raw body before trusting anything in the payload.
 *
 * Responses: 2xx tells Svix the event is handled; any other status schedules a retry, so we
 * only return non-2xx for failures a retry could fix (bad signature aside).
 */
export async function POST(request: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[clerk-webhook] CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const svixHeaders = {
    "svix-id": request.headers.get("svix-id") ?? "",
    "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
    "svix-signature": request.headers.get("svix-signature") ?? "",
  };

  // Signature verification must run on the exact bytes Clerk signed, so read the raw text.
  const body = await request.text();

  try {
    // svix v2 only verifies (throws on failure); it no longer returns the parsed payload.
    new Webhook(secret).verify(body, svixHeaders);
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    throw error;
  }

  const event = JSON.parse(body) as WebhookEvent;

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated":
        return await syncUser(event.data);
      case "user.deleted":
        if (event.data.id) await deleteUserByClerkId(event.data.id);
        return NextResponse.json({ ok: true });
      default:
        return NextResponse.json({ ok: true, ignored: event.type });
    }
  } catch (error) {
    console.error(`[clerk-webhook] failed to handle ${event.type}`, error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

async function syncUser(data: UserJSON) {
  const email = primaryEmailOf(
    data.primary_email_address_id,
    data.email_addresses.map((address) => ({ id: address.id, emailAddress: address.email_address })),
  );

  if (!email) {
    // e.g. phone-only sign-ups. Retrying won't help, so acknowledge and move on.
    console.warn(`[clerk-webhook] user ${data.id} has no email address; skipped`);
    return NextResponse.json({ ok: true, skipped: "no_email" });
  }

  await upsertUserFromClerk({
    clerkUserId: data.id,
    email,
    signedUpAt: new Date(data.created_at),
  });

  return NextResponse.json({ ok: true });
}
