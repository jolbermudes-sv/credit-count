// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers.
 *
 * Must be called fresh on every invocation (do not cache/reuse the instance
 * across requests) since it binds to the current request's cookie store.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // `setAll` was called from a Server Component, where cookies
            // cannot be mutated. This is safe to ignore as long as the
            // middleware is refreshing the user's session (see
            // src/middleware.ts), which keeps cookies in sync on every
            // request that passes through it.
          }
        },
      },
    }
  )
}