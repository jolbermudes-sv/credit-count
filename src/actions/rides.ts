// src/actions/rides.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Coaster } from "@/types/database";

export interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

// ---------------------------------------------------------------------------
// searchCoasters
// ---------------------------------------------------------------------------

export type CoasterSearchResult = Pick<
  Coaster,
  "id" | "name" | "park" | "country" | "manufacturer" | "type"
>;

const MIN_QUERY_LENGTH = 2;
const SEARCH_LIMIT = 10;

/**
 * Strips PostgREST filter-syntax delimiters (this string gets interpolated
 * into a raw `.or()` filter expression, so a stray comma or paren could
 * otherwise reshape the query) and escapes SQL LIKE wildcards, so a search
 * for e.g. "50%" behaves as a literal match rather than an open wildcard.
 */
function sanitizeSearchTerm(input: string): string {
  return input.replace(/[,()]/g, "").replace(/[%_]/g, "\\$&").trim();
}

/** Searches coasters by name or park (case-insensitive), limited to 10 results. */
export async function searchCoasters(
  query: string,
): Promise<ActionResult<CoasterSearchResult[]>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be signed in to search coasters.",
    };
  }

  const term = sanitizeSearchTerm(query);
  if (term.length < MIN_QUERY_LENGTH) {
    return { success: true, data: [] };
  }

  const { data, error } = await supabase
    .from("coasters")
    .select("id, name, park, country, manufacturer, type")
    .or(`name.ilike.%${term}%,park.ilike.%${term}%`)
    .order("name", { ascending: true })
    .limit(SEARCH_LIMIT);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data ?? [] };
}

// ---------------------------------------------------------------------------
// logRide
// ---------------------------------------------------------------------------

export interface LogRidePayload {
  coaster_id: string;
  ridden_at: string;
  notes?: string;
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const POSTGRES_FOREIGN_KEY_VIOLATION = "23503";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Inserts a ride for the current user. Revalidates /dashboard and /history. */
export async function logRide(payload: LogRidePayload): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be signed in to log a ride." };
  }

  const coasterId = payload.coaster_id.trim();
  const riddenAt = payload.ridden_at.trim();

  if (!coasterId) {
    return { success: false, error: "Pick a coaster from the search results." };
  }
  if (!ISO_DATE_PATTERN.test(riddenAt)) {
    return { success: false, error: "Enter a valid date (YYYY-MM-DD)." };
  }
  if (riddenAt > todayIsoDate()) {
    return {
      success: false,
      error: "You can't log a ride that hasn't happened yet.",
    };
  }

  const { error: insertError } = await supabase.from("rides").insert({
    user_id: user.id,
    coaster_id: coasterId,
    ridden_at: riddenAt,
    notes: payload.notes?.trim() || null,
  });

  if (insertError) {
    if (insertError.code === POSTGRES_FOREIGN_KEY_VIOLATION) {
      return {
        success: false,
        error:
          "That coaster doesn't exist. Please pick one from the search results.",
      };
    }
    return { success: false, error: insertError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/history");

  return { success: true };
}

// ---------------------------------------------------------------------------
// deleteRide
// ---------------------------------------------------------------------------

/**
 * Deletes a ride owned by the current user. RLS should already restrict
 * deletes to rows the caller owns (see the required `rides` DELETE policy
 * noted alongside this Phase's SQL), but we scope the query by `user_id`
 * too as defense-in-depth — it also means someone else's ride id fails as
 * "not found" rather than depending solely on the database to reject it.
 */
export async function deleteRide(rideId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be signed in to delete a ride." };
  }

  if (!rideId) {
    return { success: false, error: "Missing ride id." };
  }

  const { error: deleteError, count } = await supabase
    .from("rides")
    .delete({ count: "exact" })
    .eq("id", rideId)
    .eq("user_id", user.id);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }
  if (!count) {
    return { success: false, error: "Ride not found." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/history");

  return { success: true };
}

// ---------------------------------------------------------------------------
// getUserRideHistory
// ---------------------------------------------------------------------------

export interface RideHistoryEntry {
  id: string;
  riddenAt: string;
  notes: string | null;
  coaster: {
    id: string;
    name: string;
    park: string;
  };
}

/** Fetches the current user's full ride history, most recent first. */
export async function getUserRideHistory(): Promise<
  ActionResult<RideHistoryEntry[]>
> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be signed in to view your ride history.",
    };
  }

  const { data: rides, error: ridesError } = await supabase
    .from("rides")
    .select("id, coaster_id, ridden_at, notes")
    .eq("user_id", user.id)
    .order("ridden_at", { ascending: false });

  if (ridesError) {
    return { success: false, error: ridesError.message };
  }

  const rideRows = rides ?? [];
  if (rideRows.length === 0) {
    return { success: true, data: [] };
  }

  const distinctCoasterIds = Array.from(
    new Set(rideRows.map((r) => r.coaster_id)),
  );

  const { data: coasters, error: coastersError } = await supabase
    .from("coasters")
    .select("id, name, park")
    .in("id", distinctCoasterIds);

  if (coastersError) {
    return { success: false, error: coastersError.message };
  }

  const coasterById = new Map((coasters ?? []).map((c) => [c.id, c]));

  const history = rideRows
    .map((ride): RideHistoryEntry | null => {
      const coaster = coasterById.get(ride.coaster_id);
      if (!coaster) return null; // orphaned ride (shouldn't happen given the FK constraint)
      return {
        id: ride.id,
        riddenAt: ride.ridden_at,
        notes: ride.notes,
        coaster: { id: coaster.id, name: coaster.name, park: coaster.park },
      };
    })
    .filter((entry): entry is RideHistoryEntry => entry !== null);

  return { success: true, data: history };
}

