import { NextResponse } from "next/server";

import { toFieldErrors, waitlistSchema, type WaitlistResponse } from "@/lib/validators";
import { joinWaitlist } from "@/lib/waitlist";

function respond(body: WaitlistResponse, status: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
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

  try {
    const result = await joinWaitlist(parsed.data);
    // Deliberately no queue details for duplicates: knowing an email must not reveal
    // someone's referral link or position.
    return result.status === "joined" ? respond(result, 201) : respond(result, 409);
  } catch (error) {
    console.error("[waitlist] failed to save entry", error);
    return respond({ status: "error" }, 500);
  }
}
