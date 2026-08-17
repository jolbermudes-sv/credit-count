// src/lib/profile.ts
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface ResolvedProfile {
  displayName: string;
  privacyOptIn: boolean;
  role: "enthusiast" | "admin";
}

const FALLBACK_ROLE = "enthusiast" as const;

function fallbackDisplayName(user: User): string {
  const metaName =
    typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name.trim()
      : "";
  if (metaName) return metaName;
  // Last resort: the local part of the email, not the full address — a
  // bare "jane" reads as a plausible display name, unlike showing the
  // user's full email on-screen.
  return user.email?.split("@")[0] || "Rider";
}

/**
 * Fetches the current user's `profiles` row and, if it doesn't exist,
 * self-heals by upserting one from auth metadata (the `display_name`
 * captured at signup — see `options.data` in `signup()`).
 *
 * A missing row normally means the `handle_new_user` Postgres trigger
 * (see supabase/rls_and_functions.sql) either isn't installed or didn't
 * fire for this user. This function is a resilience backstop, not a
 * substitute for that trigger — without it, every affected user pays the
 * cost of a missing profile (their name falling back to their email
 * address) until their first page load here repairs it.
 */
export async function ensureUserProfile(
  supabase: SupabaseClient<Database>,
  user: User,
): Promise<ResolvedProfile> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, privacy_opt_in, role")
    .eq("id", user.id)
    .single();

  if (profile) {
    return {
      displayName: profile.display_name,
      privacyOptIn: profile.privacy_opt_in,
      role: profile.role,
    };
  }

  const displayName = fallbackDisplayName(user);

  const { data: repaired } = await supabase
    .from("profiles")
    .upsert({ id: user.id, display_name: displayName }, { onConflict: "id" })
    .select("display_name, privacy_opt_in, role")
    .single();

  return {
    displayName: repaired?.display_name ?? displayName,
    privacyOptIn: repaired?.privacy_opt_in ?? false,
    role: repaired?.role ?? FALLBACK_ROLE,
  };
}
