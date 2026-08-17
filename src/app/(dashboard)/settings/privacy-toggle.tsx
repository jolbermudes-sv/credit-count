"use client";

import { useState, useTransition } from "react";
import { updatePrivacyPreference } from "@/actions/profile";

const INK = "#17233C";
const MUTED = "#5B5638";
const RAIL = "#3E5C82";
const TRACK_GREEN = "#2F7A4D";
const TICKET_RED = "#C6382A";
const LINE = "#C9BC98";

export function PrivacyToggle({ initialOptIn }: { initialOptIn: boolean }) {
  const [optIn, setOptIn] = useState(initialOptIn);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function handleToggle() {
    const next = !optIn;
    const previous = optIn;

    setOptIn(next); // optimistic — instant visual feedback
    setError(null);

    startTransition(async () => {
      const result = await updatePrivacyPreference(next);

      if (!result.success) {
        setOptIn(previous); // revert on failure
        setError(
          result.error ?? "Could not save your preference. Please try again.",
        );
        return;
      }

      setSavedAt(Date.now());
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold" style={{ color: INK }}>
            Appear on the public leaderboard
          </p>
          <p className="mt-1 text-sm" style={{ color: MUTED }}>
            When on, your display name, credit count, and ride count are visible
            to anyone on the <span className="font-medium">Leaderboard</span>{" "}
            page — including signed-out visitors. Off by default.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={optIn}
          aria-label="Appear on the public leaderboard"
          onClick={handleToggle}
          disabled={isPending}
          className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            backgroundColor: optIn ? TRACK_GREEN : "#E9DFC3",
            borderColor: optIn ? TRACK_GREEN : LINE,
          }}
        >
          <span
            className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
            style={{
              transform: optIn ? "translateX(1.375rem)" : "translateX(0.25rem)",
            }}
          />
        </button>
      </div>

      <div className="min-h-[1.25rem] text-xs">
        {error ? (
          <p style={{ color: TICKET_RED }}>{error}</p>
        ) : isPending ? (
          <p style={{ color: RAIL }}>Saving…</p>
        ) : savedAt ? (
          <p style={{ color: TRACK_GREEN }}>Saved.</p>
        ) : null}
      </div>
    </div>
  );
}
