import { NextResponse } from "next/server";

import { normalizeReferralCode } from "@/lib/validators";
import { getQueueStatusByCode } from "@/lib/waitlist";

const noStore = { "Cache-Control": "no-store" };

/**
 * GET /api/waitlist/status?code=XXXXXXXX
 * Queue position and referral count for a code. Returns no name or email: referral codes are
 * shared publicly in invite links, so this must not identify the person behind one.
 */
export async function GET(request: Request) {
  const code = normalizeReferralCode(new URL(request.url).searchParams.get("code"));
  if (!code) {
    return NextResponse.json({ error: "INVALID_CODE" }, { status: 400, headers: noStore });
  }

  try {
    const status = await getQueueStatusByCode(code);
    if (!status) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404, headers: noStore });
    return NextResponse.json(status, { headers: noStore });
  } catch (error) {
    console.error("[waitlist/status] lookup failed", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500, headers: noStore });
  }
}
