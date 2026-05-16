"use client";

import { motion } from "framer-motion";
import type {
  Task,
  UserRole,
} from "@/lib/supabase/database.types";
import StatBadge from "@/components/dashboard/StatBadge";
import {
  SUBMISSION_LABEL,
  SUBMISSION_TONE,
  priorityLabel,
  isOverdue,
  isDueSoon,
  nextActionFor,
} from "@/lib/tasks";

/**
 * Premium task card used in PM detail, intern queue, and client review.
 * Renders the same content for everyone but exposes role-specific actions.
 */
export default function TaskCard({
  task,
  role,
  userId,
  onAction,
}: {
  task: Task & { campaigns?: { name: string } | null };
  role: UserRole;
  userId: string | null;
  onAction?: (verb: "start" | "submit" | "resubmit" | "review") => void;
}) {
  const overdue = isOverdue(task.due_date, task.status);
  const submission = task.submission_status;
  const submissionTone = SUBMISSION_TONE[submission];
  const dueSoon = isDueSoon(task.due_date, submission);
  const prio = priorityLabel(task.priority);
  const prioAccent =
    overdue || dueSoon
      ? "#e8547a"
      : task.priority === 1
      ? "#e8547a"
      : task.priority === 3
      ? "#9d7e9d"
      : "#f5c842";
  const next = onAction ? nextActionFor(task, role, userId) : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass p-5 md:p-6 relative overflow-hidden"
    >
      {/* Left priority strip */}
      <div
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: prioAccent }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        {/* LEFT — title + meta */}
        <div className="lg:col-span-7 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className="text-[10px] tracking-[0.28em] uppercase font-bold py-1 px-3 rounded-full"
              style={{
                background: `${prioAccent}1f`,
                color: prioAccent,
                border: `1px solid ${prioAccent}55`,
              }}
            >
              {prio}
            </span>
            <StatBadge status={task.status} />
            <span
              className="text-[10px] tracking-[0.28em] uppercase font-bold py-1 px-3 rounded-full"
              style={{
                background: submissionTone.bg,
                color: submissionTone.fg,
                border: `1px solid ${submissionTone.border}`,
              }}
            >
              {SUBMISSION_LABEL[submission]}
            </span>
            {(dueSoon || overdue) && (
              <motion.span
                animate={{ opacity: [1, 0.55, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="text-[10px] tracking-[0.28em] uppercase font-bold py-1 px-3 rounded-full"
                style={{
                  background: "rgba(232,84,122,0.16)",
                  color: "#c23b68",
                  border: "1px solid rgba(232,84,122,0.55)",
                }}
              >
                {overdue ? "⚠ Overdue" : "⏰ Due Soon"}
              </motion.span>
            )}
          </div>

          <h3
            className="font-bold text-[15px] md:text-[16px] leading-tight"
            style={{ color: "var(--color-text-deep)" }}
          >
            {task.title}
          </h3>

          {task.brand_name && (
            <p
              className="text-[10px] tracking-[0.3em] uppercase font-bold mt-1"
              style={{ color: "var(--color-accent-rose)" }}
            >
              ✦ {task.brand_name}
              {task.campaigns?.name && (
                <span className="opacity-60"> · {task.campaigns.name}</span>
              )}
            </p>
          )}

          {task.description && (
            <p
              className="text-[13px] mt-2 leading-relaxed line-clamp-2"
              style={{ color: "var(--color-text-body)" }}
            >
              {task.description}
            </p>
          )}

          {/* Rejection reason */}
          {submission === "rejected" && task.rejection_reason && (
            <div
              className="mt-3 p-3 rounded-xl"
              style={{
                background: "rgba(232,84,122,0.08)",
                border: "1px solid rgba(232,84,122,0.3)",
              }}
            >
              <p
                className="text-[10px] tracking-[0.3em] uppercase font-bold mb-1 flex items-center gap-2"
                style={{ color: "#c23b68" }}
              >
                ⚠ Client requested changes
              </p>
              <p
                className="text-[13px] italic leading-relaxed"
                style={{ color: "var(--color-text-deep)" }}
              >
                "{task.rejection_reason}"
              </p>
            </div>
          )}
        </div>

        {/* MIDDLE — Drive link + dates */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          {task.drive_link ? (
            <a
              href={task.drive_link}
              target="_blank"
              rel="noreferrer"
              className="text-[12px] font-bold tracking-[0.18em] uppercase py-2 px-3 rounded-lg flex items-center gap-2 transition hover:scale-[1.02]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(232,84,122,0.12), rgba(184,156,224,0.12))",
                border: "1px solid rgba(232,84,122,0.3)",
                color: "#c23b68",
              }}
            >
              <DriveIcon />
              View on Drive
            </a>
          ) : (
            <div
              className="text-[11px] tracking-[0.2em] uppercase font-bold py-2 px-3 rounded-lg text-center italic"
              style={{
                color: "var(--color-text-muted)",
                background: "rgba(255,255,255,0.4)",
                border: "1px dashed rgba(155,127,199,0.4)",
              }}
            >
              No Drive link yet
            </div>
          )}

          {task.due_date && (
            <p
              className="text-[11px] tracking-[0.18em] uppercase font-bold"
              style={{ color: overdue ? "#c23b68" : "var(--color-text-muted)" }}
            >
              {overdue ? "Overdue · " : "Due · "}
              {new Date(task.due_date).toLocaleDateString()}
            </p>
          )}
          {task.submitted_at && (
            <p
              className="text-[10px] tracking-[0.18em] uppercase"
              style={{ color: "var(--color-text-muted)" }}
            >
              Submitted {new Date(task.submitted_at).toLocaleDateString()}
            </p>
          )}
          {task.reviewed_at && submission === "approved" && (
            <p
              className="text-[10px] tracking-[0.18em] uppercase font-bold"
              style={{ color: "#1f7a3c" }}
            >
              ✦ Approved {new Date(task.reviewed_at).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* RIGHT — primary action */}
        <div className="lg:col-span-2 flex items-center justify-end">
          {next && onAction && next.verb !== "wait" && (
            <button
              onClick={() =>
                onAction(
                  next.verb === "review"
                    ? "review"
                    : (next.verb as "start" | "submit" | "resubmit")
                )
              }
              className="w-full text-[11px] tracking-[0.22em] uppercase font-bold py-3 px-4 rounded-xl text-white transition hover:scale-[1.03]"
              style={{
                background: "linear-gradient(135deg, #e8547a 0%, #b89ce0 100%)",
                boxShadow: "0 8px 24px rgba(232,84,122,0.32)",
              }}
            >
              {next.label}
            </button>
          )}
          {next && next.verb === "wait" && (
            <span
              className="w-full text-center text-[11px] tracking-[0.22em] uppercase font-bold py-3 px-4 rounded-xl italic"
              style={{
                background: "rgba(255,255,255,0.5)",
                color: "var(--color-text-muted)",
                border: "1px solid rgba(232,84,122,0.18)",
              }}
            >
              {next.label}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function DriveIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 3h6l6 11-3 6H6l-3-6 6-11z" strokeLinejoin="round" />
      <path d="M15 14H9l3-6 3 6z" strokeLinejoin="round" />
    </svg>
  );
}
