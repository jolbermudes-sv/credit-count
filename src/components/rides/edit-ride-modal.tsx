"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateRide, type RideHistoryEntry } from "@/actions/rides";

const INK = "#17233C";
const CARD = "#FBF7EC";
const LINE = "#C9BC98";
const MUTED = "#5B5638";
const RAIL = "#3E5C82";
const TICKET_RED = "#C6382A";

interface EditRideModalProps {
  ride: RideHistoryEntry;
  isOpen: boolean;
  onClose: () => void;
}

export function EditRideModal({ ride, isOpen, onClose }: EditRideModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [riddenAt, setRiddenAt] = useState(ride.riddenAt);
  const [notes, setNotes] = useState(ride.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateRide(ride.id, {
        ridden_at: riddenAt,
        notes: notes,
      });

      if (!result.success) {
        setError(result.error ?? "Could not update ride. Please try again.");
        return;
      }

      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div
        className="w-full max-w-md rounded-sm border-2 p-6 shadow-xl"
        style={{ backgroundColor: CARD, borderColor: LINE }}
      >
        <div
          className="flex items-center justify-between border-b pb-3"
          style={{ borderColor: LINE }}
        >
          <h2
            className="text-sm font-bold uppercase tracking-wider"
            style={{ color: INK }}
          >
            Edit Ride &middot; {ride.coaster.name}
          </h2>
          <button
            onClick={onClose}
            className="text-lg font-bold transition hover:opacity-75"
            style={{ color: MUTED }}
            type="button"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-sm border-l-4 bg-[#FBEAE7] px-3 py-2 text-sm text-[#8A2A1E]"
            style={{ borderColor: TICKET_RED }}
          >
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              className="mb-1 block text-xs font-semibold uppercase tracking-wider"
              style={{ color: MUTED }}
            >
              Date Ridden
            </label>
            <input
              type="date"
              value={riddenAt}
              onChange={(e) => setRiddenAt(e.target.value)}
              required
              className="w-full rounded-sm border px-3 py-2 text-sm focus:outline-none"
              style={{
                borderColor: LINE,
                backgroundColor: "#FFFDF7",
                color: INK,
              }}
            />
          </div>

          <div>
            <label
              className="mb-1 block text-xs font-semibold uppercase tracking-wider"
              style={{ color: MUTED }}
            >
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Row, seat, weather, thoughts..."
              className="w-full rounded-sm border px-3 py-2 text-sm focus:outline-none"
              style={{
                borderColor: LINE,
                backgroundColor: "#FFFDF7",
                color: INK,
              }}
            />
          </div>

          <div
            className="flex justify-end gap-2 border-t pt-3"
            style={{ borderColor: LINE }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-sm border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition disabled:opacity-60"
              style={{ borderColor: LINE, color: MUTED }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-sm px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition disabled:opacity-60"
              style={{ backgroundColor: RAIL, color: CARD }}
            >
              {isPending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
