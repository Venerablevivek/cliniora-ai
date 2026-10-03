/**
 * Sends a Svix-signed Clerk webhook to the local app — handy for testing user sync
 * without exposing localhost through a tunnel.
 *
 *   node --env-file=.env scripts/simulate-clerk-webhook.mjs user.created user_123 jane@example.com
 *   node --env-file=.env scripts/simulate-clerk-webhook.mjs user.updated user_123 jane.new@example.com
 *   node --env-file=.env scripts/simulate-clerk-webhook.mjs user.deleted user_123
 */
import { randomUUID } from "node:crypto";
import { Webhook } from "svix";

const [type = "user.created", userId = `user_${Date.now()}`, email = "test.user@example.com"] =
  process.argv.slice(2);
const url = process.env.WEBHOOK_URL ?? "http://localhost:3000/api/webhooks/clerk";
const secret = process.env.CLERK_WEBHOOK_SECRET;

if (!secret) {
  console.error("CLERK_WEBHOOK_SECRET is not set (run with --env-file=.env).");
  process.exit(1);
}

const now = Date.now();
const data =
  type === "user.deleted"
    ? { id: userId, object: "user", deleted: true }
    : {
        id: userId,
        object: "user",
        primary_email_address_id: "idn_primary",
        email_addresses: [{ id: "idn_primary", object: "email_address", email_address: email }],
        created_at: now,
        updated_at: now,
      };

const payload = JSON.stringify({ type, object: "event", data });
const msgId = `msg_${randomUUID()}`;
const timestamp = new Date();
const signature = new Webhook(secret).sign(msgId, timestamp, payload);

const response = await fetch(url, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "svix-id": msgId,
    "svix-timestamp": Math.floor(timestamp.getTime() / 1000).toString(),
    "svix-signature": signature,
  },
  body: payload,
});

console.log(`${type} ${userId} → ${response.status}`, await response.text());
