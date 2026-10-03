"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import type { MeErrorResponse, MeResponse } from "@/lib/api-types";

export type AccountState =
  | { kind: "loading" }
  | { kind: "syncing" }
  | { kind: "ready"; user: MeResponse; loadedAt: number }
  | { kind: "error" };

// The webhook usually lands within a second or two of sign-up; back off briefly before giving up.
const RETRY_DELAYS_MS = [800, 1500, 3000];
// After a profile change in Clerk, the `user.updated` webhook needs a moment to reach Postgres.
const PROFILE_CHANGE_REFETCH_MS = [1500, 4000, 8000];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type FetchResult = { kind: "ready"; user: MeResponse } | { kind: "unauthenticated" } | { kind: "error" };

/** Load the local account record, retrying while the Clerk webhook is still in flight. */
async function fetchAccount(signal: AbortSignal, onSyncing: () => void): Promise<FetchResult> {
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const response = await fetch("/api/me", { cache: "no-store", signal });
      if (response.ok) return { kind: "ready", user: (await response.json()) as MeResponse };

      const { error } = (await response.json().catch(() => ({}))) as Partial<MeErrorResponse>;
      if (error === "UNAUTHENTICATED") return { kind: "unauthenticated" };
      if (error !== "USER_NOT_SYNCED" || attempt === RETRY_DELAYS_MS.length) break;

      onSyncing();
      await sleep(RETRY_DELAYS_MS[attempt]);
    } catch {
      break;
    }
  }
  return { kind: "error" };
}

/**
 * The signed-in user's account, read exclusively from `GET /api/me` (our Postgres record).
 *
 * Clerk's client state is used only as a *trigger*: when Clerk reports the profile changed
 * (e.g. a new primary email in <UserProfile />), we re-read Postgres. Displayed values always
 * come from our database.
 */
export function useAccount() {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const [state, setState] = useState<AccountState>({ kind: "loading" });
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchAccount(controller.signal, () => setState({ kind: "syncing" })).then((result) => {
      if (controller.signal.aborted) return;
      if (result.kind === "unauthenticated") router.replace("/sign-in?redirect_url=/dashboard");
      else if (result.kind === "ready") setState({ ...result, loadedAt: Date.now() });
      // A failed background refresh shouldn't wipe out data we already have.
      else setState((current) => (current.kind === "ready" ? current : result));
    });
    return () => controller.abort();
  }, [router, requestId]);

  /** Re-read Postgres without flashing the loading state. */
  const refresh = useCallback(() => setRequestId((id) => id + 1), []);

  const retry = useCallback(() => {
    setState({ kind: "loading" });
    refresh();
  }, [refresh]);

  // Refetch when the tab regains focus (e.g. after editing the profile elsewhere).
  useEffect(() => {
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  // Refetch a few times after Clerk reports a profile change, while the webhook catches up.
  const clerkUpdatedAt = clerkUser?.updatedAt?.getTime();
  const lastSeenUpdate = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (clerkUpdatedAt === undefined) return;
    const previous = lastSeenUpdate.current;
    lastSeenUpdate.current = clerkUpdatedAt;
    if (previous === undefined || previous === clerkUpdatedAt) return;

    const timers = PROFILE_CHANGE_REFETCH_MS.map((delay) => setTimeout(refresh, delay));
    return () => timers.forEach(clearTimeout);
  }, [clerkUpdatedAt, refresh]);

  return { state, retry, refresh };
}
