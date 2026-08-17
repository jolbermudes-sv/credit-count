"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCoaster, type CoasterEntry } from "@/actions/coasters";
import { EditCoasterModal } from "@/components/coasters/edit-coaster-modal";
import { AddCoasterModal } from "@/components/coasters/add-coaster-modal";

export function CoasterManagement({ coasters }: { coasters: CoasterEntry[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [editingCoaster, setEditingCoaster] = useState<CoasterEntry | null>(
    null,
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleDeleteClick(coasterId: string) {
    if (confirmingId !== coasterId) {
      setConfirmingId(coasterId);
      return;
    }

    setError(null);
    setPendingId(coasterId);
    startTransition(async () => {
      const result = await deleteCoaster(coasterId);
      setPendingId(null);
      setConfirmingId(null);

      if (!result.success) {
        setError(
          result.error ?? "Could not delete that coaster. Please try again.",
        );
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-ink)]">
            Coaster Inventory
          </h2>
          <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
            {coasters.length} {coasters.length === 1 ? "Coaster" : "Coasters"}{" "}
            Registered
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="rounded-sm border border-[var(--color-rail)] bg-[var(--color-rail)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-card)] transition hover:opacity-90"
        >
          + Add Coaster
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-sm border-l-4 border-[var(--color-ticket-red)] bg-[#FBEAE7] px-3 py-2.5 text-sm text-[#8A2A1E]"
        >
          <span aria-hidden className="mt-0.5">
            &#9888;
          </span>
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {coasters.length === 0 ? (
        <div className="rounded-sm border-2 border-dashed border-[var(--color-line)] bg-[var(--color-card)] px-6 py-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-rail)]">
            No Coasters Registered
          </p>
          <p className="mt-2 text-lg text-[var(--color-ink)]">
            Your coaster inventory will show up here.
          </p>
        </div>
      ) : (
        /* Coaster List */
        <ul className="overflow-hidden rounded-sm border border-[var(--color-line)]">
          {coasters.map((coaster, index) => {
            const isConfirming = confirmingId === coaster.id;
            const isDeleting = pendingId === coaster.id;

            return (
              <li
                key={coaster.id}
                className={`flex flex-col gap-3 bg-[var(--color-card)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                  index === 0
                    ? ""
                    : "border-t border-dashed border-[var(--color-line)]"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-[var(--color-ink)]">
                      {coaster.name}
                    </p>
                    {coaster.status && (
                      <span className="rounded-xs border border-[var(--color-rail)]/25 bg-[var(--color-rail)]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-rail)]">
                        {coaster.status}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-[var(--color-muted)]">
                    {coaster.park} &middot; {coaster.location ?? "Location N/A"}
                  </p>

                  {(coaster.type || coaster.manufacturer) && (
                    <p className="mt-1 text-xs italic text-[var(--color-muted)]">
                      {[coaster.type, coaster.manufacturer]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setEditingCoaster(coaster)}
                    disabled={isPending}
                    className="rounded-sm border border-[var(--color-line)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-rail)] transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Edit
                  </button>

                  {isConfirming && !isPending && (
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      className="text-xs font-semibold uppercase tracking-wide text-[var(--color-rail)]"
                    >
                      Cancel
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteClick(coaster.id)}
                    disabled={isPending}
                    className={`rounded-sm border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      isConfirming
                        ? "border-[var(--color-ticket-red)] bg-[var(--color-ticket-red)] text-[var(--color-card)]"
                        : "border-[var(--color-line)] text-[#8A2A1E]"
                    }`}
                  >
                    {isDeleting
                      ? "Deleting…"
                      : isConfirming
                        ? "Confirm delete?"
                        : "Delete"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Modals */}
      {editingCoaster && (
        <EditCoasterModal
          key={editingCoaster.id}
          coaster={editingCoaster}
          isOpen={!!editingCoaster}
          onClose={() => setEditingCoaster(null)}
        />
      )}

      {isAddOpen && (
        <AddCoasterModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
        />
      )}
    </div>
  );
}
