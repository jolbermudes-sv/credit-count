// src/app/(auth)/layout.tsx
import type { ReactNode } from 'react'
import { Oswald, Inter } from 'next/font/google'

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] })

/**
 * Design tokens shared across the auth flow (login/signup) — a kraft
 * admission-ticket palette, echoing park signage rather than a generic
 * card-on-gradient template:
 *
 *   paper (bg)      #E9DFC3   card (bg)   #FBF7EC   line (hairline) #C9BC98
 *   ink (text)      #17233C   rail (2nd)  #3E5C82   ticket-red (CTA) #C6382A
 */

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${inter.className} min-h-screen w-full flex items-center justify-center px-4 py-12`}
      style={{
        backgroundColor: '#E9DFC3',
        backgroundImage:
          'linear-gradient(rgba(23,35,60,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(23,35,60,0.06) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      <div className="w-full max-w-md relative">
        {/* Punch-hole corners: same color as the page bg, so they read as cutouts */}
        <span
          aria-hidden
          className="absolute -top-2 left-6 h-4 w-4 rounded-full"
          style={{ backgroundColor: '#E9DFC3' }}
        />
        <span
          aria-hidden
          className="absolute -top-2 right-6 h-4 w-4 rounded-full"
          style={{ backgroundColor: '#E9DFC3' }}
        />

        <div
          className="rounded-sm overflow-hidden"
          style={{
            backgroundColor: '#FBF7EC',
            border: '1px solid #C9BC98',
            boxShadow: '0 1px 2px rgba(23,35,60,0.08), 0 12px 32px -8px rgba(23,35,60,0.25)',
          }}
        >
          {/* Ticket stub: wordmark + tagline */}
          <div className="px-8 pt-7 pb-5 text-center">
            <p
              className="text-[11px] font-medium uppercase tracking-[0.3em]"
              style={{ color: '#3E5C82' }}
            >
              Admit One &middot; Track Every Ride
            </p>
            <h1
              className={`${oswald.className} mt-1 text-3xl uppercase tracking-wide`}
              style={{ color: '#17233C' }}
            >
              Credit Count
            </h1>
          </div>

          {/* Perforated tear line separating the stub from the form */}
          <div aria-hidden className="border-t-2 border-dashed" style={{ borderColor: '#C9BC98' }} />

          <div className="px-8 py-7">{children}</div>
        </div>
      </div>
    </div>
  )
}
