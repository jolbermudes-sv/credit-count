// src/app/(admin)/admin/coasters/page.tsx
import { createClient } from "@/lib/supabase/server";
import { CoasterManagement } from "./coaster-management";
import type { Coaster } from "@/types/database";

const INK = "#17233C";
const MUTED = "#5B5638";
const CARD = "#FBF7EC";
const LINE = "#C9BC98";

export default async function AdminCoastersPage() {
  const supabase = await createClient();

  const { data: coasters, error } = await supabase
    .from("coasters")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return (
      <div
        className="rounded-sm border px-6 py-8 text-center"
        style={{ borderColor: LINE, backgroundColor: CARD }}
      >
        <p className="text-sm" style={{ color: "#8A2A1E" }}>
          Failed to load coasters catalog: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: INK }}>
          Coaster Catalog Management
        </h1>
        <p className="text-sm" style={{ color: MUTED }}>
          Add, update, or remove coasters from the global platform database.
        </p>
      </div>

      <CoasterManagement initialCoasters={(coasters as Coaster[]) || []} />
    </div>
  );
}
