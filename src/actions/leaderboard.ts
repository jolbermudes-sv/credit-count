// src/actions/leaderboard.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/actions/rides";

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  creditCount: number;
}

interface RpcLeaderboardRow {
  id: string;
  display_name: string | null;
  credit_count: number | string | null;
  total_rides: number | string | null;
}

export async function getLeaderboard(): Promise<
  ActionResult<LeaderboardEntry[]>
> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("get_leaderboard");

    if (error) {
      console.error("Supabase RPC Error (get_leaderboard):", error);
      return { success: false, error: "Failed to load leaderboard data." };
    }

    const rows = (data as unknown as RpcLeaderboardRow[]) ?? [];

    const entries: LeaderboardEntry[] = rows.map((row) => ({
      id: row.id || "",
      displayName: row.display_name || "Unknown Rider",
      creditCount: Number(row.credit_count) || 0,
    }));

    return { success: true, data: entries };
  } catch (err) {
    console.error("Unexpected error in getLeaderboard:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
