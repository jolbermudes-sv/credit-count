// src/actions/profile.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/actions/rides";

export interface UserProfile {
  displayName: string;
  privacyOptIn: boolean;
}

/** Fetches the current user's display name and leaderboard privacy preference. */
export async function getUserProfile(): Promise<ActionResult<UserProfile>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be signed in to view your profile.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, privacy_opt_in")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return { success: false, error: profileError.message };
  }
  if (!profile) {
    return { success: false, error: "Profile not found." };
  }

  return {
    success: true,
    data: {
      displayName: profile.display_name,
      privacyOptIn: profile.privacy_opt_in,
    },
  };
}

/**
 * Updates the current user's leaderboard opt-in preference. Revalidates
 * /settings (so this page reflects the change on next load) and
 * /leaderboard (since this preference controls whether the user appears
 * there at all).
 */
export async function updatePrivacyPreference(
  optIn: boolean,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be signed in to update your settings.",
    };
  }

  const { error: updateError, count } = await supabase
    .from("profiles")
    .update({ privacy_opt_in: optIn }, { count: "exact" })
    .eq("id", user.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }
  if (!count) {
    return { success: false, error: "Profile not found." };
  }

  revalidatePath("/settings");
  revalidatePath("/leaderboard");

  return { success: true };
}
