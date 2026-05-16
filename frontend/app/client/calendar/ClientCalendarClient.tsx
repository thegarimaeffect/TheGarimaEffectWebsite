"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  Calendar,
  CalendarRow,
  Campaign,
  Profile,
} from "@/lib/supabase/database.types";
import DashboardShell from "@/components/dashboard/DashboardShell";
import StatBadge from "@/components/dashboard/StatBadge";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import ChatPanel from "@/components/chat/ChatPanel";
import type { Thread } from "@/lib/supabase/database.types";

export default function ClientCalendarClient({
  profile,
  campaign,
  calendar,
  rows,
  thread,
  participants,
}: {
  profile: Profile;
  campaign: Campaign | null;
  calendar: Calendar | null;
  rows: CalendarRow[];
  thread: Thread | null;
  participants: Record<string, { name: string; role: string }>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChanges, setShowChanges] = useState(false);
  const [notes, setNotes] = useState("");

  const state = calendar?.state ?? null;
  const canRespond = state === "sent_to_client";

  async function act(action: "approve" | "request_changes") {
    if (!calendar) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/calendar/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendar_id: calendar.id,
          action,
          notes: action === "request_changes" ? notes : undefined,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "action failed");
      }
      setShowChanges(false);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardShell profile={profile}>
      <section
        className="relative overflow-hidden rounded-[36px] p-8 md:p-12 mb-10"
        style={{
          background:
            "radial-gradient(ellipse at 18% 22%, rgba(255,200,220,0.95) 0%, transparent 55%)," +
            "radial-gradient(ellipse at 82% 78%, rgba(200,175,240,0.9) 0%, transparent 55%)," +
            "linear-gradient(135deg, #fff5f4 0%, #fbe5ee 50%, #ead8f5 100%)",
          border: "1px solid rgba(232,84,122,0.18)",
          boxShadow: "0 30px 80px rgba(155,127,199,0.22)",
        }}
      >
        <div className="relative">
          <p
            className="text-[11px] tracking-[0.5em] uppercase font-bold mb-4"
            style={{ color: "#e8547a" }}
          >
            ✦ Your Content Calendar
          </p>
          <h1
            className="section-script mb-3"
            style={{ fontSize: "clamp(40px, 6vw, 80px)", lineHeight: 0.95 }}
          >
            {campaign?.name || "Your calendar"}
          </h1>
          {calendar && (
            <div className="flex items-center gap-3">
              <StatBadge status={calendar.state} />
              <span
                className="text-[13px] italic"
                style={{ color: "var(--color-text-body)" }}
              >
                {state === "sent_to_client" &&
                  "Leave your notes in the pink column, then approve or request changes."}
                {state === "approved" && "Approved & locked. The magic begins."}
                {state === "changes_requested" &&
                  "We're working on your requested changes."}
              </span>
            </div>
          )}
        </div>
      </section>

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

      {!campaign || !calendar || state === "building" ? (
        <div className="glass p-14 text-center max-w-2xl mx-auto">
          <p
            className="text-3xl mb-3"
            style={{
              fontFamily: "var(--font-script), cursive",
              color: "var(--color-text-deep)",
              fontWeight: 700,
            }}
          >
            Being crafted ✦
          </p>
          <p className="text-[14px]" style={{ color: "var(--color-text-body)" }}>
            Your calendar is in the studio. We&apos;ll notify you the moment
            it&apos;s ready for your eyes.
          </p>
        </div>
      ) : (
        <>
          <CalendarGrid
            rows={rows}
            calendarId={calendar.id}
            mode="client"
            editable={canRespond}
          />

          {canRespond && (
            <section
              className="mt-8 rounded-[24px] p-6 md:p-8 flex items-center justify-between flex-wrap gap-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(255,220,232,0.6))",
                border: "1px solid rgba(232,84,122,0.25)",
              }}
            >
              <div>
                <h3
                  className="font-bold mb-1"
                  style={{
                    fontFamily: "var(--font-script), cursive",
                    fontSize: 26,
                    color: "var(--color-text-deep)",
                  }}
                >
                  Happy with the plan?
                </h3>
                <p
                  className="text-[13px] italic"
                  style={{ color: "var(--color-text-body)" }}
                >
                  Approve to set it in motion, or tell us what to refine.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowChanges(true)}
                  disabled={busy}
                  className="text-[12px] tracking-[0.2em] uppercase font-bold py-3.5 px-6 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    color: "#c23b68",
                    border: "1px solid rgba(232,84,122,0.4)",
                  }}
                >
                  Request changes
                </button>
                <button
                  onClick={() => act("approve")}
                  disabled={busy}
                  className="cta-solid"
                  style={{ padding: "14px 30px", fontSize: 12 }}
                >
                  {busy ? "…" : "Approve calendar"} <span>✦</span>
                </button>
              </div>
            </section>
          )}
        </>
      )}

      {/* CHAT — talk to your team (admin + PM) */}
      {thread && (
        <section className="mt-12">
          <div className="mb-5">
            <p
              className="text-[10px] tracking-[0.45em] uppercase font-bold mb-1"
              style={{ color: "#e8547a" }}
            >
              ✦ Talk to us
            </p>
            <h2
              className="font-bold"
              style={{
                fontFamily: "var(--font-script), cursive",
                fontSize: 34,
                color: "var(--color-text-deep)",
              }}
            >
              Your team is one message away
            </h2>
          </div>
          <ChatPanel
            threadId={thread.id}
            currentUserId={profile.id}
            participants={participants}
          />
        </section>
      )}

      {/* REQUEST CHANGES MODAL */}
      {showChanges && (
        <div
          className="fixed inset-0 flex items-center justify-center px-5"
          style={{
            zIndex: 150,
            background: "rgba(61,26,77,0.5)",
            backdropFilter: "blur(12px)",
          }}
          onClick={() => !busy && setShowChanges(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[520px] rounded-[28px] p-8"
            style={{
              background:
                "linear-gradient(180deg, #fff5f4 0%, #fbe5ee 60%, #ead8f5 100%)",
              border: "1px solid rgba(232,84,122,0.3)",
              boxShadow: "0 40px 100px rgba(155,127,199,0.4)",
            }}
          >
            <p
              className="text-[10px] tracking-[0.4em] uppercase font-bold mb-2"
              style={{ color: "#c23b68" }}
            >
              ✦ Tell us more
            </p>
            <h3 className="section-script mb-4" style={{ fontSize: 30 }}>
              What should we refine?
            </h3>
            <textarea
              autoFocus
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Be as specific as you like — slots, captions, tone…"
              className="w-full px-4 py-3 rounded-xl text-[14px] mb-5"
              style={{
                background: "rgba(255,255,255,0.85)",
                border: "1.5px solid rgba(232,84,122,0.3)",
                color: "var(--color-text-deep)",
                resize: "vertical",
              }}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowChanges(false)}
                disabled={busy}
                className="text-[12px] tracking-[0.2em] uppercase font-bold py-3 px-5 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  color: "var(--color-text-deep)",
                  border: "1px solid rgba(232,84,122,0.25)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => act("request_changes")}
                disabled={busy || !notes.trim()}
                className="cta-solid"
                style={{ padding: "13px 26px", fontSize: 12 }}
              >
                {busy ? "Sending…" : "Send feedback"} <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
