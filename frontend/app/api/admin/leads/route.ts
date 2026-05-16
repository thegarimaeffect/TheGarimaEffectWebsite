import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/supabase/admin";
import { validateLead } from "@/lib/validation";

/**
 * GET  /api/admin/leads   List every lead (admin only)
 * POST /api/admin/leads   Create a lead (admin only)
 */

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const { data, error } = await gate.sb
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ leads: data ?? [] });
}

export async function POST(request: NextRequest) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const body = await request.json().catch(() => null);
  const result = validateLead(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const { data, error } = await gate.sb
    .from("leads")
    .insert(result.data)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ lead: data });
}
