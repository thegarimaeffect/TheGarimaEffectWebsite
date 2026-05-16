"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import type { Profile, UserRole } from "@/lib/supabase/database.types";
import PageBackdrop from "./PageBackdrop";
import NotificationBell from "./NotificationBell";

const NAV_BY_ROLE: Record<UserRole, { label: string; href: string; icon: string }[]> = {
  admin: [
    { label: "Overview", href: "/admin", icon: "✦" },
    { label: "Brands", href: "/admin/brands", icon: "✿" },
    { label: "People", href: "/admin/people", icon: "◆" },
    { label: "Leads", href: "/admin/leads", icon: "✧" },
  ],
  product_manager: [
    { label: "Overview", href: "/pm", icon: "✦" },
  ],
  intern: [
    { label: "My Tasks", href: "/intern", icon: "✦" },
  ],
  client: [
    { label: "My Journey", href: "/client", icon: "✦" },
    { label: "Calendar", href: "/client/calendar", icon: "◆" },
  ],
};

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  product_manager: "Product Manager",
  intern: "Intern",
  client: "Client",
};

const ROLE_ACCENT: Record<UserRole, string> = {
  admin: "#e8547a",
  product_manager: "#b89ce0",
  intern: "#f5c842",
  client: "#ff8aab",
};

