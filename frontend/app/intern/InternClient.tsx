"use client";

import { useState } from "react";
import type { Profile, Task } from "@/lib/supabase/database.types";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PageHero from "@/components/dashboard/PageHero";
import StatTile from "@/components/dashboard/StatTile";
import TaskCard from "@/components/tasks/TaskCard";
import SubmitDrawer from "@/components/tasks/SubmitDrawer";
import { sortInternQueue } from "@/lib/tasks";

type TaskWithCampaign = Task & { campaigns?: { name: string } | null };

export default function InternClient({
  profile,
  tasks,
}: {
  profile: Profile;
  tasks: TaskWithCampaign[];
}) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sorted = sortInternQueue(tasks);

  const counts = {
    rejected: tasks.filter((t) => t.submission_status === "rejected").length,
    inProgress: tasks.filter((t) => t.status === "in_progress" && t.submission_status !== "rejected").length,
    awaiting: tasks.filter((t) => t.submission_status === "submitted").length,
    approved: tasks.filter((t) => t.submission_status === "approved").length,
  };

  const focus = sorted.find(
    (t) =>
      t.submission_status === "rejected" ||
      (t.status !== "done" && t.submission_status !== "approved")
  );

  return (
    <DashboardShell profile={profile}>
      <PageHero
        eyebrow="Intern · Workshop"
        title={`Hey, ${profile.full_name?.split(" ")[0] || "friend"}`}
        subtitle="Your craft list — sharp, prioritized, and one click from shipping."
      />

      {/* TODAY'S FOCUS */}
      {focus && (
        <section
          className="relative overflow-hidden rounded-[32px] p-7 md:p-10 mb-12"
          style={{
            background:
              focus.submission_status === "rejected"
                ? "linear-gradient(135deg, rgba(255,200,210,0.92) 0%, rgba(245,210,225,0.85) 100%)"
                : "linear-gradient(135deg, rgba(255,200,220,0.85) 0%, rgba(200,175,240,0.75) 100%)",
            border:
              focus.submission_status === "rejected"
                ? "1px solid rgba(232,84,122,0.5)"
                : "1px solid rgba(232,84,122,0.25)",
            boxShadow: "0 30px 80px rgba(232,84,122,0.22)",
          }}
        >
          <div
            aria-hidden
            className="absolute -top-24 -right-16 w-72 h-72 rounded-full blur-3xl"
            style={{ background: "rgba(232,84,122,0.45)" }}
          />
          <div
            aria-hidden
            className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full blur-3xl"
            style={{ background: "rgba(184,156,224,0.45)" }}
          />

          <div className="relative">
            <p
              className="text-[11px] tracking-[0.45em] uppercase font-bold mb-3 flex items-center gap-2"
              style={{
                color: focus.submission_status === "rejected" ? "#c23b68" : "#c23b68",
              }}
            >
              {focus.submission_status === "rejected"
                ? "⚠ Needs Rework"
                : "✦ Today's Focus"}
            </p>
            <h2
              className="font-black uppercase mb-3"
              style={{
                fontFamily: "var(--font-display), Impact, sans-serif",
                fontSize: "clamp(26px, 3.2vw, 44px)",
                lineHeight: 1.05,
                color: "var(--color-text-deep)",
              }}
            >
              {focus.title}
            </h2>
            {focus.brand_name && (
              <p
                className="text-[11px] tracking-[0.3em] uppercase font-bold mb-3"
                style={{ color: "#c23b68" }}
              >
                ✦ {focus.brand_name}
              </p>
            )}
            {focus.submission_status === "rejected" && focus.rejection_reason && (
              <p
                className="italic text-[15px] leading-snug mb-4 max-w-2xl"
                style={{
                  fontFamily: "var(--font-script), cursive",
                  color: "var(--color-text-deep)",
                  fontSize: 18,
                }}
              >
                "{focus.rejection_reason}"
              </p>
            )}
            {focus.description && focus.submission_status !== "rejected" && (
              <p
                className="text-[14px] leading-relaxed max-w-2xl mb-4"
                style={{ color: "var(--color-text-body)" }}
              >
                {focus.description}
              </p>
            )}
            <button
              onClick={() => setActiveTask(focus)}
              className="cta-solid"
              style={{ padding: "14px 28px", fontSize: 12 }}
            >
              {focus.submission_status === "rejected"
                ? "Open & Resubmit"
                : focus.status === "todo"
                ? "Start working"
                : "Open & Submit"}
              <span>→</span>
            </button>
          </div>
        </section>
      )}

      {/* STAT STRIP */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <StatTile label="Rejected" value={counts.rejected} accent="#e8547a" icon="⚠" index={0} />
        <StatTile label="In Progress" value={counts.inProgress} accent="#f5c842" icon="◆" index={1} />
        <StatTile label="Awaiting Client" value={counts.awaiting} accent="#b89ce0" icon="✿" index={2} />
        <StatTile label="Approved" value={counts.approved} accent="#4caf6c" icon="✦" index={3} />
      </section>

      {/* QUEUE */}
      <section className="mt-14">
        <div className="mb-5">
          <p
            className="text-[10px] tracking-[0.4em] uppercase font-bold mb-1"
            style={{ color: "#e8547a" }}
          >
            ✦ Queue
          </p>
          <h2
            className="font-bold"
            style={{
              fontFamily: "var(--font-script), cursive",
              fontSize: 36,
              color: "var(--color-text-deep)",
            }}
          >
            All my tasks
          </h2>
        </div>

        <div className="space-y-3">
          {sorted.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              role="intern"
              userId={profile.id}
              onAction={(verb) => {
                if (verb === "start" || verb === "submit" || verb === "resubmit") {
                  setActiveTask(t);
                }
              }}
            />
          ))}
          {sorted.length === 0 && (
            <div className="glass p-14 text-center">
              <p
                className="text-3xl mb-2"
                style={{
                  fontFamily: "var(--font-script), cursive",
                  color: "var(--color-text-deep)",
                  fontWeight: 700,
                }}
              >
                Inbox zero ✦
              </p>
              <p className="text-[14px]" style={{ color: "var(--color-text-body)" }}>
                Nothing assigned. Take a breath.
              </p>
            </div>
          )}
        </div>
      </section>

      <SubmitDrawer task={activeTask} onClose={() => setActiveTask(null)} />
    </DashboardShell>
  );
}
