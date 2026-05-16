import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/database.types";

/**
 * Catch-all dashboard router. Looks up the signed-in user's role and
 * redirects to their proper home. Middleware also handles this for
 * direct hits to /dashboard, but keeping a server page here is a useful
 * fallback when middleware is bypassed (e.g. server-side fetches).
 */
const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin",
  product_manager: "/pm",
  intern: "/intern",
  client: "/client",
};

export default async function DashboardRouter() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  redirect(ROLE_HOME[(profile?.role ?? "client") as UserRole]);
}
