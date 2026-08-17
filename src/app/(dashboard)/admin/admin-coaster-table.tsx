//src\app\(dashboard)\admin\admin-coaster-table.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export type CoasterType = "steel" | "wooden" | "hybrid" | "other";

interface Coaster {
  id: string;
  name: string;
  park: string;
  country: string;
  type: CoasterType;
  manufacturer: string;
  is_active?: boolean;
}

interface CoasterFormData {
  name: string;
  park: string;
  country: string;
  type: CoasterType;
  manufacturer: string;
  is_active: boolean;
}

export default function AdminCoasterTable({
  initialCoasters,
}: {
  initialCoasters: Coaster[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [coasters, setCoasters] = useState<Coaster[]>(initialCoasters);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CoasterFormData>({
    name: "",
    park: "",
    country: "",
    type: "steel",
    manufacturer: "",
    is_active: true,
  });
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      park: "",
      country: "",
      type: "steel",
      manufacturer: "",
      is_active: true,
    });
    setError(null);
  };

  const handleEdit = (coaster: Coaster) => {
    setEditingId(coaster.id);
    setFormData({
      name: coaster.name,
      park: coaster.park,
      country: coaster.country,
      type: coaster.type,
      manufacturer: coaster.manufacturer,
      is_active: coaster.is_active ?? true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (editingId) {
      // Update Coaster
      const { error: updateError } = await supabase
        .from("coasters")
        .update(formData)
        .eq("id", editingId);

      if (updateError) {
        setError(updateError.message);
        return;
      }
    } else {
      // Insert Coaster
      const { error: insertError } = await supabase
        .from("coasters")
        .insert([formData]);

      if (insertError) {
        setError(insertError.message);
        return;
      }
    }

    resetForm();
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coaster?")) return;

    const { error: deleteError } = await supabase
      .from("coasters")
      .update({ is_active: false })
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setCoasters(coasters.filter((c) => c.id !== id));
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Add / Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border rounded bg-slate-50 space-y-4"
      >
        <h2 className="text-lg font-semibold">
          {editingId ? "Edit Coaster" : "Add New Coaster"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Coaster Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Park Name"
            value={formData.park}
            onChange={(e) => setFormData({ ...formData, park: e.target.value })}
            required
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Country"
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            required
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Manufacturer"
            value={formData.manufacturer}
            onChange={(e) =>
              setFormData({ ...formData, manufacturer: e.target.value })
            }
            required
            className="p-2 border rounded"
          />
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as CoasterType })
            }
            className="p-2 border rounded"
          >
            <option value="steel">Steel</option>
            <option value="wooden">Wooden</option>
            <option value="hybrid">Hybrid</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editingId ? "Update Coaster" : "Add Coaster"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Coasters Table */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Park
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Manufacturer
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {coasters.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-2 font-medium">{c.name}</td>
                <td className="px-4 py-2">{c.park}</td>
                <td className="px-4 py-2 capitalize">{c.type}</td>
                <td className="px-4 py-2">{c.manufacturer}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-600 hover:text-red-900 text-sm font-semibold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
