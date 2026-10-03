import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

// Next.js 16 renamed `middleware.ts` to `proxy.ts`; this is Clerk's middleware.
function isDashboard(request: NextRequest) {
  const { pathname } = request.nextUrl;
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export default clerkMiddleware(
  async (auth, request) => {
    if (!isDashboard(request)) return;

    const { userId, redirectToSignUp } = await auth();
    // Visitors without a session land on sign-up (per the brief). The sign-up card links to
    // sign-in for returning users, and Clerk sends both back to the page they asked for.
    if (!userId) return redirectToSignUp({ returnBackUrl: request.url });
  },
  { signInUrl: "/sign-in", signUpUrl: "/sign-up" },
);

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
