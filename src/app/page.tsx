import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect authenticated users directly to their dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#FBF7EC] text-[#17233C] flex flex-col font-sans selection:bg-[#C6382A] selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-[#17233C]/10 bg-[#E9DFC3]/40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎢</span>
            <span className="font-bold text-xl tracking-tight text-[#17233C]">
              Credit Count
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/leaderboard"
              className="text-sm font-medium text-[#17233C]/80 hover:text-[#17233C] transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-[#17233C] hover:underline"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-[#C6382A] hover:bg-[#a82d20] text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-16 flex flex-col justify-center">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E9DFC3] border border-[#17233C]/10 text-xs font-semibold text-[#17233C]">
            <span>🎟️</span>
            <span>The Roller Coaster Credit Log</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#17233C] leading-tight">
            Count every credit. <br className="hidden sm:block" />
            Share every drop.
          </h1>

          <p className="text-lg sm:text-xl text-[#17233C]/80 max-w-2xl mx-auto leading-relaxed">
            Log your roller coaster rides, automatically track unique coaster
            credits, explore detailed stats, and see where you rank on the
            public community leaderboard.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#C6382A] hover:bg-[#a82d20] text-white font-bold text-base rounded-xl shadow-md transition-all text-center"
            >
              Create Free Account
            </Link>
            <Link
              href="/leaderboard"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#E9DFC3] hover:bg-[#ded1b0] text-[#17233C] font-semibold text-base rounded-xl border border-[#17233C]/15 transition-all text-center"
            >
              View Community Leaderboard
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#E9DFC3]/40 border border-[#17233C]/10 rounded-2xl p-6 space-y-3">
            <div className="text-3xl">🎢</div>
            <h2 className="font-bold text-lg text-[#17233C]">Unique Credits</h2>
            <p className="text-sm text-[#17233C]/75 leading-relaxed">
              Every unique coaster you experience counts as 1 credit. Ride
              multiples are recorded in your total ride counts automatically.
            </p>
          </div>

          <div className="bg-[#E9DFC3]/40 border border-[#17233C]/10 rounded-2xl p-6 space-y-3">
            <div className="text-3xl">📊</div>
            <h2 className="font-bold text-lg text-[#17233C]">Ride Analytics</h2>
            <p className="text-sm text-[#17233C]/75 leading-relaxed">
              Break down your history by structure type (Steel, Wood, Hybrid),
              top manufacturers, parks, and countries.
            </p>
          </div>

          <div className="bg-[#E9DFC3]/40 border border-[#17233C]/10 rounded-2xl p-6 space-y-3">
            <div className="text-3xl">🏆</div>
            <h2 className="font-bold text-lg text-[#17233C]">
              Public Leaderboard
            </h2>
            <p className="text-sm text-[#17233C]/75 leading-relaxed">
              Opt-in to showcase your credit tally and see how your coaster
              milestone count compares with the global community.
            </p>
          </div>

          <div className="bg-[#E9DFC3]/40 border border-[#17233C]/10 rounded-2xl p-6 space-y-3">
            <div className="text-3xl">📚</div>
            <h2 className="font-bold text-lg text-[#17233C]">
              Coaster Catalog
            </h2>
            <p className="text-sm text-[#17233C]/75 leading-relaxed">
              Search through coasters worldwide, filter by manufacturer or park,
              and log new credits directly from the catalog.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#17233C]/10 bg-[#E9DFC3]/30 px-6 py-6 text-center text-xs text-[#17233C]/60">
        <p>
          © {new Date().getFullYear()} Credit Count. Built for roller coaster
          enthusiasts.
        </p>
      </footer>
    </div>
  );
}
