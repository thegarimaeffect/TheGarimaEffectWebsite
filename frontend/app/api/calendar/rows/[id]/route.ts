import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EDITABLE = [
  "row_order",
  "post_date",
  "post_time",
  "post_type",
  "pillar",
  "ideation",
  "reference",
  "caption",
  "client_inputs",
  "edited_reel_url",
  "drive_link",
  "collaborators",
  "status",
  "client_approved_at",
  "client_approved_by",
] as const;

/**
 * PATCH  /api/calendar/rows/[id]   Update a row (RLS + the client-guard
 *                                  trigger jointly decide which columns
 *                                  the caller may actually change).
 * DELETE /api/calendar/rows/[id]   Remove a row (PM / content-writer only,
 *                                  enforced by RLS).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const updates: Record<string, unknown> = {};
  for (const key of EDITABLE) {
    if (key in body) updates[key] = body[key];
  }
  updates.updated_by = user.id;

  if (Object.keys(updates).length <= 1) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("calendar_rows")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ row: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { error } = await sb
    .from("calendar_rows")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
