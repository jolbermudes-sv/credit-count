// src/app/(dashboard)/coasters/page.tsx
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
      <div className="border-line bg-card rounded-sm border px-6 py-8 text-center">
        <p className="text-error text-sm">
          Failed to load coasters catalog: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-ink text-2xl font-semibold">
          Coaster Catalog Management
        </h1>
        <p className="text-muted text-sm">
          Add, update, or remove coasters from the global platform database.
        </p>
      </div>

      <CoasterManagement initialCoasters={(coasters as Coaster[]) || []} />
    </div>
  );
}
