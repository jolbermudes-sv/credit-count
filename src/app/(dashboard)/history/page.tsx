// src/app/(dashboard)/history/page.tsx
import { getUserRideHistory } from "@/actions/rides";
import { RideHistoryList } from "@/components/history/ride-history-list";

export default async function HistoryPage() {
  const result = await getUserRideHistory();

  if (!result.success || !result.data) {
    return (
      <div
        className="rounded-sm border px-6 py-8 text-center"
        style={{ borderColor: "#C9BC98", backgroundColor: "#FBF7EC" }}
      >
        <p className="text-sm" style={{ color: "#8A2A1E" }}>
          {result.error ??
            "We couldn't load your ride history. Please refresh the page."}
        </p>
      </div>
    );
  }

  const rides = result.data;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "#17233C" }}>
          Ride History
        </h1>
        <p className="text-sm" style={{ color: "#5B5638" }}>
          {rides.length === 0
            ? "Nothing logged yet."
            : `${rides.length} ride${rides.length === 1 ? "" : "s"} logged, most recent first.`}
        </p>
      </div>

      <RideHistoryList rides={rides} />
    </div>
  );
}
