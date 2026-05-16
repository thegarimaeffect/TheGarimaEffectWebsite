import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * PATCH /api/client/welcome-seen
 * Stamps welcome_seen_at the first time a client dismisses the welcome modal.
 * Idempotent — only writes when the column is still null.
 */
export async function PATCH() {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await sb
    .from("profiles")
    .select("welcome_seen_at")
    .eq("id", user.id)
    .single();

  if (profile && !profile.welcome_seen_at) {
    const { error } = await sb
      .from("profiles")
      .update({ welcome_seen_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
