// src/actions/catalog.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { sanitizeSearchTerm, MIN_SEARCH_QUERY_LENGTH } from "@/lib/search";
import type { ActionResult } from "@/actions/rides";
import type { Coaster } from "@/types/database";

export type CatalogCoaster = Pick<
  Coaster,
  "id" | "name" | "park" | "country" | "manufacturer" | "type"
>;

const COASTER_TYPES = ["steel", "wooden", "hybrid", "other"] as const;
type CoasterTypeFilter = (typeof COASTER_TYPES)[number];

function isValidCoasterType(value: string): value is CoasterTypeFilter {
  return (COASTER_TYPES as readonly string[]).includes(value);
}

const PAGE_SIZE = 12;

export interface CatalogQueryParams {
  search?: string;
  type?: string;
  country?: string;
  manufacturer?: string;
  page?: number;
  is_active?: boolean;
}

export interface CatalogResult {
  coasters: CatalogCoaster[];
  page: number;
  totalPages: number;
  totalCount: number;
}

/** Paginated, filtered search over the coaster catalog. */
export async function getCatalogCoasters(
  params: CatalogQueryParams,
): Promise<ActionResult<CatalogResult>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be signed in to browse the catalog.",
    };
  }

  const rawPage = Math.trunc(params.page ?? 1);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("coasters")
    .select("id, name, park, country, manufacturer, type", { count: "exact" })
    .eq("is_active", true);

  const term = params.search ? sanitizeSearchTerm(params.search) : "";
  if (term.length >= MIN_SEARCH_QUERY_LENGTH) {
    query = query.or(`name.ilike.%${term}%,park.ilike.%${term}%`);
  }
  if (params.type && isValidCoasterType(params.type)) {
    query = query.eq("type", params.type);
  }
  if (params.country) {
    query = query.eq("country", params.country);
  }
  if (params.manufacturer) {
    query = query.eq("manufacturer", params.manufacturer);
  }

  const { data, error, count } = await query
    .order("name", { ascending: true })
    .range(from, to);

  if (error) {
    return { success: false, error: error.message };
  }

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return {
    success: true,
    data: {
      coasters: data ?? [],
      page,
      totalPages,
      totalCount,
    },
  };
}

/**
 * Returns the current user's ridden coaster ids as a plain array (not a
 * native Set), despite the name — Server Action return values need to stay
 * plain JSON-shaped data, consistent with this app's `ActionResult<T>`
 * pattern elsewhere. The catalog page builds a real `Set` from this for
 * O(1) "is this ridden" lookups when rendering many cards.
 */
export async function getUserRiddenCoasterSet(): Promise<
  ActionResult<string[]>
> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be signed in to view your ridden coasters.",
    };
  }

  const { data, error } = await supabase
    .from("rides")
    .select("coaster_id")
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  const riddenIds = Array.from(new Set((data ?? []).map((r) => r.coaster_id)));
  return { success: true, data: riddenIds };
}

export interface CatalogFilterOptions {
  countries: string[];
  manufacturers: string[];
}

/**
 * Fetches distinct country/manufacturer values by selecting just those
 * single columns and deduping in memory — fine at catalog scale (hundreds
 * to low thousands of coasters). If the catalog grows into the tens of
 * thousands, switch this to a `SELECT DISTINCT` Postgres function (same
 * SECURITY DEFINER pattern as the leaderboard) rather than shipping every
 * row's value to the server just to dedupe it.
 */
export async function getCatalogFilterOptions(): Promise<
  ActionResult<CatalogFilterOptions>
> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be signed in to browse the catalog.",
    };
  }

  const [
    { data: countryRows, error: countryError },
    { data: manufacturerRows, error: manufacturerError },
  ] = await Promise.all([
    supabase.from("coasters").select("country"),
    supabase.from("coasters").select("manufacturer"),
  ]);

  if (countryError) {
    return { success: false, error: countryError.message };
  }
  if (manufacturerError) {
    return { success: false, error: manufacturerError.message };
  }

  const countries = Array.from(
    new Set((countryRows ?? []).map((r) => r.country)),
  ).sort((a, b) => a.localeCompare(b));
  const manufacturers = Array.from(
    new Set((manufacturerRows ?? []).map((r) => r.manufacturer)),
  ).sort((a, b) => a.localeCompare(b));

  return { success: true, data: { countries, manufacturers } };
}
