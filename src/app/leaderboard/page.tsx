// src/app/leaderboard/page.tsx
import Link from "next/link";
import { Oswald, Inter } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import { getLeaderboard } from "@/actions/leaderboard";

const oswald = Oswald({ subsets: ["latin"], weight: ["600", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

const INK = "#17233C";
const CREAM = "#F5EEDA";
const CARD = "#FBF7EC";
const LINE = "#C9BC98";
const MUTED = "#5B5638";
const CAUTION = "#E3A61E";

/**
 * Deliberately NOT nested under (dashboard): this page is linked from the
 * pre-login screen (see src/app/(auth)/login/page.tsx) and must render for
 * signed-out visitors. Auth is checked here only to decide which header
 * link to show and to highlight the viewer's own row — never to gate
 * access. Access control for *who appears* happens at the database layer
 * (privacy_opt_in), not here.
 */
export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = await getLeaderboard();
  const entries = result.success ? (result.data ?? []) : [];

  return (
    <div
      className={`${inter.className} min-h-screen`}
      style={{ backgroundColor: "#F5F2E9" }}
    >
      <header
        className="border-b"
        style={{ backgroundColor: CARD, borderColor: LINE }}
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href={user ? "/dashboard" : "/login"}
            className={`${oswald.className} text-xl uppercase tracking-wide`}
            style={{ color: INK }}
          >
            Credit Count
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:underline"
              style={{ color: "#3E5C82" }}
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/login"
                className="font-medium hover:underline"
                style={{ color: "#3E5C82" }}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="font-medium hover:underline"
                style={{ color: "#3E5C82" }}
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1
          className={`${oswald.className} text-3xl uppercase tracking-wide`}
          style={{ color: INK }}
        >
          Community Leaderboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: MUTED }}>
          Ranked by total credits. Only riders who&apos;ve opted in to the
          community leaderboard appear here.
        </p>

        {!result.success ? (
          <div
            className="mt-6 rounded-sm border px-6 py-8 text-center"
            style={{ borderColor: LINE, backgroundColor: CARD }}
          >
            <p className="text-sm" style={{ color: "#8A2A1E" }}>
              {result.error ??
                "We couldn't load the leaderboard. Please refresh the page."}
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div
            className="mt-6 rounded-sm border-2 border-dashed px-6 py-12 text-center"
            style={{ borderColor: LINE, backgroundColor: CARD }}
          >
            <p className="text-lg" style={{ color: INK }}>
              No riders on the board yet.
            </p>
            <p className="mt-1 text-sm" style={{ color: MUTED }}>
              Log rides and opt in to your profile&apos;s leaderboard setting to
              be the first.
            </p>
          </div>
        ) : (
          <div
            className="mt-6 overflow-hidden rounded-sm"
            style={{ border: `1px solid ${LINE}` }}
          >
            <div
              className="grid grid-cols-[3rem_1fr_5rem_5rem] gap-2 px-4 py-2"
              style={{ backgroundColor: INK }}
            >
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: CREAM }}
              >
                #
              </span>
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: CREAM }}
              >
                Rider
              </span>
              <span
                className="text-right text-[11px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: CREAM }}
              >
                Credits
              </span>
              <span
                className="text-right text-[11px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: CREAM }}
              >
                Rides
              </span>
            </div>

            <ul>
              {entries.map((entry, index) => {
                const rank = index + 1;
                const isViewer = user?.id === entry.id;

                return (
                  <li
                    key={entry.id}
                    className="grid grid-cols-[3rem_1fr_5rem_5rem] items-center gap-2 px-4 py-3"
                    style={{
                      backgroundColor: isViewer ? "#EFE6CC" : CARD,
                      borderTop: index === 0 ? "none" : `1px dashed ${LINE}`,
                    }}
                  >
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-sm text-xs font-bold"
                      style={
                        rank === 1
                          ? { backgroundColor: CAUTION, color: "#5C4400" }
                          : { backgroundColor: INK, color: CREAM }
                      }
                    >
                      {rank}
                    </span>
                    <span
                      className="truncate text-sm font-medium"
                      style={{ color: INK }}
                    >
                      {entry.displayName}
                      {isViewer && (
                        <span
                          className="ml-1 text-xs font-normal"
                          style={{ color: MUTED }}
                        >
                          (you)
                        </span>
                      )}
                    </span>
                    <span
                      className="text-right text-sm font-semibold"
                      style={{ color: INK }}
                    >
                      {entry.creditCount}
                    </span>
                    <span
                      className="text-right text-sm"
                      style={{ color: MUTED }}
                    >
                      {entry.totalRides}
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
