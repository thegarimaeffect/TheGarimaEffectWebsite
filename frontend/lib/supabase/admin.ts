import { NextResponse } from "next/server";
import { createClient as createRawClient } from "@supabase/supabase-js";
import { createClient } from "./server";
import { previewRoleFromCookieStore, createPreviewClient } from "./preview";
import type { Profile } from "./database.types";

/**
 * Server-side admin gate. Returns either:
 *   - { ok: true, admin, sb }   when the caller is admin (real session OR preview)
 *   - { ok: false, response }   a NextResponse with 401/403 to return immediately
 *
 * Use at the top of any /api/admin/* route handler.
 */
export async function requireAdminApi(): Promise<
  | { ok: true; admin: Profile | { id: string; role: "admin" }; sb: ReturnType<typeof createServiceClient> }
  | { ok: false; response: NextResponse }
> {
  // Preview short-circuit
  const previewRole = previewRoleFromCookieStore();
  if (previewRole === "admin") {
    return {
      ok: true,
      admin: { id: "preview-admin", role: "admin" },
      sb: createServiceClient(),
    };
  }

  // Real-auth path
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "unauthorized" },
        { status: 401 }
      ),
    };
  }
  const { data: profile } = await sb
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile || (profile as Profile).role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "admin only" },
        { status: 403 }
      ),
    };
  }
  return {
    ok: true,
    admin: profile as Profile,
    sb: createServiceClient(),
  };
}

/**
 * Service-role client. Bypasses RLS — only call from trusted server code.
 */
export function createServiceClient() {
  const url =
    process.env.SUPABASE_SERVER_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key)
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY missing — admin API needs the service role key"
    );
  return createRawClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// re-export the preview helper for tests
export { createPreviewClient };
