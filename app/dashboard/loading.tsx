/** Instant skeleton while the dashboard route (and its server-side auth check) resolves. */
export default function DashboardLoading() {
  return (
    <div className="flex min-h-dvh flex-col bg-hero" aria-busy>
      <div className="h-[72px] border-b border-line/70 bg-white/80" />
      <div className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-8 sm:px-6 lg:px-8">
        <div className="h-[220px] animate-pulse rounded-[32px] bg-primary/15" />
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="h-[260px] animate-pulse rounded-[28px] bg-white" />
            <div className="h-[240px] animate-pulse rounded-[28px] bg-white" />
          </div>
          <div className="h-[420px] animate-pulse rounded-[28px] bg-white" />
        </div>
      </div>
    </div>
  );
}
