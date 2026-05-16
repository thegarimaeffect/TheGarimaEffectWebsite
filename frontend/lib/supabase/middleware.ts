import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "./constants";

/**
 * Refreshes the session cookie on every request.
 * Uses the modern getAll/setAll cookies adapter (v0.5+) so chunked auth
 * cookies are read correctly. Cookie name is pinned via AUTH_COOKIE_NAME so
 * the server reads the SAME cookie the browser client wrote — even when the
 * server reaches Supabase via a different hostname (host.docker.internal).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const url =
    process.env.SUPABASE_SERVER_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabase = createServerClient(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: AUTH_COOKIE_NAME },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as never)
          );
        },
      },
    }
  );

  // Resolve user, but tolerate stale / missing / expired refresh tokens.
  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      if (
        error.message?.includes("Refresh Token") ||
        (error as { code?: string }).code === "refresh_token_not_found"
      ) {
        await supabase.auth.signOut();
      }
      // Note: don't sign out on plain "Auth session missing" — that just
      // means anonymous, which is fine for public pages
    } else {
      user = data.user;
    }
  } catch {
    /* swallow */
  }

  return { response, user };
}
