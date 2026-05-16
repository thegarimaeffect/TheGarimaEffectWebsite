import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * PATCH /api/calendar/content-writer
 * Body: { campaign_id, user_id, is_content_writer }
 * Designates (or clears) the content-writer intern for a campaign.
 * RLS (cm_pm_manage / cm_admin_all) enforces that only the PM/admin can.
 */
export async function PATCH(request: NextRequest) {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const campaignId = body.campaign_id;
  const userId = body.user_id;
  const flag = body.is_content_writer;
  if (
    typeof campaignId !== "string" ||
    typeof userId !== "string" ||
    typeof flag !== "boolean"
  ) {
    return NextResponse.json(
      { error: "campaign_id, user_id, is_content_writer required" },
      { status: 400 }
    );
  }

  const { error } = await sb
    .from("campaign_members")
    .update({ is_content_writer: flag })
    .eq("campaign_id", campaignId)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
