// src/app/(dashboard)/layout.tsx
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Oswald, Inter } from 'next/font/google'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/actions/auth'

const oswald = Oswald({ subsets: ['latin'], weight: ['600', '700'] })
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] })

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/history', label: 'Ride History' },
  { href: '/catalog', label: 'Catalog' },
  { href: '/leaderboard', label: 'Leaderboard' },
] as const

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
  )
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // `.select('display_name, role')` narrows the inferred row type to just
  // those two columns via the typed Supabase client — no manual casting.
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, role')
    .eq('id', user.id)
    .single()

  const displayName = profile?.display_name ?? user.email ?? 'Rider'
  const isAdmin = profile?.role === 'admin'

  return (
    <div className={`${inter.className} min-h-screen`} style={{ backgroundColor: '#F5F2E9' }}>
      <header className="sticky top-0 z-10 border-b" style={{ backgroundColor: '#FBF7EC', borderColor: '#C9BC98' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/dashboard"
            className={`${oswald.className} flex items-center gap-2 text-xl uppercase tracking-wide`}
            style={{ color: '#17233C' }}
          >
            <TrackMark />
            Credit Count
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-sm px-3 py-1.5 text-sm font-medium text-[#3E5C82] transition hover:bg-[#EFE6CC] hover:text-[#17233C]"
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className="ml-1 flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition hover:bg-[#EFE6CC]"
                style={{ color: '#8A6A00' }}
              >
                Admin
                <span
                  className="rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#5C4400]"
                  style={{ backgroundColor: '#E3A61E' }}
                >
                  Staff
                </span>
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <span
              className="hidden max-w-[10rem] truncate rounded-full border border-dashed px-3 py-1 text-sm font-medium sm:inline-block"
              style={{ borderColor: '#C9BC98', color: '#17233C' }}
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

        {/* Mobile nav: horizontally scrollable row beneath the header bar */}
        <nav className="-mt-1 flex gap-1 overflow-x-auto px-4 pb-3 sm:px-6 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-sm px-3 py-1.5 text-sm font-medium text-[#3E5C82] hover:bg-[#EFE6CC]"
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="shrink-0 rounded-sm px-3 py-1.5 text-sm font-medium"
              style={{ color: '#8A6A00' }}
            >
              Admin
            </Link>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}
