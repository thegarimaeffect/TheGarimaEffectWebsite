"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import type { Task } from "@/lib/supabase/database.types";

interface Props {
  task: Task | null;
  onClose: () => void;
}

/**
 * Client-facing modal to approve or reject submitted work.
 * Approve = one tap. Reject = required reason field.
 */
export default function ReviewModal({ task, onClose }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "reject">("choose");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setMode("choose");
      setReason("");
      setError(null);
    }
  }, [task]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    if (task) {
      window.addEventListener("keydown", h);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", h);
        document.body.style.overflow = prev;
      };
    }
  }, [task, loading, onClose]);

  async function approve() {
    if (!task) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("tasks")
      .update({ submission_status: "approved" })
      .eq("id", task.id);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    onClose();
    router.refresh();
  }

  async function reject() {
    if (!task) return;
    if (reason.trim().length < 4) {
      setError("Please give the team a short reason (4+ characters).");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("tasks")
      .update({
        submission_status: "rejected",
        rejection_reason: reason.trim(),
      })
      .eq("id", task.id);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    onClose();
    router.refresh();
  }

  return (
    <AnimatePresence>
      {task && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center px-4 py-10"
          style={{
            zIndex: 100,
            background: "rgba(61,26,77,0.55)",
            backdropFilter: "blur(14px)",
          }}
          onClick={() => !loading && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", damping: 22, stiffness: 240 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg relative"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,220,232,0.85) 100%)",
              border: "1px solid rgba(232,84,122,0.3)",
              borderRadius: 28,
              boxShadow: "0 40px 100px rgba(232,84,122,0.4)",
            }}
          >
            <div
              aria-hidden
              className="absolute -top-20 -right-12 w-60 h-60 rounded-full blur-3xl opacity-50"
              style={{ background: "rgba(232,84,122,0.35)" }}
            />
            <div
              aria-hidden
              className="absolute -bottom-20 -left-12 w-60 h-60 rounded-full blur-3xl opacity-40"
              style={{ background: "rgba(184,156,224,0.4)" }}
            />

            <div className="relative p-7 md:p-9">
              <p
                className="text-[10px] tracking-[0.5em] uppercase font-bold mb-3"
                style={{ color: "#e8547a" }}
              >
                ✦ Your call
              </p>
              <h3
                className="font-black uppercase mb-2"
                style={{
                  fontFamily: "var(--font-display), Impact, sans-serif",
                  fontSize: 30,
                  lineHeight: 1.05,
                  color: "var(--color-text-deep)",
                }}
              >
                {task.title}
              </h3>
              {task.brand_name && (
                <p
                  className="text-[10px] tracking-[0.32em] uppercase font-bold mb-3"
                  style={{ color: "var(--color-accent-rose)" }}
                >
                  {task.brand_name}
                </p>
              )}
              {task.description && (
                <p
                  className="text-[14px] leading-relaxed mb-4"
                  style={{ color: "var(--color-text-body)" }}
                >
                  {task.description}
                </p>
              )}

              {task.drive_link && (
                <a
                  href={task.drive_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase font-bold py-2 px-4 rounded-lg mb-5 transition hover:scale-[1.02]"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(232,84,122,0.15), rgba(184,156,224,0.15))",
                    color: "#c23b68",
                    border: "1px solid rgba(232,84,122,0.4)",
                  }}
                >
                  <DriveIcon />
                  Open on Drive
                </a>
              )}

              {mode === "choose" && (
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    onClick={() => setMode("reject")}
                    disabled={loading}
                    className="text-[12px] tracking-[0.22em] uppercase font-bold py-4 rounded-xl transition hover:scale-[1.02]"
                    style={{
                      background: "rgba(255,255,255,0.85)",
                      color: "#c23b68",
                      border: "1.5px solid rgba(232,84,122,0.45)",
                    }}
                  >
                    Request changes
                  </button>
                  <button
                    onClick={approve}
                    disabled={loading}
                    className="cta-solid justify-center"
                    style={{ padding: "16px 20px", fontSize: 12 }}
                  >
                    {loading ? "…" : "Approve ✦"}
                  </button>
                </div>
              )}

              {mode === "reject" && (
                <div className="mt-6">
                  <label className="block">
                    <span
                      className="block text-[11px] tracking-[0.22em] uppercase font-bold mb-2"
                      style={{ color: "var(--color-text-deep)" }}
                    >
                      What needs to change?
                      <span style={{ color: "#e8547a" }}> *</span>
                    </span>
                    <textarea
                      rows={4}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="The voice-over feels rushed around 12-22s. Can we slow that section by 2 seconds?"
                      autoFocus
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: "1.5px solid rgba(61, 26, 77, 0.16)",
                        background: "rgba(255, 255, 255, 0.85)",
                        fontSize: 14,
                        color: "var(--color-text-deep)",
                        fontFamily: "inherit",
                        resize: "vertical",
                      }}
                    />
                  </label>
                  <p
                    className="text-[11px] mt-2 italic"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    The team will be notified instantly with your note.
                  </p>

                  {error && (
                    <p
                      className="text-[12px] mt-3 px-3 py-2 rounded-xl flex items-start gap-2"
                      style={{
                        background: "rgba(232,84,122,0.1)",
                        color: "#c23b68",
                        border: "1px solid rgba(232,84,122,0.3)",
                      }}
                    >
                      <span>⚠</span> {error}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <button
                      onClick={() => setMode("choose")}
                      disabled={loading}
                      className="text-[12px] tracking-[0.22em] uppercase font-bold py-4 rounded-xl"
                      style={{
                        background: "rgba(255,255,255,0.85)",
                        color: "var(--color-text-deep)",
                        border: "1.5px solid rgba(61,26,77,0.2)",
                      }}
                    >
                      Back
                    </button>
                    <button
                      onClick={reject}
                      disabled={loading || reason.trim().length < 4}
                      className="text-[12px] tracking-[0.22em] uppercase font-bold py-4 rounded-xl text-white transition"
                      style={{
                        background:
                          "linear-gradient(135deg, #c23b68 0%, #9b7fc7 100%)",
                        boxShadow: "0 12px 30px rgba(194,59,104,0.4)",
                        opacity: loading || reason.trim().length < 4 ? 0.5 : 1,
                      }}
                    >
                      {loading ? "Sending…" : "Send changes"}
                    </button>
                  </div>
                </div>
              )}

              {error && mode === "choose" && (
                <p
                  className="text-[12px] mt-3 px-3 py-2 rounded-xl"
                  style={{
                    background: "rgba(232,84,122,0.1)",
                    color: "#c23b68",
                    border: "1px solid rgba(232,84,122,0.3)",
                  }}
                >
                  {error}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
