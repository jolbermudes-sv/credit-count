// src/actions/leaderboard.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/actions/rides";

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  creditCount: number;
  totalRides: number;
}

/**
 * Public read: the community leaderboard has no auth gate by design (it's
 * linked from the pre-login screen). Privacy is enforced at the database
 * layer instead — the `get_leaderboard` Postgres function (SQL below, run
 * once in the Supabase SQL editor) only aggregates profiles with
 * `privacy_opt_in = true`, and is SECURITY DEFINER so it can read across
 * all users' rides without granting the calling client any broader
 * row-level access to `profiles` or `rides` directly.
 *
 * Required SQL (idempotent, safe to re-run):
 *
 *   create or replace function public.get_leaderboard()
 *   returns table (
 *     id uuid,
 *     display_name text,
 *     credit_count bigint,
 *     total_rides bigint
 *   )
 *   language sql
 *   security definer
 *   set search_path = public
 *   as $$
 *     select
 *       p.id,
 *       p.display_name,
 *       count(distinct r.coaster_id) as credit_count,
 *       count(r.id) as total_rides
 *     from public.profiles p
 *     join public.rides r on r.user_id = p.id
 *     where p.privacy_opt_in = true
 *     group by p.id, p.display_name
 *     order by credit_count desc, total_rides desc
 *     limit 100;
 *   $$;
 *
 *   grant execute on function public.get_leaderboard() to authenticated, anon;
 *
 * Uses an inner join, so only riders with at least one credit appear —
 * showing opted-in users with zero rides on a "leaderboard" isn't
 * meaningful. `id` is included (not just display_name) so the UI can
 * reliably highlight "your" row — display_name has no uniqueness
 * constraint in the schema, so matching by name alone would be fragile.
 */
export async function getLeaderboard(): Promise<
  ActionResult<LeaderboardEntry[]>
> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_leaderboard");

  if (error) {
    return { success: false, error: error.message };
  }

  const entries: LeaderboardEntry[] = (data ?? []).map((row) => ({
    id: row.id,
    displayName: row.display_name,
    creditCount: row.credit_count,
    totalRides: row.total_rides,
  }));

  return { success: true, data: entries };
}
