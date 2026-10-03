import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/lib/db";

const env = vi.hoisted(() => ({
  userId: null as string | null,
  cookie: undefined as string | undefined,
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({ userId: env.userId }),
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (name === "clinora_locale" && env.cookie ? { name, value: env.cookie } : undefined),
  }),
}));

const { GET, PUT } = await import("@/app/api/me/preferences/route");
const { getLocaleContext } = await import("@/lib/i18n/server");

function put(body: unknown) {
  return PUT(
    new Request("http://localhost/api/me/preferences", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

async function createUser(locale?: "en" | "ar") {
  await db.user.create({
    data: { clerkUserId: "user_1", email: "u@example.com", signedUpAt: new Date(), locale },
  });
}

describe("/api/me/preferences", () => {
  beforeEach(() => {
    env.userId = null;
    env.cookie = undefined;
  });

  it("requires a session", async () => {
    expect((await GET()).status).toBe(401);
    expect((await put({ locale: "ar" })).status).toBe(401);
  });

  it("404s while the account isn't in Postgres yet", async () => {
    env.userId = "user_1";
    expect((await GET()).status).toBe(404);
    expect((await put({ locale: "ar" })).status).toBe(404);
  });

  it("returns null until a language is saved, then persists it", async () => {
    env.userId = "user_1";
    await createUser();

    expect(await (await GET()).json()).toEqual({ locale: null });
    const saved = await put({ locale: "ar" });
    expect(saved.status).toBe(200);
    expect(await (await GET()).json()).toEqual({ locale: "ar" });
    expect((await db.user.findUniqueOrThrow({ where: { clerkUserId: "user_1" } })).locale).toBe("ar");
  });

  it("rejects unsupported languages", async () => {
    env.userId = "user_1";
    await createUser();
    expect((await put({ locale: "fr" })).status).toBe(422);
    expect((await put(null)).status).toBe(422);
  });

  it("only ever writes the signed-in user's own row", async () => {
    await db.user.create({ data: { clerkUserId: "other", email: "o@example.com", signedUpAt: new Date(), locale: "en" } });
    env.userId = "user_1";
    await createUser();

    await put({ locale: "ar" });
    expect((await db.user.findUniqueOrThrow({ where: { clerkUserId: "other" } })).locale).toBe("en");
  });
});

describe("getLocaleContext (which language a page renders in)", () => {
  beforeEach(() => {
    env.userId = null;
    env.cookie = undefined;
  });

  it("defaults to English for a new, signed-out visitor", async () => {
    expect(await getLocaleContext()).toEqual({ locale: "en", savedLocale: null, signedIn: false });
  });

  it("uses this device's choice when there is one", async () => {
    env.cookie = "ar";
    expect((await getLocaleContext()).locale).toBe("ar");
  });

  it("uses the account's saved language on a device with no choice yet", async () => {
    env.userId = "user_1";
    await createUser("ar");
    expect(await getLocaleContext()).toEqual({ locale: "ar", savedLocale: "ar", signedIn: true });
  });

  it("lets this device's explicit choice win over the saved one", async () => {
    env.userId = "user_1";
    env.cookie = "en";
    await createUser("ar");
    expect(await getLocaleContext()).toEqual({ locale: "en", savedLocale: "ar", signedIn: true });
  });

  it("ignores a tampered cookie", async () => {
    env.cookie = "xx";
    expect((await getLocaleContext()).locale).toBe("en");
  });
});
