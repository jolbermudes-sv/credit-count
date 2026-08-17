// src/app/(admin)/admin/coasters/coaster-management.tsx
"use client";

import { useState, useTransition, useOptimistic, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createCoaster,
  updateCoaster,
  deleteCoaster,
  type CoasterType,
} from "@/actions/admin-coasters";
import type { Coaster } from "@/types/database";

// Design System Tokens
const INK = "#17233C";
const MUTED = "#5B5638";
const CARD = "#FBF7EC";
const LINE = "#C9BC98";
const RAIL = "#3E5C82";
const ERROR = "#8A2A1E";

interface Props {
  initialCoasters: Coaster[];
}

type OptimisticAction =
  | { type: "create"; coaster: Coaster }
  | { type: "update"; coaster: Coaster }
  | { type: "delete"; id: string };

const COASTER_TYPES: CoasterType[] = ["steel", "wooden", "hybrid", "other"];

export function CoasterManagement({ initialCoasters }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Optimistic UI updates
  const [optimisticCoasters, setOptimisticCoasters] = useOptimistic(
    initialCoasters,
    (currentCoasters, action: OptimisticAction) => {
      switch (action.type) {
        case "create":
          return [...currentCoasters, action.coaster];
        case "update":
          return currentCoasters.map((c) =>
            c.id === action.coaster.id ? action.coaster : c,
          );
        case "delete":
          return currentCoasters.filter((c) => c.id !== action.id);
        default:
          return currentCoasters;
      }
    },
  );

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingCoaster, setEditingCoaster] = useState<Coaster | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    park: "",
    country: "",
    manufacturer: "",
    type: "steel" as CoasterType,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const openCreateModal = () => {
    setEditingCoaster(null);
    setFormData({
      name: "",
      park: "",
      country: "",
      manufacturer: "",
      type: "steel",
    });
    setErrorMessage(null);
    setIsOpen(true);
  };

  const openEditModal = (coaster: Coaster) => {
    setEditingCoaster(coaster);
    setFormData({
      name: coaster.name,
      park: coaster.park ?? "",
      country: coaster.country ?? "",
      manufacturer: coaster.manufacturer ?? "",
      type: (coaster.type as CoasterType) ?? "steel",
    });
    setErrorMessage(null);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      if (editingCoaster) {
        const updatedCoaster: Coaster = { ...editingCoaster, ...formData };
        setOptimisticCoasters({ type: "update", coaster: updatedCoaster });

        const res = await updateCoaster(editingCoaster.id, formData);
        if (res.success) {
          setIsOpen(false);
          router.refresh();
        } else {
          setErrorMessage(res.error || "An error occurred while updating.");
        }
      } else {
        const tempCoaster: Coaster = {
          id: `temp-${Date.now()}`,
          ...formData,
        } as Coaster;

        setOptimisticCoasters({ type: "create", coaster: tempCoaster });

        const res = await createCoaster(formData);
        if (res.success) {
          setIsOpen(false);
          router.refresh();
        } else {
          setErrorMessage(res.error || "An error occurred while creating.");
        }
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    startTransition(async () => {
      setOptimisticCoasters({ type: "delete", id });

      const res = await deleteCoaster(id);
      if (res.success) {
        router.refresh();
      } else {
        alert(`Delete failed: ${res.error}`);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-sm px-4 py-2 text-sm font-semibold transition hover:opacity-90"
          style={{ backgroundColor: INK, color: CARD }}
        >
          + Add New Coaster
        </button>
      </div>

      {/* Catalog Table */}
      <div
        className="overflow-hidden rounded-sm border shadow-xs"
        style={{ borderColor: LINE, backgroundColor: CARD }}
      >
        <table className="w-full text-left text-sm">
          <thead>
            <tr
              className="border-b text-xs font-semibold uppercase tracking-wider"
              style={{ borderColor: LINE, color: MUTED }}
            >
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Park</th>
              <th className="px-6 py-3">Country</th>
              <th className="px-6 py-3">Manufacturer</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: LINE }}>
            {optimisticCoasters.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-sm"
                  style={{ color: MUTED }}
                >
                  No coasters found. Click above to add one.
                </td>
              </tr>
            ) : (
              optimisticCoasters.map((coaster) => (
                <tr key={coaster.id} className="transition hover:bg-[#F5F2E9]">
                  <td className="px-6 py-4 font-medium" style={{ color: INK }}>
                    {coaster.name}
                  </td>
                  <td className="px-6 py-4" style={{ color: MUTED }}>
                    {coaster.park ?? "—"}
                  </td>
                  <td className="px-6 py-4" style={{ color: MUTED }}>
                    {coaster.country ?? "—"}
                  </td>
                  <td className="px-6 py-4" style={{ color: MUTED }}>
                    {coaster.manufacturer ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold capitalize"
                      style={{
                        backgroundColor: "#EFE8D3",
                        color: RAIL,
                        border: `1px solid ${LINE}`,
                      }}
                    >
                      {coaster.type ?? "steel"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button
                      type="button"
                      onClick={() => openEditModal(coaster)}
                      disabled={isPending}
                      className="text-xs font-semibold uppercase tracking-wide hover:underline disabled:opacity-50"
                      style={{ color: RAIL }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(coaster.id, coaster.name)}
                      disabled={isPending}
                      className="text-xs font-semibold uppercase tracking-wide hover:underline disabled:opacity-50"
                      style={{ color: ERROR }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-sm border p-6 shadow-lg"
            style={{ backgroundColor: CARD, borderColor: LINE }}
          >
            <h3 className="text-lg font-semibold" style={{ color: INK }}>
              {editingCoaster ? "Edit Coaster" : "Add New Coaster"}
            </h3>

            {errorMessage && (
              <div
                className="mt-3 rounded-sm border p-3 text-xs"
                style={{
                  backgroundColor: "rgba(138, 42, 30, 0.08)",
                  borderColor: "rgba(138, 42, 30, 0.3)",
                  color: ERROR,
                }}
              >
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  className="block text-xs font-medium"
                  style={{ color: MUTED }}
                >
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 w-full rounded-sm border px-3 py-2 text-sm transition outline-none"
                  style={{
                    backgroundColor: "#FAF6EB",
                    borderColor: LINE,
                    color: INK,
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium"
                  style={{ color: MUTED }}
                >
                  Park
                </label>
                <input
                  type="text"
                  required
                  value={formData.park}
                  onChange={(e) =>
                    setFormData({ ...formData, park: e.target.value })
                  }
                  className="mt-1 w-full rounded-sm border px-3 py-2 text-sm transition outline-none"
                  style={{
                    backgroundColor: "#FAF6EB",
                    borderColor: LINE,
                    color: INK,
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-medium"
                    style={{ color: MUTED }}
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="mt-1 w-full rounded-sm border px-3 py-2 text-sm transition outline-none"
                    style={{
                      backgroundColor: "#FAF6EB",
                      borderColor: LINE,
                      color: INK,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-medium"
                    style={{ color: MUTED }}
                  >
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.manufacturer}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        manufacturer: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-sm border px-3 py-2 text-sm transition outline-none"
                    style={{
                      backgroundColor: "#FAF6EB",
                      borderColor: LINE,
                      color: INK,
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-medium"
                  style={{ color: MUTED }}
                >
                  Coaster Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as CoasterType,
                    })
                  }
                  className="mt-1 w-full rounded-sm border px-3 py-2 text-sm capitalize transition outline-none"
                  style={{
                    backgroundColor: "#FAF6EB",
                    borderColor: LINE,
                    color: INK,
                  }}
                >
                  {COASTER_TYPES.map((t) => (
                    <option key={t} value={t} className="capitalize">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-sm px-4 py-2 text-xs font-semibold transition hover:opacity-80"
                  style={{ color: MUTED }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-sm px-4 py-2 text-xs font-semibold transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: INK, color: CARD }}
                >
                  {isPending
                    ? "Saving..."
                    : editingCoaster
                      ? "Update Coaster"
                      : "Create Coaster"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
