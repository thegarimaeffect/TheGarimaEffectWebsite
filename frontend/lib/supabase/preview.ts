import { createClient as createRawClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import type { Profile, UserRole } from "./database.types";

/**
 * Preview-mode bypass.
 * When a "preview_role" cookie is set AND ALLOW_PREVIEW=1, the dashboards
 * render as if the user with that role is logged in — using a service-role
 * Supabase client so RLS doesn't block server-side data fetches.
 *
 * Intended for local UI walk-throughs only. Disabled in real deployments by
 * NOT setting ALLOW_PREVIEW / SUPABASE_SERVICE_ROLE_KEY.
 */

const VALID_ROLES: UserRole[] = ["admin", "product_manager", "intern", "client"];

export function previewRoleFromRequest(request: NextRequest): UserRole | null {
  if (process.env.ALLOW_PREVIEW !== "1") return null;
  const v = request.cookies.get("preview_role")?.value;
  return v && (VALID_ROLES as string[]).includes(v) ? (v as UserRole) : null;
}

export function previewRoleFromCookieStore(): UserRole | null {
  if (process.env.ALLOW_PREVIEW !== "1") return null;
  const v = cookies().get("preview_role")?.value;
  return v && (VALID_ROLES as string[]).includes(v) ? (v as UserRole) : null;
}

/**
 * Service-role Supabase client (no RLS). Use only on the server, only in preview.
 */
export function createPreviewClient() {
  const url =
    process.env.SUPABASE_SERVER_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY missing — cannot preview");
  return createRawClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Returns the seeded profile for a given role (PM=Ananya, Intern=Rohan, etc.)
 * Used by requireProfile when in preview mode.
 */
export async function fetchPreviewProfile(role: UserRole): Promise<Profile | null> {
  const sb = createPreviewClient();
  const { data } = await sb
    .from("profiles")
    .select("*")
    .eq("role", role)
    .limit(1)
    .single();
  return (data as Profile) ?? null;
}
