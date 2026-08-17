import Link from "next/link";
import { Oswald, Inter } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import { getLeaderboard } from "@/actions/leaderboard";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

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
    <div className={`${inter.className} min-h-screen bg-page`}>
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href={user ? "/dashboard" : "/login"}
            className={`${oswald.className} text-xl uppercase tracking-wide text-ink`}
          >
            Credit Count
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-rail hover:underline"
            >
              Go to Dashboard
            </Link>
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
            <div className="grid grid-cols-[3rem_1fr_5rem_5rem] gap-2 bg-ink px-4 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-cream">
                #
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-cream">
                Rider
              </span>
              <span className="text-right text-[11px] font-semibold uppercase tracking-[0.15em] text-cream">
                Credits
              </span>
              <span className="text-right text-[11px] font-semibold uppercase tracking-[0.15em] text-cream">
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
                    className={`grid grid-cols-[3rem_1fr_5rem_5rem] items-center gap-2 px-4 py-3 ${
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
                    <span className="text-right text-sm text-muted">
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
