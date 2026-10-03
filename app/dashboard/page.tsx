import { DashboardView } from "@/components/dashboard/dashboard-view";

// Access is enforced in proxy.ts (Clerk middleware) and re-checked in ./layout.tsx;
// account data loads client-side from /api/me (our Postgres record).
export default function DashboardPage() {
  return <DashboardView />;
}
