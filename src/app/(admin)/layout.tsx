// src/app/(admin)/layout.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const INK = "#17233C";
const MUTED = "#5B5638";
const CARD = "#FBF7EC";
const LINE = "#C9BC98";
const BG_PAGE = "#FAF6EB";

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
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: BG_PAGE, color: INK }}
    >
      {/* Sidebar */}
      <aside
        className="w-64 border-r p-6"
        style={{ backgroundColor: CARD, borderColor: LINE }}
      >
        <div className="mb-8 flex items-center gap-2">
          <span
            className="rounded-sm px-2 py-0.5 text-xs font-bold uppercase tracking-wider"
            style={{ backgroundColor: INK, color: CARD }}
          >
            Admin
          </span>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: INK }}
          >
            Control Panel
          </h1>
        </div>

        <nav className="space-y-1">
          <Link
            href="/coasters"
            className="flex items-center rounded-sm px-4 py-2.5 text-sm font-semibold transition hover:opacity-90"
            style={{ backgroundColor: "#EFE8D3", color: INK }}
          >
            Coasters
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center rounded-sm px-4 py-2.5 text-sm font-medium transition hover:opacity-80"
            style={{ color: MUTED }}
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
