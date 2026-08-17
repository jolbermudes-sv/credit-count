// src/app/(admin)/admin/coasters/page.tsx
import { createClient } from "@/lib/supabase/server";
import { CoasterManagement } from "./coaster-management";
import type { Coaster } from "@/types/database";

export default async function AdminCoastersPage() {
  const supabase = await createClient();

  const { data: coasters, error } = await supabase
    .from("coasters")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
        Failed to load coasters catalog: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Coaster Catalog Management
          </h2>
          <p className="text-sm text-slate-400">
            Add, update, or remove coasters from the global platform database.
          </p>
        </div>
      </div>

      <CoasterManagement initialCoasters={(coasters as Coaster[]) || []} />
    </div>
  );
}
