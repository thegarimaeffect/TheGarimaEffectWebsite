import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/supabase/admin";
import { validateLead } from "@/lib/validation";

/**
 * PATCH  /api/admin/leads/[id]   Update a lead (admin only)
 * DELETE /api/admin/leads/[id]   Delete a lead (admin only)
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const body = await request.json().catch(() => null);
  const result = validateLead(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const { data, error } = await gate.sb
    .from("leads")
    .update(result.data)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ lead: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const { error } = await gate.sb.from("leads").delete().eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
