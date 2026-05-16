"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PageHero from "@/components/dashboard/PageHero";
import type { Notification, Profile } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/browser";

const ICON: Record<Notification["type"], string> = {
  task_assigned: "✦",
  task_submitted: "◆",
  task_approved: "✓",
  task_rejected: "⚠",
  task_resubmitted: "↻",
  campaign_started: "🎬",
  calendar_submitted: "📅",
  calendar_approved: "✓",
  calendar_changes_requested: "✎",
  task_due_soon: "⏰",
  lead_followup: "☎",
  credentials_requested: "🔑",
  message_received: "✉",
};

const TONE: Record<Notification["type"], string> = {
  task_assigned: "#b89ce0",
  task_submitted: "#f5c842",
  task_approved: "#4caf6c",
  task_rejected: "#c23b68",
  task_resubmitted: "#9b7fc7",
  campaign_started: "#e8547a",
  calendar_submitted: "#b89ce0",
  calendar_approved: "#4caf6c",
  calendar_changes_requested: "#c23b68",
  task_due_soon: "#f5c842",
  lead_followup: "#9b7fc7",
  credentials_requested: "#e8547a",
  message_received: "#b89ce0",
};

export default function NotificationsClient({
  profile,
  initial,
}: {
  profile: Profile;
  initial: Notification[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filtered = filter === "all" ? items : items.filter((n) => !n.read_at);
  const unread = items.filter((n) => !n.read_at).length;

  async function markAllRead() {
    const ids = items.filter((n) => !n.read_at).map((n) => n.id);
    if (ids.length === 0) return;
    const supabase = createClient();
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", ids);
    setItems((prev) =>
      prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() }))
    );
  }

  async function clickItem(n: Notification) {
    if (!n.read_at) {
      const supabase = createClient();
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", n.id);
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x))
      );
    }
    if (n.link) router.push(n.link);
  }

  return (
    <DashboardShell profile={profile}>
      <PageHero
        eyebrow="Notifications"
        title="Your inbox"
        subtitle={unread > 0 ? `${unread} unread · everything else current` : "All caught up ✦"}
        right={
          <button
            onClick={markAllRead}
            disabled={unread === 0}
            className="cta-outline"
            style={{ padding: "10px 20px", fontSize: 11, opacity: unread === 0 ? 0.5 : 1 }}
          >
            Mark all read
          </button>
        }
      />

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6">
        {(["all", "unread"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className="text-[11px] tracking-[0.22em] uppercase font-bold py-2 px-4 rounded-full transition"
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
              boxShadow:
                filter === k ? "0 8px 24px rgba(232,84,122,0.3)" : "none",
            }}
          >
            {k}
            {k === "unread" && unread > 0 && (
              <span className="ml-2 opacity-80">{unread}</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((n) => {
          const tone = TONE[n.type];
          const icon = ICON[n.type];
          return (
            <button
              key={n.id}
              onClick={() => clickItem(n)}
              className="w-full text-left glass p-5 md:p-6 flex gap-4 items-start transition hover:scale-[1.005]"
              style={{
                background: n.read_at ? undefined : "rgba(255,220,232,0.45)",
                borderColor: n.read_at ? undefined : `${tone}66`,
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-lg font-bold"
                style={{
                  background: `${tone}22`,
                  color: tone,
                  border: `1px solid ${tone}55`,
                }}
              >
                {icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p
                    className="text-[15px] font-bold leading-tight"
                    style={{ color: "var(--color-text-deep)" }}
                  >
                    {n.title}
                    {!n.read_at && (
                      <span
                        className="inline-block ml-2 w-2 h-2 rounded-full align-middle"
                        style={{ background: tone }}
                      />
                    )}
                  </p>
                  <p
                    className="text-[10px] tracking-[0.2em] uppercase font-bold whitespace-nowrap"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
                {n.body && (
                  <p
                    className="text-[13px] mt-2 leading-relaxed"
                    style={{ color: "var(--color-text-body)" }}
                  >
                    {n.body}
                  </p>
                )}
              </div>
              {n.link && (
                <span
                  className="text-[12px] font-bold tracking-[0.2em] uppercase opacity-60 hover:opacity-100 self-center"
                  style={{ color: "#e8547a" }}
                >
                  Open →
                </span>
              )}
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="glass p-14 text-center">
            <p
              className="text-3xl mb-2"
              style={{
                fontFamily: "var(--font-script), cursive",
                color: "var(--color-text-deep)",
                fontWeight: 700,
              }}
            >
              ✦ Nothing here
            </p>
            <p className="text-[14px]" style={{ color: "var(--color-text-body)" }}>
              {filter === "unread"
                ? "All your notifications are read."
                : "No notifications yet."}
            </p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
