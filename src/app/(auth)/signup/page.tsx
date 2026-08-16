// src/app/(auth)/signup/page.tsx
'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signup, type AuthActionResult } from '@/actions/auth'

const initialState: AuthActionResult = { success: false }

const inputClass =
  'w-full rounded-sm border bg-[#FFFDF7] px-3 py-2 text-sm text-[#17233C] placeholder:text-[#8B8368] outline-none transition focus:border-[#3E5C82] focus:ring-2 focus:ring-[#3E5C82]/20 border-[#C9BC98]'
const labelClass = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#17233C]'

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, initialState)

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-[#17233C]">Get your first credit</h2>
      <p className="mb-6 text-sm text-[#5B5638]">Create an account to start tracking rides.</p>

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

      {state?.success && (
        <div
          role="status"
          aria-live="polite"
          className="mb-5 flex items-start gap-2 rounded-sm border-l-4 bg-[#EAF4EC] px-3 py-2.5 text-sm text-[#1F5C37]"
          style={{ borderColor: '#2F7A4D' }}
        >
          <span aria-hidden className="mt-0.5">
            &#9989;
          </span>
          <span>Account created. Check your email to confirm it, then sign in.</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="display_name" className={labelClass}>
            Display name
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            required
            autoComplete="name"
            placeholder="Coaster Kim"
            className={inputClass}
          />
        </div>

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
            autoComplete="new-password"
            placeholder="At least 6 characters"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-sm bg-[#C6382A] py-2.5 text-sm font-semibold uppercase tracking-[0.15em] text-[#FBF7EC] transition hover:bg-[#A92E22] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Punching ticket…' : 'Create account'}
        </button>
      </form>

      <div className="mt-6 text-sm">
        <Link href="/login" className="text-[#3E5C82] hover:underline">
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  )
}
