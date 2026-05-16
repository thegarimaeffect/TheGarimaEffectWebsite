import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AUTH_COOKIE_NAME } from "@/lib/supabase/constants";

export async function GET() {
  const cookieStore = cookies();
  const all = cookieStore.getAll().map((c) => ({
    name: c.name,
    value_prefix: c.value.slice(0, 50),
    value_len: c.value.length,
  }));

  // Try to decode the auth cookie manually to see what's in it
  let manualDecodeResult: unknown = "no auth cookie";
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  if (authCookie) {
    try {
      const raw = authCookie.value;
      let decoded: string;
      if (raw.startsWith("base64-")) {
        const b64 = raw.slice(7);
        decoded = Buffer.from(b64, "base64").toString("utf8");
      } else {
        decoded = decodeURIComponent(raw);
      }
      const parsed = JSON.parse(decoded);
      manualDecodeResult = {
        keys: Object.keys(parsed),
        access_token_present: typeof parsed.access_token === "string",
        expires_at: parsed.expires_at,
        is_expired: parsed.expires_at && parsed.expires_at * 1000 < Date.now(),
      };
    } catch (e) {
      manualDecodeResult = { error: (e as Error).message };
    }
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  const { data: sessData, error: sessErr } = await supabase.auth.getSession();

  return NextResponse.json({
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVER_URL: process.env.SUPABASE_SERVER_URL,
    },
    expected_cookie_name: AUTH_COOKIE_NAME,
    cookies_visible: all,
    manual_decode: manualDecodeResult,
    getSession: {
      has_session: !!sessData?.session,
      error: sessErr?.message ?? null,
    },
    getUser: {
      email: data.user?.email ?? null,
      role: data.user?.app_metadata?.role ?? null,
      error: error?.message ?? null,
    },
  });
}
