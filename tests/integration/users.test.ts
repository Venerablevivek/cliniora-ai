import { describe, expect, it } from "vitest";

import { db } from "@/lib/db";
import { deleteUserByClerkId, primaryEmailOf, upsertUserFromClerk } from "@/lib/users";

const signedUpAt = new Date("2026-09-01T10:00:00.000Z");

describe("primaryEmailOf", () => {
  const addresses = [
    { id: "a", emailAddress: "secondary@example.com" },
    { id: "b", emailAddress: "  Primary@Example.COM " },
  ];

  it("picks the primary address and normalizes it", () => {
    expect(primaryEmailOf("b", addresses)).toBe("primary@example.com");
  });

  it("falls back to the first address when the primary id is unknown", () => {
    expect(primaryEmailOf("missing", addresses)).toBe("secondary@example.com");
  });

  it("returns null when there are no addresses", () => {
    expect(primaryEmailOf(null, [])).toBeNull();
  });
});

describe("upsertUserFromClerk", () => {
  it("creates the local user record", async () => {
    await upsertUserFromClerk({ clerkUserId: "user_1", email: "a@example.com", signedUpAt });

    const user = await db.user.findUniqueOrThrow({ where: { clerkUserId: "user_1" } });
    expect(user.email).toBe("a@example.com");
    expect(user.signedUpAt.toISOString()).toBe(signedUpAt.toISOString());
  });

  it("is idempotent and never overwrites signedUpAt", async () => {
    await upsertUserFromClerk({ clerkUserId: "user_1", email: "a@example.com", signedUpAt });
    await upsertUserFromClerk({
      clerkUserId: "user_1",
      email: "a@example.com",
      signedUpAt: new Date("2030-01-01T00:00:00.000Z"),
    });

    const users = await db.user.findMany();
    expect(users).toHaveLength(1);
    expect(users[0].signedUpAt.toISOString()).toBe(signedUpAt.toISOString());
  });

  it("updates the email on later events", async () => {
    await upsertUserFromClerk({ clerkUserId: "user_1", email: "old@example.com", signedUpAt });
    await upsertUserFromClerk({ clerkUserId: "user_1", email: "new@example.com", signedUpAt });

    const user = await db.user.findUniqueOrThrow({ where: { clerkUserId: "user_1" } });
    expect(user.email).toBe("new@example.com");
  });

  it("releases an email still held by a stale row for a different Clerk user", async () => {
    await upsertUserFromClerk({ clerkUserId: "user_deleted", email: "shared@example.com", signedUpAt });
    await upsertUserFromClerk({ clerkUserId: "user_new", email: "shared@example.com", signedUpAt });

    const users = await db.user.findMany();
    expect(users.map((u) => u.clerkUserId)).toEqual(["user_new"]);
  });

  it("survives concurrent writes for the same user (webhook vs. /api/me fallback)", async () => {
    await Promise.all(
      Array.from({ length: 5 }, () =>
        upsertUserFromClerk({ clerkUserId: "user_race", email: "race@example.com", signedUpAt }),
      ),
    );

    expect(await db.user.count()).toBe(1);
  });

  it("deletes by Clerk id", async () => {
    await upsertUserFromClerk({ clerkUserId: "user_1", email: "a@example.com", signedUpAt });
    await deleteUserByClerkId("user_1");
    await deleteUserByClerkId("user_1"); // deleting twice is a no-op

    expect(await db.user.count()).toBe(0);
  });
});
