// src/app/(admin)/layout.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  if (profile?.is_admin === false) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900 p-6">
        <div className="mb-8 flex items-center gap-2">
          <span className="rounded bg-indigo-600 px-2 py-1 text-xs font-bold uppercase tracking-wider text-white">
            Admin
          </span>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Control Panel
          </h1>
        </div>

        <nav className="space-y-1">
          <Link
            href="/admin/coasters"
            className="flex items-center rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Coasters
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800/60 hover:text-white"
          >
            ← Back to App
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
