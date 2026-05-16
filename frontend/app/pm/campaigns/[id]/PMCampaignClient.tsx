"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  Calendar,
  CalendarRow,
  Campaign,
  Profile,
  Task,
  Thread,
} from "@/lib/supabase/database.types";
import DashboardShell from "@/components/dashboard/DashboardShell";
import StatTile from "@/components/dashboard/StatTile";
import StatBadge from "@/components/dashboard/StatBadge";
import TaskCard from "@/components/tasks/TaskCard";
import TaskCreateDrawer from "@/components/tasks/TaskCreateDrawer";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import ChatPanel from "@/components/chat/ChatPanel";

interface InternOpt {
  id: string;
  full_name: string | null;
  email: string;
  is_content_writer: boolean;
}

interface Props {
  profile: Profile;
  campaign: Campaign;
  client: { full_name: string | null; email: string; company_name: string | null } | null;
  calendar: Calendar | null;
  rows: CalendarRow[];
  tasks: Task[];
  interns: InternOpt[];
  thread: Thread | null;
  participants: Record<string, { name: string; role: string }>;
}

export default function PMCampaignClient({
  profile,
  campaign,
  client,
  calendar,
  rows,
  tasks,
  interns,
  thread,
  participants,
}: Props) {
  const router = useRouter();
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goals = Array.isArray(campaign.goals) ? (campaign.goals as string[]) : [];
  const state = calendar?.state ?? "building";
  const gridEditable = state === "building" || state === "changes_requested";
  const canAssignTasks = state === "approved";

  const submitted = tasks.filter((t) => t.submission_status === "submitted").length;
  const rejected = tasks.filter((t) => t.submission_status === "rejected").length;
  const tasksApproved = tasks.filter((t) => t.submission_status === "approved").length;

  async function sendToClient() {
    if (!calendar) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/calendar/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calendar_id: calendar.id, action: "send" }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "could not send");
      }
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleWriter(internId: string, next: boolean) {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/calendar/content-writer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: campaign.id,
          user_id: internId,
          is_content_writer: next,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "could not update");
      }
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardShell profile={profile}>
      <Link
        href="/pm"
        className="text-[11px] tracking-[0.3em] uppercase font-bold mb-6 inline-flex items-center gap-2 hover:opacity-70 transition"
        style={{ color: "var(--color-text-muted)" }}
      >
        ← All campaigns
      </Link>

      {/* HERO */}
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
          <div className="md:col-span-3">
            <p
              className="text-[11px] tracking-[0.4em] uppercase font-bold mb-3"
              style={{ color: "#e8547a" }}
            >
              ✦ Campaign · {client?.company_name || client?.full_name || "Client"}
            </p>
            <h1
              className="font-black uppercase mb-4"
              style={{
                fontFamily: "var(--font-display), Impact, sans-serif",
                fontSize: "clamp(34px, 5vw, 72px)",
                lineHeight: 0.95,
                color: "var(--color-text-deep)",
              }}
            >
              {campaign.name}
            </h1>
            {campaign.brief && (
              <p
                className="text-[15px] leading-relaxed max-w-2xl mb-6"
                style={{ color: "var(--color-text-body)" }}
              >
                {campaign.brief}
              </p>
            )}
            {goals.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {goals.map((g, i) => (
                  <span key={i} className="pill pink">
                    ✦ {g}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <StatBadge status={campaign.status} />
              <span
                className="text-[10px] tracking-[0.3em] uppercase font-bold"
                style={{ color: "var(--color-text-muted)" }}
              >
                Calendar:
              </span>
              <StatBadge status={state} />
            </div>
          </div>
          <div className="md:col-span-2 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <SummaryRow label="Client" value={client?.full_name || client?.email || "—"} />
              <SummaryRow label="Company" value={client?.company_name || "—"} />
              <SummaryRow
                label="Created"
                value={new Date(campaign.created_at).toLocaleDateString()}
              />
            </div>
            <button
              onClick={() => setCreatorOpen(true)}
              disabled={!canAssignTasks}
              title={
                canAssignTasks
                  ? undefined
                  : "Client must approve the calendar before tasks can be assigned"
              }
              className="cta-solid w-full justify-center"
              style={{
                padding: "14px 22px",
                fontSize: 12,
                opacity: canAssignTasks ? 1 : 0.45,
                cursor: canAssignTasks ? "pointer" : "not-allowed",
              }}
            >
              + New Task <span>✦</span>
            </button>
          </div>
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

      {/* LIFECYCLE BANNER */}
      <section
        className="rounded-[24px] p-6 md:p-8 mb-10 relative overflow-hidden"
        style={{
          background:
            state === "approved"
              ? "linear-gradient(135deg, rgba(76,175,108,0.14), rgba(184,156,224,0.12))"
              : state === "sent_to_client"
              ? "linear-gradient(135deg, rgba(245,200,66,0.16), rgba(255,220,232,0.5))"
              : state === "changes_requested"
              ? "linear-gradient(135deg, rgba(232,84,122,0.16), rgba(255,220,232,0.5))"
              : "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(234,216,245,0.5))",
          border: "1px solid rgba(232,84,122,0.22)",
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p
              className="text-[10px] tracking-[0.4em] uppercase font-bold mb-1"
              style={{ color: "#e8547a" }}
            >
              ✦ Calendar Status
            </p>
            <h3
              className="font-bold"
              style={{
                fontFamily: "var(--font-script), cursive",
                fontSize: 28,
                color: "var(--color-text-deep)",
              }}
            >
              {state === "building" && "Build the calendar"}
              {state === "sent_to_client" && "Waiting on the client"}
              {state === "changes_requested" && "Client requested changes"}
              {state === "approved" && "Approved — assign the work"}
            </h3>
            {state === "changes_requested" && calendar?.notes && (
              <p
                className="text-[14px] italic mt-2 max-w-xl"
                style={{ color: "var(--color-text-body)" }}
              >
                “{calendar.notes}”
              </p>
            )}
          </div>
          {(state === "building" || state === "changes_requested") && (
            <button
              onClick={sendToClient}
              disabled={busy || rows.length === 0}
              className="cta-solid"
              style={{ padding: "14px 28px", fontSize: 12 }}
            >
              {busy ? "Sending…" : "Send to client"} <span>→</span>
            </button>
          )}
          {state === "sent_to_client" && (
            <span
              className="text-[12px] tracking-[0.2em] uppercase font-bold"
              style={{ color: "#a07700" }}
            >
              Sent · awaiting review
            </span>
          )}
        </div>
      </section>

      {/* CONTENT-WRITER PANEL */}
      {interns.length > 0 && (
        <section className="mb-10">
          <p
            className="text-[10px] tracking-[0.4em] uppercase font-bold mb-3"
            style={{ color: "#e8547a" }}
          >
            ✦ Content Writer
          </p>
          <div className="glass p-5 flex flex-wrap gap-3">
            {interns.map((i) => (
              <button
                key={i.id}
                onClick={() => toggleWriter(i.id, !i.is_content_writer)}
                disabled={busy}
                className="px-4 py-2.5 rounded-xl text-[13px] font-semibold transition flex items-center gap-2"
                style={{
                  background: i.is_content_writer
                    ? "linear-gradient(135deg, #e8547a, #b89ce0)"
                    : "rgba(255,255,255,0.6)",
                  color: i.is_content_writer ? "white" : "var(--color-text-deep)",
                  border: i.is_content_writer
                    ? "1px solid rgba(255,255,255,0.4)"
                    : "1px solid rgba(232,84,122,0.25)",
                }}
              >
                {i.is_content_writer ? "✓ " : ""}
                {i.full_name || i.email}
              </button>
            ))}
          </div>
          <p
            className="text-[11px] italic mt-2"
            style={{ color: "var(--color-text-muted)" }}
          >
            The content writer can edit the calendar grid alongside you.
          </p>
        </section>
      )}

      {/* CALENDAR GRID */}
      <section className="mb-14">
        <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
          <div>
            <p
              className="text-[10px] tracking-[0.4em] uppercase font-bold mb-1"
              style={{ color: "#e8547a" }}
            >
              ✦ The Calendar
            </p>
            <h2
              className="font-bold"
              style={{
                fontFamily: "var(--font-script), cursive",
                fontSize: 36,
                color: "var(--color-text-deep)",
              }}
            >
              Content grid · {rows.length} {rows.length === 1 ? "row" : "rows"}
            </h2>
          </div>
          {!gridEditable && (
            <span
              className="text-[11px] tracking-[0.2em] uppercase font-bold"
              style={{ color: "var(--color-text-muted)" }}
            >
              🔒 Locked while {state.replace("_", " ")}
            </span>
          )}
        </div>

        {calendar ? (
          <CalendarGrid
            rows={rows}
            calendarId={calendar.id}
            mode="pm"
            editable={gridEditable}
          />
        ) : (
          <div className="glass p-12 text-center">
            <p className="text-[14px]" style={{ color: "var(--color-text-body)" }}>
              Calendar is being initialized…
            </p>
          </div>
        )}
      </section>

      {/* TASK STRIP + LIST */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-10">
        <StatTile label="Rows" value={rows.length} accent="#e8547a" icon="◆" index={0} />
        <StatTile label="Submitted" value={submitted} accent="#f5c842" icon="◆" index={1} />
        <StatTile label="Approved" value={tasksApproved} accent="#4caf6c" icon="✦" index={2} />
        <StatTile label="Rejected" value={rejected} accent="#c23b68" icon="⚠" index={3} />
      </section>

      <section>
        <div className="mb-5">
          <p
            className="text-[10px] tracking-[0.4em] uppercase font-bold mb-1"
            style={{ color: "#e8547a" }}
          >
            ✦ Production
          </p>
          <h2
            className="font-bold"
            style={{
              fontFamily: "var(--font-script), cursive",
              fontSize: 32,
              color: "var(--color-text-deep)",
            }}
          >
            Tasks · {tasks.length}
          </h2>
        </div>

        {!canAssignTasks && (
          <div
            className="glass p-8 text-center mb-6"
            style={{ border: "1px dashed rgba(232,84,122,0.35)" }}
          >
            <p className="text-[14px]" style={{ color: "var(--color-text-body)" }}>
              Task assignment unlocks once the client approves the calendar.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              role="product_manager"
              userId={profile.id}
            />
          ))}
          {tasks.length === 0 && canAssignTasks && (
            <div className="glass p-14 text-center">
              <p
                className="text-3xl mb-2"
                style={{
                  fontFamily: "var(--font-script), cursive",
                  color: "var(--color-text-deep)",
                  fontWeight: 700,
                }}
              >
                No tasks yet ✦
              </p>
              <button
                onClick={() => setCreatorOpen(true)}
                className="cta-solid mx-auto mt-4"
                style={{ padding: "14px 28px", fontSize: 12 }}
              >
                + New Task
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CHAT — admin · PM · client */}
      {thread && (
        <section className="mt-14">
          <div className="mb-5">
            <p
              className="text-[10px] tracking-[0.4em] uppercase font-bold mb-1"
              style={{ color: "#e8547a" }}
            >
              ✦ Conversation
            </p>
            <h2
              className="font-bold"
              style={{
                fontFamily: "var(--font-script), cursive",
                fontSize: 32,
                color: "var(--color-text-deep)",
              }}
            >
              Talk with the client
            </h2>
          </div>
          <ChatPanel
            threadId={thread.id}
            currentUserId={profile.id}
            participants={participants}
          />
        </section>
      )}

      <TaskCreateDrawer
        open={creatorOpen}
        onClose={() => setCreatorOpen(false)}
        campaignId={campaign.id}
        brandName={client?.company_name}
        interns={interns.map(({ id, full_name, email }) => ({
          id,
          full_name,
          email,
        }))}
        calendarRows={rows.map((r) => ({
          id: r.id,
          label: `${r.post_date ?? "Unscheduled"} · ${
            r.post_type || "Post"
          }${r.ideation ? ` — ${r.ideation.slice(0, 30)}` : ""}`,
        }))}
      />
    </DashboardShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-center justify-between gap-3 pb-3 border-b"
      style={{ borderColor: "rgba(232,84,122,0.18)" }}
    >
      <span
        className="text-[10px] tracking-[0.3em] uppercase font-bold"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </span>
      <span
        className="text-[13px] font-semibold text-right"
        style={{ color: "var(--color-text-deep)" }}
      >
        {value}
      </span>
    </div>
  );
}
