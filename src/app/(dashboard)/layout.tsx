// src/app/(dashboard)/layout.tsx
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Oswald, Inter } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/profile";
import { logout } from "@/actions/auth";
import {
  DesktopNavLinks,
  MobileNavLinks,
} from "@/components/dashboard/nav-links";

const oswald = Oswald({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

function TrackMark() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 17c3-1 3-9 6-9s3 9 6 9 3-9 6-9" />
    </svg>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ensureUserProfile self-heals a missing row (see src/lib/profile.ts) —
  // raw `.select().single()` here would silently fall through to
  // `user.email` whenever the handle_new_user trigger hadn't fired yet.
  const profile = await ensureUserProfile(supabase, user);
  const displayName = profile.displayName;
  const isAdmin = profile.role === "admin";

  return (
    <div
      className={`${inter.className} min-h-screen`}
      style={{ backgroundColor: "#F5F2E9" }}
    >
      <header
        className="sticky top-0 z-10 border-b"
        style={{ backgroundColor: "#FBF7EC", borderColor: "#C9BC98" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/dashboard"
            className={`${oswald.className} flex items-center gap-2 text-xl uppercase tracking-wide`}
            style={{ color: "#17233C" }}
          >
            <TrackMark />
            Credit Count
          </Link>

          <DesktopNavLinks isAdmin={isAdmin} />

          <div className="flex items-center gap-3">
            <span
              className="hidden max-w-[10rem] truncate rounded-full border border-dashed px-3 py-1 text-sm font-medium sm:inline-block"
              style={{ borderColor: "#C9BC98", color: "#17233C" }}
              title={displayName}
            >
              {displayName}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-sm px-3 py-1.5 text-sm font-semibold uppercase tracking-wide text-[#C6382A] transition hover:bg-[#FBEAE7]"
              >
                Log out
              </button>
            </form>
          </div>
        </div>

        <MobileNavLinks isAdmin={isAdmin} />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
