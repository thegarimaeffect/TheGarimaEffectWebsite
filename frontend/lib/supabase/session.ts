import { redirect } from "next/navigation";
import { createClient } from "./server";
import type { Profile, UserRole } from "./database.types";
import { previewRoleFromCookieStore, fetchPreviewProfile } from "./preview";

const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin",
  product_manager: "/pm",
  intern: "/intern",
  client: "/client",
};

/**
 * Server-side: requires a logged-in session, fetches the profile,
 * and (optionally) gates by allowed roles. Redirects if anything's off.
 *
 * In preview mode (cookie set), returns a service-role client + mock profile
 * for the chosen role — no actual auth needed.
 */
export async function requireProfile(allowed?: UserRole[]): Promise<{
  supabase: ReturnType<typeof createClient>;
  profile: Profile;
}> {
  // Preview short-circuit
  const previewRole = previewRoleFromCookieStore();
  if (previewRole) {
    const profile = await fetchPreviewProfile(previewRole);
    if (!profile) redirect("/login");
    if (allowed && !allowed.includes(profile.role)) {
      redirect(ROLE_HOME[profile.role]);
    }
    return { supabase: createClient(), profile };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  if (allowed && !allowed.includes(profile.role)) {
    redirect(ROLE_HOME[profile.role as UserRole]);
  }

  return { supabase, profile: profile as Profile };
}
