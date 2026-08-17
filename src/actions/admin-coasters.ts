// src/actions/admin-coasters.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/actions/rides";
import type { Coaster } from "@/types/database";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type CoasterType = Coaster["type"];

export interface CreateCoasterPayload {
  name: string;
  park: string;
  country: string;
  manufacturer: string;
  type: CoasterType;
}

export type UpdateCoasterPayload = Partial<CreateCoasterPayload>;

/** Verifica que el usuario autenticado tenga el rol de administrador en la tabla de perfiles. */
async function verifyAdminRole(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<boolean> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  return profile?.is_admin === true;
}

// ---------------------------------------------------------------------------
// createCoaster
// ---------------------------------------------------------------------------

export async function createCoaster(
  payload: CreateCoasterPayload,
): Promise<ActionResult<Coaster>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be signed in." };
  }

  const isAdmin = await verifyAdminRole(supabase, user.id);
  if (!isAdmin) {
    return { success: false, error: "Unauthorized: Admin access required." };
  }

  const { data, error } = await supabase
    .from("coasters")
    .insert({
      name: payload.name.trim(),
      park: payload.park.trim(),
      country: payload.country.trim(),
      manufacturer: payload.manufacturer.trim(),
      type: payload.type,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/catalog");
  revalidatePath("/admin/coasters");

  return { success: true, data };
}

// ---------------------------------------------------------------------------
// updateCoaster
// ---------------------------------------------------------------------------

export async function updateCoaster(
  coasterId: string,
  payload: UpdateCoasterPayload,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be signed in." };
  }

  const isAdmin = await verifyAdminRole(supabase, user.id);
  if (!isAdmin) {
    return { success: false, error: "Unauthorized: Admin access required." };
  }

  const updateData: Partial<Coaster> = {};
  if (payload.name) updateData.name = payload.name.trim();
  if (payload.park) updateData.park = payload.park.trim();
  if (payload.country) updateData.country = payload.country.trim();
  if (payload.manufacturer)
    updateData.manufacturer = payload.manufacturer.trim();
  if (payload.type) updateData.type = payload.type;

  const { error, count } = await supabase
    .from("coasters")
    .update(updateData, { count: "exact" })
    .eq("id", coasterId);

  if (error) {
    return { success: false, error: error.message };
  }
  if (!count) {
    return { success: false, error: "Coaster not found." };
  }

  revalidatePath("/catalog");
  revalidatePath("/admin/coasters");

  return { success: true };
}

// ---------------------------------------------------------------------------
// deleteCoaster
// ---------------------------------------------------------------------------

export async function deleteCoaster(coasterId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be signed in." };
  }

  const isAdmin = await verifyAdminRole(supabase, user.id);
  if (!isAdmin) {
    return { success: false, error: "Unauthorized: Admin access required." };
  }

  const { error, count } = await supabase
    .from("coasters")
    .delete({ count: "exact" })
    .eq("id", coasterId);

  if (error) {
    return { success: false, error: error.message };
  }
  if (!count) {
    return { success: false, error: "Coaster not found." };
  }

  revalidatePath("/catalog");
  revalidatePath("/admin/coasters");

  return { success: true };
}
