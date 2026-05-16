import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/client/intake
 * Upserts the calling client's brand_intake row and stamps submitted_at.
 * RLS (bi_client_insert / bi_client_update) guarantees a client can only
 * ever touch their own row; credentials remain admin-only on read.
 */
export async function POST(request: NextRequest) {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "missing body" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  const str = (v: unknown): string | null =>
    typeof v === "string" && v.trim() ? v.trim() : null;
  const obj = (v: unknown): Record<string, string> =>
    v && typeof v === "object" && !Array.isArray(v)
      ? (v as Record<string, string>)
      : {};

  const payload = {
    client_id: user.id,
    instagram_handle: str(b.instagram_handle),
    brand_voice: str(b.brand_voice),
    target_audience: str(b.target_audience),
    competitors: str(b.competitors),
    goals_text: str(b.goals_text),
    additional_notes: str(b.additional_notes),
    other_platforms: obj(b.other_platforms),
    credentials: obj(b.credentials),
    submitted_at: new Date().toISOString(),
  };

  const { data: existing } = await sb
    .from("brand_intake")
    .select("id")
    .eq("client_id", user.id)
    .maybeSingle();

  const { error } = existing
    ? await sb.from("brand_intake").update(payload).eq("client_id", user.id)
    : await sb.from("brand_intake").insert(payload);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
