import { describe, expect, it } from "vitest";

import { POST } from "@/app/api/webhooks/clerk/route";
import { db } from "@/lib/db";
import { clerkUserEvent, signedClerkRequest } from "@/tests/support/clerk-webhook";

const createdAt = Date.parse("2026-09-01T10:00:00.000Z");

describe("POST /api/webhooks/clerk", () => {
  it("rejects requests with an invalid signature", async () => {
    const request = signedClerkRequest(clerkUserEvent("user.created", { id: "user_1", email: "a@example.com" }), "whsec_d3Jvbmctc2VjcmV0LXdyb25nLXNlY3JldA==");

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(await db.user.count()).toBe(0);
  });

  it("rejects unsigned requests", async () => {
    const response = await POST(
      new Request("http://localhost/api/webhooks/clerk", { method: "POST", body: "{}" }),
    );
    expect(response.status).toBe(400);
  });

  it("creates the user on user.created with Clerk's sign-up timestamp", async () => {
    const response = await POST(
      signedClerkRequest(clerkUserEvent("user.created", { id: "user_1", email: "Jane@Example.com", createdAt })),
    );

    expect(response.status).toBe(200);
    const user = await db.user.findUniqueOrThrow({ where: { clerkUserId: "user_1" } });
    expect(user.email).toBe("jane@example.com");
    expect(user.signedUpAt.getTime()).toBe(createdAt);
  });

  it("handles redelivery of the same event idempotently", async () => {
    const event = clerkUserEvent("user.created", { id: "user_1", email: "jane@example.com", createdAt });
    await POST(signedClerkRequest(event));
    await POST(signedClerkRequest(event));

    expect(await db.user.count()).toBe(1);
  });

  it("updates the email on user.updated", async () => {
    await POST(signedClerkRequest(clerkUserEvent("user.created", { id: "user_1", email: "old@example.com", createdAt })));
    await POST(signedClerkRequest(clerkUserEvent("user.updated", { id: "user_1", email: "new@example.com", createdAt })));

    const user = await db.user.findUniqueOrThrow({ where: { clerkUserId: "user_1" } });
    expect(user.email).toBe("new@example.com");
    expect(user.signedUpAt.getTime()).toBe(createdAt);
  });

  it("removes the user on user.deleted", async () => {
    await POST(signedClerkRequest(clerkUserEvent("user.created", { id: "user_1", email: "a@example.com" })));
    const response = await POST(
      signedClerkRequest({ type: "user.deleted", object: "event", data: { id: "user_1", deleted: true } }),
    );

    expect(response.status).toBe(200);
    expect(await db.user.count()).toBe(0);
  });

  it("acknowledges (without retrying) users that have no email", async () => {
    const response = await POST(signedClerkRequest(clerkUserEvent("user.created", { id: "user_phone", email: null })));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ skipped: "no_email" });
    expect(await db.user.count()).toBe(0);
  });

  it("ignores unrelated event types", async () => {
    const response = await POST(signedClerkRequest({ type: "session.created", object: "event", data: { id: "sess_1" } }));
    expect(response.status).toBe(200);
  });
});
