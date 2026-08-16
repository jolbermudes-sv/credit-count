// src/components/history/ride-history-list.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteRide, type RideHistoryEntry } from '@/actions/rides'

const INK = '#17233C'
const CARD = '#FBF7EC'
const LINE = '#C9BC98'
const MUTED = '#5B5638'
const TICKET_RED = '#C6382A'
const RAIL = '#3E5C82'

function formatRideDate(isoDate: string): string {
  // Appending a local-midnight time avoids the classic "date shifts back a
  // day" bug from parsing a bare YYYY-MM-DD string as UTC midnight in a
  // negative-UTC-offset timezone.
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function RideHistoryList({ rides }: { rides: RideHistoryEntry[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleDeleteClick(rideId: string) {
    if (confirmingId !== rideId) {
      setConfirmingId(rideId)
      return
    }

    setError(null)
    setPendingId(rideId)
    startTransition(async () => {
      const result = await deleteRide(rideId)
      setPendingId(null)
      setConfirmingId(null)

      if (!result.success) {
        setError(result.error ?? 'Could not delete that ride. Please try again.')
        return
      }

      router.refresh()
    })
  }

  if (rides.length === 0) {
    return (
      <div
        className="rounded-sm border-2 border-dashed px-6 py-12 text-center"
        style={{ borderColor: LINE, backgroundColor: CARD }}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.15em]" style={{ color: RAIL }}>
          No Rides Yet
        </p>
        <p className="mt-2 text-lg" style={{ color: INK }}>
          Your ride history will show up here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-sm border-l-4 bg-[#FBEAE7] px-3 py-2.5 text-sm text-[#8A2A1E]"
          style={{ borderColor: TICKET_RED }}
        >
          <span aria-hidden className="mt-0.5">
            &#9888;
          </span>
          <span>{error}</span>
        </div>
      )}

      <ul className="overflow-hidden rounded-sm" style={{ border: `1px solid ${LINE}` }}>
        {rides.map((ride, index) => {
          const isConfirming = confirmingId === ride.id
          const isDeleting = pendingId === ride.id

          return (
            <li
              key={ride.id}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              style={{
                backgroundColor: CARD,
                borderTop: index === 0 ? 'none' : `1px dashed ${LINE}`,
              }}
            >
              <div className="min-w-0">
                <p className="truncate font-semibold" style={{ color: INK }}>
                  {ride.coaster.name}
                </p>
                <p className="text-sm" style={{ color: MUTED }}>
                  {ride.coaster.park} &middot; {formatRideDate(ride.riddenAt)}
                </p>
                {ride.notes && (
                  <p className="mt-1 text-sm italic" style={{ color: MUTED }}>
                    &ldquo;{ride.notes}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                {isConfirming && !isPending && (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(null)}
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: RAIL }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteClick(ride.id)}
                  disabled={isPending}
                  className="rounded-sm border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-60"
                  style={
                    isConfirming
                      ? { backgroundColor: TICKET_RED, borderColor: TICKET_RED, color: '#FBF7EC' }
                      : { borderColor: LINE, color: '#8A2A1E' }
                  }
                >
                  {isDeleting ? 'Deleting…' : isConfirming ? 'Confirm delete?' : 'Delete'}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
