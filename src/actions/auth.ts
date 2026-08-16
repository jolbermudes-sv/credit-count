"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthActionResult {
  success: boolean;
  error?: string;
}

const MIN_PASSWORD_LENGTH = 6;

function readString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/**
 * Registers a new user and captures their display name.
 *
 * `display_name` is written to `auth.users.raw_user_meta_data` via
 * `options.data`. Pair this with a `handle_new_user` Postgres trigger
 * (SECURITY DEFINER) that reads that metadata and inserts the matching
 * `profiles` row on `auth.users` insert — RLS blocks a direct client
 * insert here whenever email confirmation is required, since no session
 * exists yet at this point in the flow. When a session *is* returned
 * immediately (confirmation disabled in your Supabase project), we
 * upsert the profile ourselves as a defensive fallback to the trigger.
 *
 * Signature matches React 19's `useActionState(action, initialState)`:
 * `(previousState, formData) => Promise<State>`. On an older Next.js/React
 * setup, swap this for `useFormState` from `react-dom` — the action
 * signature is identical.
 */
export async function signup(
  _prevState: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const email = readString(formData, "email");
  const password = readString(formData, "password");
  const displayName = readString(formData, "display_name");

  if (!email || !password || !displayName) {
    return { success: false, error: "All fields are required." };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }
  if (!data.user) {
    return { success: false, error: "Sign up failed. Please try again." };
  }

  // Only possible when email confirmation is disabled — otherwise there's
  // no session yet and this insert would be rejected by RLS.
  if (data.session) {
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        { id: data.user.id, display_name: displayName },
        { onConflict: "id" },
      );

    if (profileError) {
      return { success: false, error: profileError.message };
    }
  }

  return { success: true };
}

/** Signs in with email/password and redirects to /dashboard on success. */
export async function login(
  _prevState: AuthActionResult,
  formData: FormData,
): Promise<AuthActionResult> {
  const email = readString(formData, "email");
  const password = readString(formData, "password");

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      success: false,
      error:
        error.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : error.message,
    };
  }

  // Deliberately outside any try/catch: `redirect()` works by throwing a
  // framework-internal signal, which a surrounding catch block would
  // otherwise swallow and misreport as a login error.
  redirect("/dashboard");
}

/** Signs the current user out and redirects to /login. */
export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
