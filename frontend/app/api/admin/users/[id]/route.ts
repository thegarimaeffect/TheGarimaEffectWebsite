import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/supabase/admin";
import { isValidRole } from "@/lib/validation";

/**
 * PATCH  /api/admin/users/[id]   Update full_name / role / company_name
 * DELETE /api/admin/users/[id]   Delete the user and their profile
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const updates: Record<string, unknown> = {};

  if (typeof body.full_name === "string" && body.full_name.trim().length >= 2) {
    updates.full_name = body.full_name.trim();
  }
  if (typeof body.company_name === "string") {
    updates.company_name = body.company_name.trim() || null;
  }
  if (typeof body.phone === "string") {
    updates.phone = body.phone.trim() || null;
  }
  if (body.role !== undefined) {
    if (!isValidRole(body.role)) {
      return NextResponse.json({ error: "invalid role" }, { status: 400 });
    }
    updates.role = body.role;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  const { data, error } = await gate.sb
    .from("profiles")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ user: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  // Safety: prevent deleting the seed admin (only one admin in seed data)
  const { data: prof } = await gate.sb
    .from("profiles")
    .select("role, email")
    .eq("id", params.id)
    .single();
  if (prof && prof.role === "admin") {
    return NextResponse.json(
      { error: "cannot delete an admin via this endpoint" },
      { status: 400 }
    );
  }

  // Deleting from auth.users cascades to public.profiles via FK
  const { error } = await gate.sb.auth.admin.deleteUser(params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
