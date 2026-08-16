// src/app/(auth)/login/page.tsx
'use client'

// React 19 (bundled with current Next.js App Router releases). On an older
// Next.js/React setup, swap this import for `useFormState` from 'react-dom'
// — the action signature and returned tuple are identical.
import { useActionState } from 'react'
import Link from 'next/link'
import { login, type AuthActionResult } from '@/actions/auth'

const initialState: AuthActionResult = { success: false }

const inputClass =
  'w-full rounded-sm border bg-[#FFFDF7] px-3 py-2 text-sm text-[#17233C] placeholder:text-[#8B8368] outline-none transition focus:border-[#3E5C82] focus:ring-2 focus:ring-[#3E5C82]/20 border-[#C9BC98]'
const labelClass = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#17233C]'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-[#17233C]">Welcome back</h2>
      <p className="mb-6 text-sm text-[#5B5638]">Sign in to log your next credit.</p>

      {state?.error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-5 flex items-start gap-2 rounded-sm border-l-4 bg-[#FBEAE7] px-3 py-2.5 text-sm text-[#8A2A1E]"
          style={{ borderColor: '#C6382A' }}
        >
          <span aria-hidden className="mt-0.5">
            &#9888;
          </span>
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            placeholder="••••••••"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-sm bg-[#C6382A] py-2.5 text-sm font-semibold uppercase tracking-[0.15em] text-[#FBF7EC] transition hover:bg-[#A92E22] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Checking ticket…' : 'Sign in'}
        </button>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link href="/signup" className="text-[#3E5C82] hover:underline">
          Create an account
        </Link>
        <Link href="/leaderboard" className="text-[#3E5C82] hover:underline">
          View leaderboard
        </Link>
      </div>
    </div>
  )
}