// ---------------------------------------------------------------------------
// getUserDashboardData
// ---------------------------------------------------------------------------

export interface DashboardStats {
  displayName: string;
  creditCount: number;
  totalRides: number;
  mostRiddenCoaster: { name: string; count: number } | null;
  creditsByCountry: { country: string; count: number }[];
  creditsByManufacturer: { manufacturer: string; count: number }[];
  creditsByType: { type: string; count: number }[];
}

/** Groups items by a derived key, counting occurrences, sorted by count desc. */
function groupCount<T, K extends string>(
  items: T[],
  keyFn: (item: T) => K,
): { key: K; count: number }[] {
  const counts = new Map<K, number>();
  for (const item of items) {
    const key = keyFn(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

const EMPTY_STATS: Omit<DashboardStats, "displayName"> = {
  creditCount: 0,
  totalRides: 0,
  mostRiddenCoaster: null,
  creditsByCountry: [],
  creditsByManufacturer: [],
  creditsByType: [],
};

/**
 * Fetches the current user's rides and profile, and computes dashboard
 * stats. A "credit" is a unique coaster ridden (COUNT DISTINCT coaster_id);
 * "rides" counts every logged visit (COUNT *), so riding the same coaster
 * twice adds a ride but not a credit.
 *
 * Deliberately does two plain queries (rides, then coasters by id) and
 * joins them in memory, rather than a single PostgREST embedded select
 * (`rides.select('*, coasters(*)')`). The embedded form relies on
 * `@supabase/ssr`'s select-string type inference matching this hand-written
 * `Database` type exactly — fragile without a CLI-generated schema. Two
 * queries against our own `TableRow` types are slower by one round trip
 * but their types are trivially, verifiably correct.
 */
export async function getUserDashboardData(): Promise<
  ActionResult<DashboardStats>
> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be signed in to view your dashboard.",
    };
  }

  const [{ data: profile }, { data: rides, error: ridesError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single(),
      supabase.from("rides").select("coaster_id").eq("user_id", user.id),
    ]);

  if (ridesError) {
    return { success: false, error: ridesError.message };
  }

  const displayName = profile?.display_name ?? user.email ?? "Rider";
  const rideRows = rides ?? [];

  if (rideRows.length === 0) {
    return { success: true, data: { displayName, ...EMPTY_STATS } };
  }

  const rideCountByCoaster = new Map<string, number>();
  for (const ride of rideRows) {
    rideCountByCoaster.set(
      ride.coaster_id,
      (rideCountByCoaster.get(ride.coaster_id) ?? 0) + 1,
    );
  }
  const distinctCoasterIds = Array.from(rideCountByCoaster.keys());

  const { data: coasters, error: coastersError } = await supabase
    .from("coasters")
    .select("id, name, country, manufacturer, type")
    .in("id", distinctCoasterIds);

  if (coastersError) {
    return { success: false, error: coastersError.message };
  }

  const coasterRows = coasters ?? [];
  const coasterById = new Map(coasterRows.map((c) => [c.id, c]));

  let mostRiddenCoaster: { name: string; count: number } | null = null;
  for (const [coasterId, count] of rideCountByCoaster) {
    if (!mostRiddenCoaster || count > mostRiddenCoaster.count) {
      const coaster = coasterById.get(coasterId);
      if (coaster) {
        mostRiddenCoaster = { name: coaster.name, count };
      }
    }
  }

  return {
    success: true,
    data: {
      displayName,
      creditCount: distinctCoasterIds.length,
      totalRides: rideRows.length,
      mostRiddenCoaster,
      creditsByCountry: groupCount(coasterRows, (c) => c.country).map(
        ({ key, count }) => ({
          country: key,
          count,
        }),
      ),
      creditsByManufacturer: groupCount(coasterRows, (c) => c.manufacturer).map(
        ({ key, count }) => ({
          manufacturer: key,
          count,
        }),
      ),
      creditsByType: groupCount(coasterRows, (c) => c.type).map(
        ({ key, count }) => ({
          type: key,
          count,
        }),
      ),
    },
  };
}
