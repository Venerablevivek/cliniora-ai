import { auth } from "@clerk/nextjs/server";

/**
 * Defense in depth: proxy.ts already redirects signed-out visitors, but the page re-checks
 * the session itself so protection never depends solely on path matching.
 */
export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const { userId, redirectToSignUp } = await auth();
  if (!userId) return redirectToSignUp({ returnBackUrl: "/dashboard" });
  return children;
}
