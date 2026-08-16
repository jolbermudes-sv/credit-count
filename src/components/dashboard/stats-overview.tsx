// src/components/dashboard/stats-overview.tsx
import type { DashboardStats } from '@/actions/rides'

const INK = '#17233C'
const CREAM = '#F5EEDA'
const CARD = '#FBF7EC'
const LINE = '#C9BC98'
const RAIL = '#3E5C82'
const MUTED = '#5B5638'
const TRACK_BG = '#E9DFC3'

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="overflow-hidden rounded-sm" style={{ border: `1px solid ${LINE}`, backgroundColor: CARD }}>
      <div className="px-4 py-2" style={{ backgroundColor: INK }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: CREAM }}>
          {label}
        </p>
      </div>
      <div className="px-4 py-4">
        <p className="truncate text-3xl font-semibold" style={{ color: INK }} title={value}>
          {value}
        </p>
        {sub && <p className="mt-1 text-sm" style={{ color: MUTED }}>{sub}</p>}
      </div>
    </div>
  )
}

function BreakdownList({
  title,
  items,
  total,
  emptyLabel,
}: {
  title: string
  items: { label: string; count: number }[]
  total: number
  emptyLabel: string
}) {
  return (
    <div className="overflow-hidden rounded-sm" style={{ border: `1px solid ${LINE}`, backgroundColor: CARD }}>
      <div className="px-4 py-2" style={{ backgroundColor: INK }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: CREAM }}>
          {title}
        </p>
      </div>
      <div className="px-4 py-4">
        {items.length === 0 ? (
          <p className="text-sm" style={{ color: MUTED }}>
            {emptyLabel}
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => {
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
              return (
                <li key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span style={{ color: INK }}>{item.label}</span>
                    <span style={{ color: MUTED }}>{item.count}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: TRACK_BG }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: RAIL }} />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

/** Renders the dashboard's stat cards and breakdowns, or an empty state at 0 rides. */
export function StatsOverview({ stats }: { stats: DashboardStats }) {
  if (stats.totalRides === 0) {
    return (
      <div
        className="rounded-sm border-2 border-dashed px-6 py-12 text-center"
        style={{ borderColor: LINE, backgroundColor: CARD }}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.15em]" style={{ color: RAIL }}>
          Empty Ticket Booth
        </p>
        <p className="mt-2 text-lg" style={{ color: INK }}>
          You haven&apos;t logged any credits yet.
        </p>
        <p className="mt-1 text-sm" style={{ color: MUTED }}>
          Tap &ldquo;Log a Ride&rdquo; to start your count.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Total Credits" value={String(stats.creditCount)} sub="Unique coasters ridden" />
        <SummaryCard label="Total Rides" value={String(stats.totalRides)} sub="All logged rides" />
        <SummaryCard
          label="Most Ridden"
          value={stats.mostRiddenCoaster ? stats.mostRiddenCoaster.name : '—'}
          sub={stats.mostRiddenCoaster ? `${stats.mostRiddenCoaster.count} rides` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <BreakdownList
          title="Credits by Country"
          items={stats.creditsByCountry.map((c) => ({ label: c.country, count: c.count }))}
          total={stats.creditCount}
          emptyLabel="No countries yet."
        />
        <BreakdownList
          title="Credits by Manufacturer"
          items={stats.creditsByManufacturer.map((m) => ({ label: m.manufacturer, count: m.count }))}
          total={stats.creditCount}
          emptyLabel="No manufacturers yet."
        />
        <BreakdownList
          title="Credits by Type"
          items={stats.creditsByType.map((t) => ({ label: capitalize(t.type), count: t.count }))}
          total={stats.creditCount}
          emptyLabel="No coaster types yet."
        />
      </div>
    </div>
  )
}
