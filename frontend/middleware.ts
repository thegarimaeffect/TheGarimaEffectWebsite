import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { previewRoleFromRequest } from "@/lib/supabase/preview-edge";
import type { UserRole } from "@/lib/supabase/database.types";

const PUBLIC_PATHS = ["/", "/about", "/services", "/case-studies", "/blog", "/faq", "/contact", "/login", "/signup", "/auth", "/preview", "/robots.txt", "/sitemap.xml", "/llms.txt", "/favicon.ico"];
const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin",
  product_manager: "/pm",
  intern: "/intern",
  client: "/client",
};

/**
 * Build a redirect response that PRESERVES any cookies the session-refresh
 * step may have set. Without this, Supabase rotates the refresh_token during
 * a getUser() call, but the redirect strips the Set-Cookie header — so the
 * NEXT request still sends the stale (already-used) refresh_token, fails,
 * and bounces back to /login. That's the "spinner stuck on Signing in…" bug.
 */
function redirectPreservingCookies(
  request: NextRequest,
  fromResponse: NextResponse,
  path: string,
  query?: Record<string, string>
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = ""; // clear any inherited query
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      url.searchParams.set(k, v);
    }
  }
  const redirect = NextResponse.redirect(url);
  // Copy every Set-Cookie that updateSession wrote
  fromResponse.cookies.getAll().forEach((c) => redirect.cookies.set(c));
  return redirect;
}

export async function middleware(request: NextRequest) {
  // PREVIEW MODE — bypass real auth, use cookie role for gating
  const preview = previewRoleFromRequest(request);
  const path = request.nextUrl.pathname;
  if (preview) {
    if (path === "/dashboard" || path === "/login" || path === "/signup") {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_HOME[preview];
      url.search = "";
      return NextResponse.redirect(url);
    }
    // /notifications + /api accessible
    if (path === "/notifications" || path.startsWith("/notifications/") || path.startsWith("/api/")) {
      return NextResponse.next();
    }
    // Role gates
    const gates: Array<{ prefix: string; allowed: UserRole[] }> = [
      { prefix: "/admin", allowed: ["admin"] },
      { prefix: "/pm", allowed: ["product_manager", "admin"] },
      { prefix: "/intern", allowed: ["intern", "admin"] },
      { prefix: "/client", allowed: ["client", "admin"] },
    ];
    for (const g of gates) {
      if (path === g.prefix || path.startsWith(`${g.prefix}/`)) {
        if (!g.allowed.includes(preview)) {
          const url = request.nextUrl.clone();
          url.pathname = ROLE_HOME[preview];
          url.search = "";
          return NextResponse.redirect(url);
        }
      }
    }
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  const isPublic =
    PUBLIC_PATHS.some(
      (p) => path === p || path.startsWith(`${p}/`) || path.startsWith("/_next") || path.startsWith("/api")
    ) ||
    /\.(png|jpg|jpeg|svg|webp|gif|ico|css|js|woff2?|mp4|webm|mov|ogg|m4a|mp3)$/i.test(path);

  // Not logged in → only public allowed
  if (!user) {
    if (isPublic) return response;
    return redirectPreservingCookies(request, response, "/login", { redirect: path });
  }

  // Pull role from JWT app_metadata
  const role = (user.app_metadata?.role as UserRole | undefined) ?? "client";

  // /dashboard → role home
  if (path === "/dashboard") {
    return redirectPreservingCookies(request, response, ROLE_HOME[role]);
  }

  // Logged-in users hitting auth pages → bounce to their dashboard
  if (path === "/login" || path === "/signup") {
    return redirectPreservingCookies(request, response, ROLE_HOME[role]);
  }

  // /notifications is allowed for any signed-in user
  if (path === "/notifications" || path.startsWith("/notifications/")) {
    return response;
  }

  // Role-gated routes
  const gates: Array<{ prefix: string; allowed: UserRole[] }> = [
    { prefix: "/admin", allowed: ["admin"] },
    { prefix: "/pm", allowed: ["product_manager", "admin"] },
    { prefix: "/intern", allowed: ["intern", "admin"] },
    { prefix: "/client", allowed: ["client", "admin"] },
  ];

  for (const g of gates) {
    if (path === g.prefix || path.startsWith(`${g.prefix}/`)) {
      if (!g.allowed.includes(role)) {
        return redirectPreservingCookies(request, response, ROLE_HOME[role]);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico|css|js|woff2?|mp4|webm|mov|ogg|m4a|mp3)).*)",
  ],
};
