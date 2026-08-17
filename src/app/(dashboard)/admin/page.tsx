import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminCoasterTable from "./admin-coaster-table";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify admin status
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const userProfile = profile as any;
  if (!userProfile?.is_admin) {
    redirect("/dashboard");
  }

  // Fetch all coasters ordered by name
  const { data: coasters } = await supabase
    .from("coasters")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Catalogue Management</h1>
        <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-amber-300">
          Admin Access
        </span>
      </div>

      <AdminCoasterTable initialCoasters={coasters || []} />
    </div>
  );
}
