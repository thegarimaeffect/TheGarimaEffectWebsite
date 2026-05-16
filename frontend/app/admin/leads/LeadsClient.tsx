"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PageHero from "@/components/dashboard/PageHero";
import LeadDrawer from "@/components/admin/LeadDrawer";
import type { Lead, LeadStatus, Profile } from "@/lib/supabase/database.types";

const FILTERS: ("all" | LeadStatus)[] = [
  "all",
  "new",
  "contacted",
  "qualified",
  "negotiating",
  "won",
  "lost",
];

function isDueSoon(date: string | null): boolean {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(date) <= today;
}

export default function LeadsClient({
  profile,
  leads,
}: {
  profile: Profile;
  leads: Lead[];
}) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = leads.filter((l) => {
    if (filter !== "all" && l.status !== filter) return false;
    if (!q.trim()) return true;
    const hay = `${l.full_name} ${l.email ?? ""} ${l.phone ?? ""} ${
      l.source ?? ""
    }`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  const counts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});

  const dueCount = leads.filter((l) => isDueSoon(l.follow_up_date)).length;

  function openNew() {
    setEditing(null);
    setDrawerOpen(true);
  }
  function openEdit(lead: Lead) {
    setEditing(lead);
    setDrawerOpen(true);
  }

  async function quickStatus(lead: Lead, status: LeadStatus) {
    setBusyId(lead.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: lead.full_name,
          email: lead.email,
          phone: lead.phone,
          notes: lead.notes,
          status,
          follow_up_date: lead.follow_up_date,
          source: lead.source,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "update failed");
      }
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function remove(lead: Lead) {
    if (!confirm(`Delete lead "${lead.full_name}"?`)) return;
    setBusyId(lead.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "delete failed");
      }
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <DashboardShell profile={profile}>
      <PageHero
        eyebrow="Admin · Leads"
        title="The pipeline"
        subtitle="Every prospective brand — where they are, and when to chase."
        right={
          <button
            onClick={openNew}
            className="cta-solid"
            style={{ padding: "14px 28px", fontSize: 12 }}
          >
            + Add Lead <span>✦</span>
          </button>
        }
      />

      {dueCount > 0 && (
        <div
          className="mb-6 px-5 py-4 rounded-2xl flex items-center gap-3"
          style={{
            background: "rgba(245,200,66,0.16)",
            border: "1px solid rgba(245,200,66,0.5)",
          }}
        >
          <span className="text-[18px]">⏰</span>
          <p className="text-[13px] font-semibold" style={{ color: "#a07700" }}>
            {dueCount} lead{dueCount === 1 ? "" : "s"} need following up today or
            are overdue.
          </p>
        </div>
      )}

      {error && (
        <div
          className="mb-6 px-4 py-3 rounded-xl text-[13px]"
          style={{
            background: "rgba(232,84,122,0.1)",
            color: "#c23b68",
            border: "1px solid rgba(232,84,122,0.3)",
          }}
        >
          ⚠ {error}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className="text-[11px] tracking-[0.18em] uppercase font-bold py-2 px-4 rounded-full transition"
              style={{
                background:
                  filter === k
                    ? "linear-gradient(135deg, #e8547a, #b89ce0)"
                    : "rgba(255,255,255,0.55)",
                color: filter === k ? "white" : "var(--color-text-deep)",
                border:
                  filter === k
                    ? "1px solid rgba(255,255,255,0.5)"
                    : "1px solid rgba(232,84,122,0.25)",
              }}
            >
              {k === "all" ? "All" : k}
              <span className="ml-2 opacity-80">
                {k === "all" ? leads.length : counts[k] ?? 0}
              </span>
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="ml-auto px-4 py-2.5 rounded-full text-[13px]"
          style={{
            background: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(232,84,122,0.25)",
            color: "var(--color-text-deep)",
            minWidth: 200,
          }}
        />
      </div>

      <div
        className="overflow-x-auto rounded-[20px]"
        style={{
          border: "1px solid rgba(232,84,122,0.2)",
          background: "rgba(255,255,255,0.6)",
        }}
      >
        <table
          className="w-full"
          style={{ borderCollapse: "collapse", minWidth: 980 }}
        >
          <thead>
            <tr
              style={{
                background:
                  "linear-gradient(135deg, rgba(232,84,122,0.12), rgba(184,156,224,0.12))",
              }}
            >
              {[
                "Name",
                "Contact",
                "Source",
                "Status",
                "Follow-up",
                "Notes",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="text-[10px] tracking-[0.18em] uppercase font-bold px-4 py-3 text-left"
                  style={{
                    color: "var(--color-text-deep)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((l, idx) => {
              const due = isDueSoon(l.follow_up_date);
              return (
                <tr
                  key={l.id}
                  style={{
                    borderTop: "1px solid rgba(232,84,122,0.14)",
                    background:
                      idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.4)",
                    opacity: busyId === l.id ? 0.5 : 1,
                  }}
                >
                  <td className="px-4 py-3 align-top">
                    <p
                      className="text-[14px] font-semibold"
                      style={{ color: "var(--color-text-deep)" }}
                    >
                      {l.full_name}
                    </p>
                    <p
                      className="text-[11px]"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Added {new Date(l.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-top">
                    {l.email && (
                      <p
                        className="text-[13px]"
                        style={{ color: "var(--color-text-body)" }}
                      >
                        {l.email}
                      </p>
                    )}
                    {l.phone && (
                      <p
                        className="text-[13px]"
                        style={{ color: "var(--color-text-body)" }}
                      >
                        {l.phone}
                      </p>
                    )}
                    {!l.email && !l.phone && (
                      <span
                        className="text-[12px] italic"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        —
                      </span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3 align-top text-[13px]"
                    style={{ color: "var(--color-text-body)" }}
                  >
                    {l.source || "—"}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <select
                      value={l.status}
                      disabled={busyId === l.id}
                      onChange={(e) =>
                        quickStatus(l, e.target.value as LeadStatus)
                      }
                      className="text-[11px] tracking-[0.12em] uppercase font-bold py-1.5 px-3 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.8)",
                        color: "var(--color-text-deep)",
                        border: "1px solid rgba(232,84,122,0.3)",
                      }}
                    >
                      {(
                        [
                          "new",
                          "contacted",
                          "qualified",
                          "negotiating",
                          "won",
                          "lost",
                        ] as LeadStatus[]
                      ).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 align-top">
                    {l.follow_up_date ? (
                      <span
                        className="text-[12px] tracking-[0.1em] uppercase font-bold"
                        style={{
                          color: due ? "#a07700" : "var(--color-text-muted)",
                        }}
                      >
                        {due ? "⏰ " : ""}
                        {new Date(l.follow_up_date).toLocaleDateString()}
                      </span>
                    ) : (
                      <span
                        className="text-[12px] italic"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        —
                      </span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3 align-top text-[13px] max-w-[260px]"
                    style={{ color: "var(--color-text-body)" }}
                  >
                    <span className="line-clamp-2">{l.notes || "—"}</span>
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap">
                    <button
                      onClick={() => openEdit(l)}
                      className="text-[11px] tracking-[0.18em] uppercase font-bold mr-3"
                      style={{ color: "#e8547a" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(l)}
                      disabled={busyId === l.id}
                      className="text-[11px] tracking-[0.18em] uppercase font-bold opacity-60 hover:opacity-100"
                      style={{ color: "#c23b68" }}
                    >
                      {busyId === l.id ? "…" : "Delete"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <p
                    className="text-2xl mb-2"
                    style={{
                      fontFamily: "var(--font-script), cursive",
                      color: "var(--color-text-deep)",
                      fontWeight: 700,
                    }}
                  >
                    No leads here ✦
                  </p>
                  <button
                    onClick={openNew}
                    className="cta-solid mx-auto mt-3"
                    style={{ padding: "12px 24px", fontSize: 11 }}
                  >
                    + Add Lead
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <LeadDrawer
        open={drawerOpen}
        lead={editing}
        onClose={() => setDrawerOpen(false)}
      />
    </DashboardShell>
  );
}
