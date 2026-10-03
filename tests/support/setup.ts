import { afterAll, beforeEach } from "vitest";

import { db } from "@/lib/db";

// Every test starts from empty tables.
beforeEach(async () => {
  await db.$executeRawUnsafe('TRUNCATE TABLE "User", "WaitlistEntry"');
});

afterAll(async () => {
  await db.$disconnect();
});
