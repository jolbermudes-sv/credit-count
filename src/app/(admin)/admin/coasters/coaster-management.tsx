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

  // Optimistic UI updates synced with server revalidation
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

  // Close modal on Escape key press
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
      park: coaster.park,
      country: coaster.country,
      manufacturer: coaster.manufacturer,
      type: coaster.type as CoasterType,
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
        // Temporary optimistic object while server processes
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
          onClick={openCreateModal}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          + Add New Coaster
        </button>
      </div>

      {/* Catalog Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/50 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Park</th>
              <th className="px-6 py-3 font-semibold">Country</th>
              <th className="px-6 py-3 font-semibold">Manufacturer</th>
              <th className="px-6 py-3 font-semibold">Type</th>
              <th className="px-6 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {optimisticCoasters.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No coasters found. Click above to add one.
                </td>
              </tr>
            ) : (
              optimisticCoasters.map((coaster) => (
                <tr
                  key={coaster.id}
                  className="transition hover:bg-slate-800/40"
                >
                  <td className="px-6 py-4 font-medium text-white">
                    {coaster.name}
                  </td>
                  <td className="px-6 py-4">{coaster.park}</td>
                  <td className="px-6 py-4">{coaster.country}</td>
                  <td className="px-6 py-4">{coaster.manufacturer}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-300">
                      {coaster.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(coaster)}
                      disabled={isPending}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(coaster.id, coaster.name)}
                      disabled={isPending}
                      className="text-xs font-semibold text-rose-400 hover:text-rose-300 disabled:opacity-50"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white">
              {editingCoaster ? "Edit Coaster" : "Add New Coaster"}
            </h3>

            {errorMessage && (
              <div className="mt-3 rounded-md border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400">
                  Park
                </label>
                <input
                  type="text"
                  required
                  value={formData.park}
                  onChange={(e) =>
                    setFormData({ ...formData, park: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400">
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
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400">
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
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white capitalize focus:border-indigo-500 focus:outline-none"
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
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
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
