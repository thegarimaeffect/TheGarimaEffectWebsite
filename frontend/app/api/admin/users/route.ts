import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/supabase/admin";
import { validateCreateUser } from "@/lib/validation";

/**
 * GET  /api/admin/users          List all profiles (admin only)
 * POST /api/admin/users          Create a user (admin only)
 */

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const { data, error } = await gate.sb
    .from("profiles")
    .select("id, email, full_name, role, company_name, phone, avatar_url, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ users: data ?? [] });
}

export async function POST(request: NextRequest) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const body = await request.json().catch(() => null);
  const result = validateCreateUser(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const { email, password, full_name, role, company_name, phone } = result.data;

  // Create the auth user. email_confirm=true skips the confirmation email
  // since the admin is vouching for them.
  const { data: created, error: createErr } = await gate.sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name,
      role,
      company_name,
      phone,
    },
  });
  if (createErr || !created.user) {
    return NextResponse.json(
      { error: createErr?.message ?? "failed to create user" },
      { status: 400 }
    );
  }

  // The handle_new_user trigger has already created the profile and synced
  // the role into app_metadata. Belt-and-braces: explicitly UPDATE in case
  // raw_user_meta_data didn't carry through.
  await gate.sb
    .from("profiles")
    .update({ full_name, role, company_name: company_name ?? null, phone: phone ?? null })
    .eq("id", created.user.id);

  return NextResponse.json({
    user: {
      id: created.user.id,
      email: created.user.email,
      full_name,
      role,
      company_name: company_name ?? null,
    },
  });
}
