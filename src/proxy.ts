// src/proxy.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

async function updateSession(request: NextRequest): Promise<NextResponse> {
  // This response instance is what we mutate and ultimately return. It must
  // stay in sync with the request as cookies are refreshed below.
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write the refreshed cookies onto the incoming request...
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          // ...then rebuild the response from that updated request so the
          // rest of the pipeline (and the browser) sees the new cookies.
          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // IMPORTANT: Avoid inserting logic between `createServerClient` and
  // `getUser()`. Calling `getUser()` is what actually validates and, if
  // needed, refreshes the auth token — skipping or delaying it can cause
  // users to be silently and unexpectedly logged out.
  await supabase.auth.getUser();

  // IMPORTANT: `supabaseResponse` must be returned as-is. If you need to
  // return a different response object, copy the cookies from
  // `supabaseResponse` onto it first, or the session refresh will be lost.
  return supabaseResponse;
}

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on all paths except:
     * - _next/static (build assets)
     * - _next/image (image optimization)
     * - favicon.ico
     * - common static file extensions
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|woff|woff2|ttf)$).*)",
  ],
};
