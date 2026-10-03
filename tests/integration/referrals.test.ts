import { describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/waitlist/route";
import { GET as getStatus } from "@/app/api/waitlist/status/route";
import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";

type Joined = { status: "joined"; referralCode: string; position: number; total: number; referralCount: number };

async function join(name: string, email: string, ref?: string) {
  const response = await POST(
    new Request("http://localhost/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, ref }),
    }),
  );
  return { response, body: (await response.json()) as Joined & { status: string } };
}

async function status(code: string) {
  const response = await getStatus(new Request(`http://localhost/api/waitlist/status?code=${code}`));
  return { response, body: await response.json() };
}

describe("waitlist referrals", () => {
  it("gives every new entry a unique 8-character code and a first-come position", async () => {
    const a = await join("Ada", "ada@example.com");
    const b = await join("Ben", "ben@example.com");
    const c = await join("Cyd", "cyd@example.com");

    expect(a.body.referralCode).toMatch(/^[0-9A-Z]{8}$/);
    expect(new Set([a.body.referralCode, b.body.referralCode, c.body.referralCode]).size).toBe(3);
    expect([a.body.position, b.body.position, c.body.position]).toEqual([1, 2, 3]);
    expect(c.body.total).toBe(3);
  });

  it("credits the referrer and links the new entry to them", async () => {
    const ada = await join("Ada", "ada@example.com");
    const ben = await join("Ben", "ben@example.com", ada.body.referralCode);

    expect(ben.response.status).toBe(201);
    const [adaRow, benRow] = await Promise.all([
      db.waitlistEntry.findUniqueOrThrow({ where: { email: "ada@example.com" } }),
      db.waitlistEntry.findUniqueOrThrow({ where: { email: "ben@example.com" } }),
    ]);
    expect(adaRow.referralCount).toBe(1);
    expect(benRow.referredById).toBe(adaRow.id);
  });

  it("ranks by referrals first, then by who joined earlier", async () => {
    const ada = await join("Ada", "ada@example.com");
    const ben = await join("Ben", "ben@example.com");
    const cyd = await join("Cyd", "cyd@example.com");
    await join("Dee", "dee@example.com", cyd.body.referralCode); // Cyd: 1 referral

    expect((await status(cyd.body.referralCode)).body).toMatchObject({ position: 1, referralCount: 1, total: 4 });
    expect((await status(ada.body.referralCode)).body).toMatchObject({ position: 2, referralCount: 0 });
    expect((await status(ben.body.referralCode)).body).toMatchObject({ position: 3, referralCount: 0 });

    // Ben catches up with one referral: tied with Cyd, and Ben joined earlier, so Ben leads.
    await join("Eve", "eve@example.com", ben.body.referralCode);
    expect((await status(ben.body.referralCode)).body.position).toBe(1);
    expect((await status(cyd.body.referralCode)).body.position).toBe(2);
    expect((await status(ada.body.referralCode)).body.position).toBe(3);
  });

  it("gives every entry a distinct position (no ties shown to users)", async () => {
    const codes: string[] = [];
    for (let i = 0; i < 6; i++) codes.push((await join(`P${i}`, `p${i}@example.com`)).body.referralCode);
    const positions = await Promise.all(codes.map(async (code) => (await status(code)).body.position));
    expect([...positions].sort((x, y) => x - y)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("accepts lowercase codes from a hand-typed link", async () => {
    const ada = await join("Ada", "ada@example.com");
    await join("Ben", "ben@example.com", ada.body.referralCode.toLowerCase());
    expect((await status(ada.body.referralCode)).body.referralCount).toBe(1);
  });

  it("ignores unknown or malformed codes but still lets the person join", async () => {
    const ada = await join("Ada", "ada@example.com");
    const unknown = await join("Ben", "ben@example.com", "ZZZZZZZZ");
    const malformed = await join("Cyd", "cyd@example.com", "not a code!");

    expect(unknown.response.status).toBe(201);
    expect(malformed.response.status).toBe(201);
    expect((await status(ada.body.referralCode)).body.referralCount).toBe(0);
  });

  it("never counts a duplicate sign-up as a referral", async () => {
    const ada = await join("Ada", "ada@example.com");
    await join("Ben", "ben@example.com");
    const dup = await join("Ben again", "BEN@example.com", ada.body.referralCode);

    expect(dup.response.status).toBe(409);
    expect(dup.body).toEqual({ status: "already_joined" }); // no code or position leaked
    expect((await status(ada.body.referralCode)).body.referralCount).toBe(0);
  });

  it("counts concurrent referrals exactly", async () => {
    const ada = await join("Ada", "ada@example.com");
    await Promise.all(
      Array.from({ length: 10 }, (_, i) => join(`Friend ${i}`, `friend${i}@example.com`, ada.body.referralCode)),
    );

    expect((await status(ada.body.referralCode)).body.referralCount).toBe(10);
    expect(await db.waitlistEntry.count({ where: { referredBy: { referralCode: ada.body.referralCode } } })).toBe(10);
  });

  it("retries once if a cold database can't start the transaction in time (P2028)", async () => {
    const timeout = new Prisma.PrismaClientKnownRequestError("Unable to start a transaction in the given time.", {
      code: "P2028",
      clientVersion: "test",
    });
    const spy = vi.spyOn(db, "$transaction").mockRejectedValueOnce(timeout);

    const ada = await join("Ada", "ada@example.com");

    expect(ada.response.status).toBe(201);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(await db.waitlistEntry.count()).toBe(1);
    spy.mockRestore();
  });

  it("keeps referred entries if the referrer is removed", async () => {
    const ada = await join("Ada", "ada@example.com");
    await join("Ben", "ben@example.com", ada.body.referralCode);
    await db.waitlistEntry.delete({ where: { email: "ada@example.com" } });

    const ben = await db.waitlistEntry.findUniqueOrThrow({ where: { email: "ben@example.com" } });
    expect(ben.referredById).toBeNull();
  });
});

describe("GET /api/waitlist/status", () => {
  it("returns position and counts — never a name or email", async () => {
    const ada = await join("Ada Lovelace", "ada@example.com");
    const { response, body } = await status(ada.body.referralCode.toLowerCase());

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(body).toEqual({ referralCode: ada.body.referralCode, position: 1, total: 1, referralCount: 0 });
    expect(JSON.stringify(body)).not.toMatch(/Ada|example\.com/);
  });

  it("404s for unknown codes and 400s for malformed ones", async () => {
    expect((await status("ZZZZZZZZ")).response.status).toBe(404);
    expect((await status("nope")).response.status).toBe(400);
    expect((await getStatus(new Request("http://localhost/api/waitlist/status"))).status).toBe(400);
  });
});
