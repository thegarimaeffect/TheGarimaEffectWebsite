import { NextResponse, type NextRequest } from "next/server";

const VALID = new Set(["admin", "product_manager", "intern", "client", "off"]);
const HOME: Record<string, string> = {
  admin: "/admin",
  product_manager: "/pm",
  intern: "/intern",
  client: "/client",
};

/**
 * /preview/<role>  → sets the preview_role cookie + redirects to that role's home.
 * /preview/off     → clears the cookie, sends you to /login.
 *
 * IMPORTANT: use request.nextUrl.clone() (which preserves the actual Host
 * header, e.g. "localhost") instead of request.nextUrl.origin (which can
 * resolve to the container's bind address "0.0.0.0" when running in Docker —
 * that breaks the cookie because cookies are bound to "localhost").
 */
export async function GET(request: NextRequest, { params }: { params: { role: string } }) {
  const role = params.role;
  if (!VALID.has(role)) {
    return NextResponse.json({ error: "invalid role" }, { status: 400 });
  }

  // Build absolute redirect URL using the original Host header, fallback to localhost
  const host = request.headers.get("host") || "localhost:3000";
  const proto =
    request.headers.get("x-forwarded-proto") ||
    (host.startsWith("localhost") ? "http" : "https");

  if (role === "off") {
    const res = NextResponse.redirect(`${proto}://${host}/login`);
    res.cookies.delete("preview_role");
    return res;
  }

  const res = NextResponse.redirect(`${proto}://${host}${HOME[role]}`);
  res.cookies.set("preview_role", role, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8h
  });
  return res;
}
