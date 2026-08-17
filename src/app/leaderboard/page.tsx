//src/app/leaderboard/page.tsx
import Link from "next/link";
import { Oswald, Inter } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import { getLeaderboard } from "@/actions/leaderboard";
import { logout } from "@/actions/auth";
import {
  DesktopNavLinks,
  MobileNavLinks,
} from "@/components/dashboard/nav-links";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

function TrackMark() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12h20" />
      <path d="M20 12v8H4v-8" />
      <path d="M6 12V4h12v8" />
    </svg>
  );
}

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  let displayName = "";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin, display_name")
      .eq("id", user.id)
      .single();

    isAdmin = Boolean(profile?.is_admin ?? user.user_metadata?.is_admin);
    displayName =
      profile?.display_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Rider";
  }

  const result = await getLeaderboard();
  const entries = result.success ? (result.data ?? []) : [];

  return (
    <div className={`${inter.className} min-h-screen bg-page`}>
      <header
        className="sticky top-0 z-10 border-b"
        style={{ backgroundColor: "#FBF7EC", borderColor: "#C9BC98" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href={user ? "/dashboard" : "/login"}
            className={`${oswald.className} flex items-center gap-2 text-xl uppercase tracking-wide`}
            style={{ color: "#17233C" }}
          >
            <TrackMark />
            Credit Count
          </Link>

          {user ? (
            <>
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
            </>
          ) : (
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/login"
                className="font-medium text-rail hover:underline"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="font-medium text-rail hover:underline"
              >
                Create account
              </Link>
            </div>
          )}
        </div>

        {user && <MobileNavLinks isAdmin={isAdmin} />}
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1
          className={`${oswald.className} text-3xl uppercase tracking-wide text-ink`}
        >
          Community Leaderboard
        </h1>
        <p className="mt-1 text-sm text-muted">
          Ranked by total credits. Only riders who&apos;ve opted in to the
          community leaderboard appear here.
        </p>

        {!result.success ? (
          <div className="mt-6 rounded-sm border border-line bg-card px-6 py-8 text-center">
            <p className="text-sm text-error">
              {result.error ??
                "We couldn't load the leaderboard. Please refresh the page."}
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="mt-6 rounded-sm border-2 border-dashed border-line bg-card px-6 py-12 text-center">
            <p className="text-lg text-ink">No riders on the board yet.</p>
            <p className="mt-1 text-sm text-muted">
              Log rides and opt in to your profile&apos;s leaderboard setting to
              be the first.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-sm border border-line">
            <div className="grid grid-cols-[3rem_1fr_5rem] gap-2 bg-ink px-4 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-cream">
                #
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-cream">
                Rider
              </span>
              <span className="text-right text-[11px] font-semibold uppercase tracking-[0.15em] text-cream">
                Credits
              </span>
            </div>

            <ul>
              {entries.map((entry, index) => {
                const rank = index + 1;
                const isViewer = Boolean(
                  user?.id && entry.id && user.id === entry.id,
                );

                return (
                  <li
                    key={entry.id ?? index}
                    className={`grid grid-cols-[3rem_1fr_5rem] items-center gap-2 px-4 py-3 ${
                      isViewer ? "bg-[#EFE6CC]" : "bg-card"
                    } ${
                      index !== 0 ? "border-t border-dashed border-line" : ""
                    }`}
                  >
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-sm text-xs font-bold ${
                        rank === 1
                          ? "bg-caution text-[#5C4400]"
                          : "bg-ink text-cream"
                      }`}
                    >
                      {rank}
                    </span>
                    <span className="truncate text-sm font-medium text-ink">
                      {entry.displayName}
                      {isViewer && (
                        <span className="ml-1 text-xs font-normal text-muted">
                          (you)
                        </span>
                      )}
                    </span>
                    <span className="text-right text-sm font-semibold text-ink">
                      {entry.creditCount}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
