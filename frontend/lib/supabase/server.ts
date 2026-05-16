import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "./constants";
import { previewRoleFromCookieStore, createPreviewClient } from "./preview";

/**
 * Server Component / Route Handler Supabase client.
 * - Normal mode: cookie-based auth (per-user RLS).
 * - Preview mode (cookie `preview_role` + ALLOW_PREVIEW=1): service-role
 *   client that bypasses RLS, used for the design walkthrough.
 */
export function createClient() {
  // Preview short-circuit — return service-role client
  if (previewRoleFromCookieStore()) {
    return createPreviewClient();
  }

  const cookieStore = cookies();
  const url =
    process.env.SUPABASE_SERVER_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return createServerClient(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: AUTH_COOKIE_NAME },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component — Next.js will refresh on next request
          }
        },
      },
    }
  );
}
