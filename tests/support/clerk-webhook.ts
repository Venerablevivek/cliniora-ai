import { randomUUID } from "node:crypto";

import { Webhook } from "svix";

/** Build a request signed exactly like Clerk (via Svix) would sign it. */
export function signedClerkRequest(payload: unknown, secret = process.env.CLERK_WEBHOOK_SECRET!) {
  const body = JSON.stringify(payload);
  const id = `msg_${randomUUID()}`;
  const timestamp = new Date();
  const signature = new Webhook(secret).sign(id, timestamp, body);

  return new Request("http://localhost/api/webhooks/clerk", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "svix-id": id,
      "svix-timestamp": Math.floor(timestamp.getTime() / 1000).toString(),
      "svix-signature": signature,
    },
    body,
  });
}

export function clerkUserEvent(
  type: "user.created" | "user.updated",
  { id, email, createdAt = Date.now() }: { id: string; email: string | null; createdAt?: number },
) {
  return {
    type,
    object: "event",
    data: {
      id,
      object: "user",
      created_at: createdAt,
      updated_at: Date.now(),
      primary_email_address_id: email ? "idn_primary" : null,
      email_addresses: email ? [{ id: "idn_primary", object: "email_address", email_address: email }] : [],
    },
  };
}
