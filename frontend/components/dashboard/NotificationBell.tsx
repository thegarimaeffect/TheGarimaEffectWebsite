"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import type { Notification } from "@/lib/supabase/database.types";

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

export default function NotificationBell() {
  const router = useRouter();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, ""); // unique per instance
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    const supabase = createClient();
    const load = async () => {
      try {
        const { data } = await supabase
          .from("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);
        if (!alive) return;
        const list = (data ?? []) as Notification[];
        setItems(list);
        setUnread(list.filter((n) => !n.read_at).length);
      } catch {
        /* swallow — keep last good state */
      }
    };
    load();

    // Realtime — best-effort. If the WS can't connect (e.g. anonymous user
    // in preview mode), don't break the page; polling fallback still works.
    let ch: ReturnType<typeof supabase.channel> | null = null;
    try {
      ch = supabase
        .channel(`notifications-bell-${uid}`) // unique name per instance
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "notifications" },
          () => load()
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            // silently rely on polling
          }
        });
    } catch {
      /* swallow realtime setup errors */
    }

    // Polling fallback (every 30s)
    const t = setInterval(load, 30_000);
    return () => {
      alive = false;
      if (ch) {
        try { supabase.removeChannel(ch); } catch { /* swallow */ }
      }
      clearInterval(t);
    };
  }, [uid]);

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  async function markAllRead() {
    const supabase = createClient();
    const ids = items.filter((n) => !n.read_at).map((n) => n.id);
    if (ids.length === 0) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", ids);
    setItems((prev) =>
      prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() }))
    );
    setUnread(0);
  }

  async function onClickItem(n: Notification) {
    if (!n.read_at) {
      const supabase = createClient();
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", n.id);
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x))
      );
      setUnread((u) => Math.max(0, u - 1));
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  return (
    <div className="relative" ref={popRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative w-10 h-10 rounded-full flex items-center justify-center transition hover:bg-[#e8547a]/10"
        style={{
          background: "rgba(255,255,255,0.5)",
          border: "1px solid rgba(232,84,122,0.3)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--color-text-deep)" }}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center text-white"
            style={{
              background: "linear-gradient(135deg, #e8547a, #c23b68)",
              boxShadow: "0 4px 12px rgba(232,84,122,0.5)",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 right-0 w-[360px] max-w-[calc(100vw-32px)] rounded-2xl overflow-hidden z-50"
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(12px) saturate(130%)",
              border: "1px solid rgba(232,84,122,0.25)",
              boxShadow: "0 30px 80px rgba(155,127,199,0.3)",
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(232,84,122,0.18)" }}
            >
              <div>
                <p
                  className="text-[9px] tracking-[0.4em] uppercase font-bold"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  ✦ Notifications
                </p>
                <p
                  className="text-[14px] font-bold mt-0.5"
                  style={{ color: "var(--color-text-deep)" }}
                >
                  {unread > 0 ? `${unread} unread` : "All caught up"}
                </p>
              </div>
              <button
                onClick={markAllRead}
                disabled={unread === 0}
                className="text-[10px] tracking-[0.18em] uppercase font-bold"
                style={{ color: unread > 0 ? "#e8547a" : "var(--color-text-muted)" }}
              >
                Mark all read
              </button>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {items.length === 0 && (
                <p
                  className="text-[13px] text-center italic px-5 py-10"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Nothing here yet — you're current.
                </p>
              )}
              {items.map((n) => {
                const tone = TONE[n.type];
                const icon = ICON[n.type];
                return (
                  <button
                    key={n.id}
                    onClick={() => onClickItem(n)}
                    className="w-full text-left px-5 py-4 flex gap-3 transition hover:bg-[#e8547a]/5"
                    style={{
                      borderBottom: "1px solid rgba(232,84,122,0.1)",
                      background: n.read_at ? "transparent" : "rgba(255,220,232,0.3)",
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-base font-bold"
                      style={{
                        background: `${tone}22`,
                        color: tone,
                        border: `1px solid ${tone}55`,
                      }}
                    >
                      {icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-[13px] font-bold leading-tight"
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
                      {n.body && (
                        <p
                          className="text-[12px] mt-1 leading-relaxed line-clamp-2"
                          style={{ color: "var(--color-text-body)" }}
                        >
                          {n.body}
                        </p>
                      )}
                      <p
                        className="text-[10px] tracking-[0.18em] uppercase mt-1"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {relativeTime(n.created_at)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block px-5 py-3 text-center text-[11px] tracking-[0.3em] uppercase font-bold transition"
              style={{
                color: "#e8547a",
                background: "rgba(232,84,122,0.05)",
                borderTop: "1px solid rgba(232,84,122,0.18)",
              }}
            >
              View all
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function relativeTime(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diff = Math.max(0, now - t);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
