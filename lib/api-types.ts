/** Response contract for `GET /api/me` — shared by the route handler and the dashboard. */
export type MeResponse = { email: string; signedUpAt: string };
export type MeErrorCode = "UNAUTHENTICATED" | "USER_NOT_SYNCED" | "INTERNAL_ERROR";
export type MeErrorResponse = { error: MeErrorCode };
