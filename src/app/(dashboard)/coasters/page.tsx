import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCoasters } from "@/actions/admin-coasters";
import { CoasterManagement } from "./coaster-management";

export default async function AdminCoastersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = Boolean(profile?.is_admin ?? user.user_metadata?.is_admin);

  if (!isAdmin) {
    redirect("/dashboard");
  }

  const coasters = await getCoasters();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl uppercase tracking-wide text-ink">
          Coaster Management
        </h1>
        <p className="mt-1 text-sm text-muted">
          Add, edit, or remove roller coasters from the global catalog.
        </p>
      </div>

      <CoasterManagement initialCoasters={coasters} />
    </div>
  );
}
