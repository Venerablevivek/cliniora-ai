import { normalizeReferralCode } from "@/lib/validators";

/**
 * Browser-side memory for the waitlist:
 * - the invite code someone arrived with (so it survives navigating around the site), and
 * - the visitor's own code after joining (so they can see their live spot when they return).
 * Storage can be unavailable (private mode, blocked cookies), so every access is guarded.
 */
const INVITE_KEY = "clinora_invite_code";
const OWN_KEY = "clinora_waitlist_code";

function read(key: string): string | null {
  try {
    return normalizeReferralCode(window.localStorage.getItem(key));
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
  } catch {
    // Non-essential convenience; ignore.
  }
}

/** `?ref=` from the current URL, if it's a well-formed code. */
export function readInviteFromUrl(): string | null {
  return normalizeReferralCode(new URLSearchParams(window.location.search).get("ref"));
}

export const readStoredInvite = () => read(INVITE_KEY);
export const storeInvite = (code: string | null) => write(INVITE_KEY, code);
export const readOwnCode = () => read(OWN_KEY);
export const storeOwnCode = (code: string | null) => write(OWN_KEY, code);

/** Shareable invite URL for a code, on the current site. */
export function inviteUrl(code: string): string {
  const url = new URL("/", window.location.origin);
  url.searchParams.set("ref", code);
  url.hash = "waitlist";
  return url.toString();
}
