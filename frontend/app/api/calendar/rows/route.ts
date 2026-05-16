import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/calendar/rows
 * Create a calendar row. RLS (cr_pm_manage / cr_content_writer_manage)
 * decides whether the caller is allowed — we just pass the insert through
 * the cookie-scoped client so the policy is enforced server-side.
 */
export async function POST(request: NextRequest) {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof body.calendar_id !== "string") {
    return NextResponse.json({ error: "calendar_id required" }, { status: 400 });
  }

  const row = {
    calendar_id: body.calendar_id,
    row_order: typeof body.row_order === "number" ? body.row_order : 0,
    post_date: typeof body.post_date === "string" ? body.post_date : null,
    post_time: typeof body.post_time === "string" ? body.post_time : null,
    post_type: typeof body.post_type === "string" ? body.post_type : null,
    pillar: typeof body.pillar === "string" ? body.pillar : null,
    ideation: typeof body.ideation === "string" ? body.ideation : null,
    reference: typeof body.reference === "string" ? body.reference : null,
    caption: typeof body.caption === "string" ? body.caption : null,
    drive_link: typeof body.drive_link === "string" && body.drive_link ? body.drive_link : null,
    created_by: user.id,
  };

  const { data, error } = await sb
    .from("calendar_rows")
    .insert(row)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ row: data });
}