export default function DashboardShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = NAV_BY_ROLE[profile.role];
  const accent = ROLE_ACCENT[profile.role];

  async function signOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials =
    (profile.full_name || profile.email)
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s: string) => s[0]?.toUpperCase() ?? "")
      .join("") || "✦";

  return (
    <div
      className="min-h-screen flex relative"
      style={{
        background:
          "radial-gradient(ellipse at 18% 12%, rgba(255,200,220,0.7) 0%, transparent 55%)," +
          "radial-gradient(ellipse at 82% 88%, rgba(200,175,240,0.6) 0%, transparent 55%)," +
          "radial-gradient(ellipse at 50% 50%, rgba(255,215,220,0.35) 0%, transparent 70%)," +
          "linear-gradient(135deg, #fff5f4 0%, #fbe5ee 40%, #ead8f5 75%, #fadff2 100%)",
      }}
    >
      {/* SIDEBAR — desktop */}
      <Sidebar
        nav={nav}
        pathname={pathname}
        profile={profile}
        accent={accent}
        initials={initials}
        signOut={signOut}
        signingOut={signingOut}
      />

      {/* MOBILE TOPBAR */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-4"
        style={{
          background: "rgba(255,244,245,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(232,84,122,0.18)",
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-[12px] font-bold tracking-[0.18em] uppercase"
          style={{ color: "var(--color-text-deep)" }}
        >
          <span style={{ color: "#e8547a" }}>✦</span>
          Garima Effect
        </Link>
        <button
          aria-label="Menu"
          onClick={() => setMobileOpen(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #e8547a, #b89ce0)",
            color: "white",
          }}
        >
          ☰
        </button>
      </div>

      {/* Bell — single instance, positioned for both mobile (under topbar)
          and desktop (top-right). One <NotificationBell /> avoids duplicate
          realtime channels colliding. */}
      <div className="absolute right-4 top-3 lg:top-6 lg:right-6 z-40">
        <NotificationBell />
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: "rgba(61,26,77,0.5)", backdropFilter: "blur(8px)" }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[280px] lg:hidden"
            >
              <Sidebar
                nav={nav}
                pathname={pathname}
                profile={profile}
                accent={accent}
                initials={initials}
                signOut={signOut}
                signingOut={signingOut}
                onNavigate={() => setMobileOpen(false)}
                mobile
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <main className="flex-1 min-w-0 relative">
        <PageBackdrop variant="default" />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 p-5 md:p-10 pt-20 lg:pt-10 max-w-[1500px] mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

// ============================================================================
// SIDEBAR
// ============================================================================

function Sidebar({
  nav,
  pathname,
  profile,
  accent,
  initials,
  signOut,
  signingOut,
  onNavigate,
  mobile = false,
}: {
  nav: { label: string; href: string; icon: string }[];
  pathname: string;
  profile: Profile;
  accent: string;
  initials: string;
  signOut: () => void;
  signingOut: boolean;
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  return (
    <aside
      className={`${
        mobile ? "flex" : "hidden lg:flex"
      } w-[280px] flex-col px-6 py-8 ${mobile ? "h-full" : "sticky top-0 h-screen"} relative overflow-hidden`}
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(251,229,238,0.82) 50%, rgba(234,216,245,0.85) 100%)",
        backdropFilter: "blur(14px) saturate(130%)",
        borderRight: "1px solid rgba(232,84,122,0.18)",
      }}
    >
      {/* Decorative orbs */}
      <div
        aria-hidden
        className="absolute -top-20 -left-10 w-48 h-48 rounded-full blur-3xl opacity-50 pointer-events-none"
        style={{ background: `${accent}55` }}
      />
      <div
        aria-hidden
        className="absolute -bottom-20 -right-10 w-48 h-48 rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{ background: "rgba(184,156,224,0.45)" }}
      />

      <Link
        href="/"
        className="flex items-center gap-2 text-[13px] font-bold tracking-[0.18em] uppercase mb-2 relative"
        style={{ color: "var(--color-text-deep)" }}
      >
        <motion.span
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          style={{ display: "inline-block", color: "#e8547a" }}
        >
          ✦
        </motion.span>
        Garima Effect
      </Link>
      <p
        className="text-[20px] mb-8 relative"
        style={{
          fontFamily: "var(--font-script), cursive",
          fontWeight: 700,
          background: "linear-gradient(135deg, #4a1a4d 0%, #e8547a 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          marginTop: -2,
        }}
      >
        from concept to content
      </p>

      <p
        className="text-[10px] tracking-[0.32em] uppercase font-bold mb-4 flex items-center gap-2 relative"
        style={{ color: "var(--color-text-muted)" }}
      >
        <span className="h-px w-6" style={{ background: "rgba(232,84,122,0.35)" }} />
        {ROLE_LABELS[profile.role]}
      </p>

      <nav className="flex flex-col gap-1 relative">
        {nav.map((n) => {
          const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={onNavigate}
              className="px-4 py-3 rounded-xl text-[14px] font-medium transition flex items-center gap-3 relative overflow-hidden group"
              style={{
                background: active
                  ? "linear-gradient(135deg, #e8547a 0%, #b89ce0 100%)"
                  : "rgba(255,255,255,0.4)",
                color: active ? "white" : "var(--color-text-deep)",
                boxShadow: active
                  ? "0 12px 32px rgba(232,84,122,0.32)"
                  : "0 2px 8px rgba(155,127,199,0.06)",
                border: active
                  ? "1px solid rgba(255,255,255,0.4)"
                  : "1px solid rgba(232,84,122,0.12)",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  opacity: active ? 1 : 0.7,
                  filter: active ? "drop-shadow(0 0 8px rgba(255,255,255,0.5))" : "none",
                }}
              >
                {n.icon}
              </span>
              <span className="flex-1">{n.label}</span>
              {active && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[10px] opacity-80"
                >
                  →
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className="mt-auto relative">
        <div
          className="p-4 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(232,84,122,0.22)",
            boxShadow: "0 10px 30px rgba(155,127,199,0.16)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full p-[2px] flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #e8547a, #b89ce0)" }}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center text-[13px] font-bold"
                style={{
                  background: "white",
                  color: "var(--color-text-deep)",
                }}
              >
                {initials}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-[13px] font-semibold truncate"
                style={{ color: "var(--color-text-deep)" }}
              >
                {profile.full_name || profile.email.split("@")[0]}
              </p>
              <p
                className="text-[10px] tracking-[0.18em] uppercase truncate"
                style={{ color: "var(--color-text-muted)" }}
              >
                {profile.email}
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            disabled={signingOut}
            className="mt-3 w-full text-[11px] tracking-[0.22em] uppercase font-bold py-2 rounded-lg transition hover:bg-[#e8547a] hover:text-white"
            style={{
              color: "#e8547a",
              background: "rgba(232,84,122,0.08)",
              border: "1px solid rgba(232,84,122,0.3)",
            }}
          >
            {signingOut ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      </div>
    </aside>
  );
}
