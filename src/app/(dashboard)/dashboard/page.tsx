// src/app/(dashboard)/dashboard/page.tsx
import { getUserDashboardData } from "@/actions/rides";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { LogRideModal } from "@/components/dashboard/log-ride-modal";

export default async function DashboardPage() {
  const result = await getUserDashboardData();

  // The (dashboard) layout already redirects unauthenticated requests to
  // /login. A failure here is either a transient DB error or a session that
  // expired between that check and this render — either way, the person is
  // still authenticated as far as the UI shell is concerned, so we degrade
  // to an inline message rather than bouncing them off the page.
  if (!result.success || !result.data) {
    return (
      <div
        className="rounded-sm border px-6 py-8 text-center"
        style={{ borderColor: "#C9BC98", backgroundColor: "#FBF7EC" }}
      >
        <p className="text-sm" style={{ color: "#8A2A1E" }}>
          {result.error ??
            "We couldn't load your dashboard. Please refresh the page."}
        </p>
      </div>
    );
  }

  const stats = result.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "#17233C" }}>
            Welcome back, {stats.displayName}
          </h1>
          <p className="text-sm" style={{ color: "#5B5638" }}>
            {stats.totalRides === 0
              ? "Log your first ride to start your credit count."
              : `You've logged ${stats.creditCount} credit${stats.creditCount === 1 ? "" : "s"} across ${stats.totalRides} ride${stats.totalRides === 1 ? "" : "s"}.`}
          </p>
        </div>

        <LogRideModal />
      </div>

      <StatsOverview stats={stats} />
    </div>
  );
}
