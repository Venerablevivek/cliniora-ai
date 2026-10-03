import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { locales } from "@/lib/i18n/config";

const noStore = { "Cache-Control": "private, no-store" };
const preferencesSchema = z.object({ locale: z.enum(locales) });

/** GET /api/me/preferences — the signed-in user's saved preferences (from Postgres). */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401, headers: noStore });

  const user = await db.user.findUnique({ where: { clerkUserId: userId }, select: { locale: true } });
  if (!user) return NextResponse.json({ error: "USER_NOT_SYNCED" }, { status: 404, headers: noStore });

  return NextResponse.json({ locale: user.locale }, { headers: noStore });
}

/** PUT /api/me/preferences — save the signed-in user's preferred language. */
export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401, headers: noStore });

  const parsed = preferencesSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "INVALID_LOCALE" }, { status: 422, headers: noStore });

  // updateMany scopes the write to this user and reports 0 rows instead of throwing
  // if the account hasn't been synced into Postgres yet.
  const { count } = await db.user.updateMany({
    where: { clerkUserId: userId },
    data: { locale: parsed.data.locale },
  });
  if (count === 0) return NextResponse.json({ error: "USER_NOT_SYNCED" }, { status: 404, headers: noStore });

  return NextResponse.json({ locale: parsed.data.locale }, { headers: noStore });
}
