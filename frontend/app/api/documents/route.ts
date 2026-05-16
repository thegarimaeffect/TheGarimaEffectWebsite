import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

const BUCKET = "brand-documents";
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

/**
 * POST /api/documents  (multipart form-data)
 * fields: file, brand_id, kind ('onboarding' | 'signed'), campaign_id?
 *
 * - admin  → any kind, any brand
 * - client → only kind='signed', only their own brand_id
 * Storage + insert run with the service client; we authorize first.
 */
export async function POST(request: NextRequest) {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = profile?.role;

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "expected form-data" }, { status: 400 });
  }
  const file = form.get("file");
  const brandId = form.get("brand_id");
  const kind = form.get("kind");
  const campaignId = form.get("campaign_id");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file too large (max 25MB)" }, { status: 400 });
  }
  if (typeof brandId !== "string" || (kind !== "onboarding" && kind !== "signed")) {
    return NextResponse.json(
      { error: "brand_id and valid kind required" },
      { status: 400 }
    );
  }

  const isAdmin = role === "admin";
  const isOwningClient = role === "client" && user.id === brandId;
  if (!isAdmin && !(isOwningClient && kind === "signed")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const svc = createServiceClient();
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${brandId}/${kind}/${Date.now()}-${safeName}`;

  const { error: upErr } = await svc.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 400 });
  }

  const { data, error } = await svc
    .from("documents")
    .insert({
      brand_id: brandId,
      campaign_id: typeof campaignId === "string" && campaignId ? campaignId : null,
      kind,
      name: file.name,
      storage_path: path,
      file_size: file.size,
      mime_type: file.type || null,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (error) {
    // best-effort rollback of the orphaned object
    await svc.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ document: data });
}
