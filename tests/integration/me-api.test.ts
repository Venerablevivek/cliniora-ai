import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/lib/db";

// Clerk is mocked: these tests are about *our* behaviour once Clerk has identified the user.
const clerk = vi.hoisted(() => ({
  userId: null as string | null,
  getUser: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ userId: clerk.userId }),
  clerkClient: async () => ({ users: { getUser: clerk.getUser } }),
}));

const { GET } = await import("@/app/api/me/route");

describe("GET /api/me", () => {
  beforeEach(() => {
    clerk.userId = null;
    clerk.getUser.mockReset();
  });

  it("returns 401 when there is no session", async () => {
    const response = await GET();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "UNAUTHENTICATED" });
  });

  it("returns the Postgres record — not Clerk's data — and never caches it", async () => {
    await db.user.create({
      data: { clerkUserId: "user_1", email: "from-postgres@example.com", signedUpAt: new Date("2026-09-01T10:00:00Z") },
    });
    clerk.userId = "user_1";
    clerk.getUser.mockResolvedValue({ emailAddresses: [{ id: "x", emailAddress: "from-clerk@example.com" }] });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(await response.json()).toEqual({
      email: "from-postgres@example.com",
      signedUpAt: "2026-09-01T10:00:00.000Z",
    });
    expect(clerk.getUser).not.toHaveBeenCalled();
  });

  it("syncs a missing user from Clerk's Backend API, then serves the stored row", async () => {
    clerk.userId = "user_new";
    clerk.getUser.mockResolvedValue({
      primaryEmailAddressId: "idn_1",
      emailAddresses: [{ id: "idn_1", emailAddress: "New@Example.com" }],
      createdAt: Date.parse("2026-10-01T08:00:00Z"),
    });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ email: "new@example.com", signedUpAt: "2026-10-01T08:00:00.000Z" });
    expect(await db.user.findUnique({ where: { clerkUserId: "user_new" } })).not.toBeNull();
  });

  it("returns 404 USER_NOT_SYNCED when the user can't be synced yet", async () => {
    clerk.userId = "user_phone_only";
    clerk.getUser.mockResolvedValue({ primaryEmailAddressId: null, emailAddresses: [], createdAt: Date.now() });

    const response = await GET();

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "USER_NOT_SYNCED" });
  });
});
