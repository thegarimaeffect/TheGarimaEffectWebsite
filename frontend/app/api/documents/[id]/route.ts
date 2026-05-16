import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

const BUCKET = "brand-documents";

async function authorize(id: string) {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };

  const svc = createServiceClient();
  const { data: doc } = await svc
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();
  if (!doc) return { error: NextResponse.json({ error: "not found" }, { status: 404 }) };

  const { data: profile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = profile?.role;

  let allowed = role === "admin" || doc.brand_id === user.id;
  if (!allowed && role === "product_manager") {
    const { data: camp } = await svc
      .from("campaigns")
      .select("id")
      .eq("pm_id", user.id)
      .eq("client_id", doc.brand_id)
      .limit(1);
    allowed = !!camp && camp.length > 0;
  }
  if (!allowed) {
    return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return { user, role, doc, svc };
}

/** GET /api/documents/[id] → { url } short-lived signed download URL */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const a = await authorize(params.id);
  if ("error" in a) return a.error;

  const { data, error } = await a.svc.storage
    .from(BUCKET)
    .createSignedUrl(a.doc.storage_path, 60 * 5);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ url: data.signedUrl });
}

/** DELETE /api/documents/[id] — admin or the uploader */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const a = await authorize(params.id);
  if ("error" in a) return a.error;

  if (a.role !== "admin" && a.doc.uploaded_by !== a.user.id) {
    return NextResponse.json(
      { error: "only an admin or the uploader can delete" },
      { status: 403 }
    );
  }

  await a.svc.storage.from(BUCKET).remove([a.doc.storage_path]);
  const { error } = await a.svc.from("documents").delete().eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
