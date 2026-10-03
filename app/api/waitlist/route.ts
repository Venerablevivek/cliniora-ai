import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { isUniqueConstraintError } from "@/lib/prisma-errors";
import { toFieldErrors, waitlistSchema, type WaitlistResponse } from "@/lib/validators";

function respond(body: WaitlistResponse, status: number) {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return respond({ status: "error" }, 400);
  }

  const parsed = waitlistSchema.safeParse(payload);
  if (!parsed.success) {
    return respond({ status: "invalid", fieldErrors: toFieldErrors(parsed.error) }, 422);
  }

  const { name, email } = parsed.data;

  try {
    // Rely on the unique index rather than a read-then-write, which would race.
    await db.waitlistEntry.create({ data: { name, email } });
    return respond({ status: "joined", name }, 201);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return respond({ status: "already_joined" }, 409);
    }
    console.error("[waitlist] failed to save entry", error);
    return respond({ status: "error" }, 500);
  }
}
