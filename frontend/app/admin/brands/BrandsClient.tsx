"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PageHero from "@/components/dashboard/PageHero";
import StatBadge from "@/components/dashboard/StatBadge";
import type { Profile } from "@/lib/supabase/database.types";
import type { BrandSummary } from "./page";

export default function BrandsClient({
  profile,
  brands,
}: {
  profile: Profile;
  brands: BrandSummary[];
}) {
  const [q, setQ] = useState("");

  const visible = brands.filter((b) => {
    if (!q.trim()) return true;
    const hay = `${b.client.company_name ?? ""} ${b.client.full_name ?? ""} ${
      b.client.email
    }`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  return (
    <DashboardShell profile={profile}>
      <PageHero
        eyebrow="Admin · Brands"
        title="Every brand we touch"
        subtitle="The clients, their campaigns, and where each story stands today."
        right={
          <Link
            href="/admin/people"
            className="cta-solid"
            style={{ padding: "14px 28px", fontSize: 12 }}
          >
            + Onboard a Brand <span>✦</span>
          </Link>
        }
      />

      <div className="mb-8 max-w-md">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search brands…"
          className="w-full px-5 py-3 rounded-full text-[14px]"
          style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(232,84,122,0.25)",
            color: "var(--color-text-deep)",
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {visible.map((b, i) => {
          const initials = (b.client.company_name || b.client.full_name || b.client.email)
            .split(/[\s@.]+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((s) => s[0]?.toUpperCase() ?? "")
            .join("");
          return (
            <motion.div
              key={b.client.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link href={`/admin/brands/${b.client.id}`}>
                <div className="glass p-6 relative overflow-hidden h-full cursor-pointer">
                  <div
                    aria-hidden
                    className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-50"
                    style={{ background: "rgba(232,84,122,0.4)" }}
                  />
                  <div className="flex items-start gap-4 relative">
                    <div
                      className="w-14 h-14 rounded-full p-[2px] flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #e8547a, #b89ce0)" }}
                    >
                      <div
                        className="w-full h-full rounded-full flex items-center justify-center text-[15px] font-bold bg-white"
                        style={{ color: "var(--color-text-deep)" }}
                      >
                        {initials || "✦"}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="font-bold text-[17px] truncate"
                        style={{ color: "var(--color-text-deep)" }}
                      >
                        {b.client.company_name || b.client.full_name || "Unnamed brand"}
                      </p>
                      <p
                        className="text-[12px] truncate"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {b.client.full_name || b.client.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 relative flex items-center gap-2 flex-wrap">
                    <span
                      className="text-[11px] tracking-[0.2em] uppercase font-bold py-1.5 px-3 rounded-full"
                      style={{
                        background: "rgba(184,156,224,0.18)",
                        color: "#5d3a8c",
                        border: "1px solid rgba(184,156,224,0.45)",
                      }}
                    >
                      {b.campaigns.length} campaign
                      {b.campaigns.length === 1 ? "" : "s"}
                    </span>
                    {b.calendarStates[0] && (
                      <StatBadge status={b.calendarStates[0]} />
                    )}
                    <span
                      className="text-[20px] ml-auto"
                      style={{ color: "#e8547a" }}
                    >
                      →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="glass p-14 text-center">
          <p
            className="text-3xl mb-2"
            style={{
              fontFamily: "var(--font-script), cursive",
              color: "var(--color-text-deep)",
              fontWeight: 700,
            }}
          >
            No brands yet ✦
          </p>
          <p className="text-[14px]" style={{ color: "var(--color-text-body)" }}>
            Onboard your first client from the People page.
          </p>
        </div>
      )}
    </DashboardShell>
  );
}
