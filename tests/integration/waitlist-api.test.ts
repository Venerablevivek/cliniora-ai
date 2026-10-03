import { describe, expect, it } from "vitest";

import { POST } from "@/app/api/waitlist/route";
import { db } from "@/lib/db";

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("POST /api/waitlist", () => {
  it("saves a normalized entry and returns 201", async () => {
    const response = await post({ name: "  Lina Haddad ", email: " Lina@Example.COM " });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ status: "joined", name: "Lina Haddad" });

    const entry = await db.waitlistEntry.findUniqueOrThrow({ where: { email: "lina@example.com" } });
    expect(entry.name).toBe("Lina Haddad");
    expect(entry.createdAt).toBeInstanceOf(Date);
  });

  it("treats the same email in different casing as a duplicate (409)", async () => {
    await post({ name: "Lina", email: "lina@example.com" });
    const response = await post({ name: "Lina again", email: "LINA@example.com" });

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ status: "already_joined" });
    expect(await db.waitlistEntry.count()).toBe(1);
  });

  it("returns per-field error codes for invalid input (422)", async () => {
    const response = await post({ name: "", email: "not-an-email" });

    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      status: "invalid",
      fieldErrors: { name: "name_required", email: "email_invalid" },
    });
    expect(await db.waitlistEntry.count()).toBe(0);
  });

  it("rejects malformed JSON (400)", async () => {
    const response = await post("{not json");
    expect(response.status).toBe(400);
  });
});
