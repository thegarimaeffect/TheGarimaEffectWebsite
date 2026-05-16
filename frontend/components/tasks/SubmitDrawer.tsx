"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import type { Task } from "@/lib/supabase/database.types";
import { isValidDriveLink, transitionPayload } from "@/lib/tasks";

interface Props {
  task: Task | null;
  onClose: () => void;
}

/**
 * Intern-facing drawer to add Drive link and submit (or resubmit after rejection).
 */
export default function SubmitDrawer({ task, onClose }: Props) {
  const router = useRouter();
  const [driveLink, setDriveLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setDriveLink(task.drive_link || "");
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

  async function startWorking() {
    if (!task) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("tasks")
      .update(transitionPayload("start"))
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

  async function submit() {
    if (!task) return;
    if (!isValidDriveLink(driveLink)) {
      setError("Add a valid Drive (or any http/https) link before submitting.");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const verb = task.submission_status === "rejected" ? "resubmit" : "submit";
    const { error } = await supabase
      .from("tasks")
      .update(transitionPayload(verb, { drive_link: driveLink.trim() }))
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

  const isStart = task?.status === "todo";
  const isResubmit = task?.submission_status === "rejected";

  return (
    <AnimatePresence>
      {task && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !loading && onClose()}
            className="fixed inset-0"
            style={{
              zIndex: 100,
              background: "rgba(61,26,77,0.5)",
              backdropFilter: "blur(12px)",
            }}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 240, damping: 32 }}
            className="fixed top-0 right-0 h-full flex flex-col"
            style={{
              zIndex: 101,
              width: "min(480px, 100vw)",
              background:
                "linear-gradient(180deg, #fff5f4 0%, #fbe5ee 50%, #ead8f5 100%)",
              borderLeft: "1px solid rgba(232,84,122,0.25)",
              boxShadow: "-30px 0 80px rgba(155,127,199,0.25)",
            }}
          >
            <header
              className="flex items-start justify-between px-6 py-5"
              style={{ borderBottom: "1px solid rgba(232,84,122,0.18)" }}
            >
              <div>
                <p
                  className="text-[10px] tracking-[0.4em] uppercase font-bold mb-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  ✦ {isStart ? "Start Task" : isResubmit ? "Resubmit" : "Submit Work"}
                </p>
                <h3 className="section-script" style={{ fontSize: 28 }}>
                  {isStart ? "Begin crafting" : isResubmit ? "Round two" : "Ship it"}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full border flex items-center justify-center transition hover:bg-[#e8547a]/10"
                style={{ borderColor: "rgba(232,84,122,0.4)", color: "var(--color-text-deep)" }}
              >
                ✕
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              <div>
                <h4
                  className="font-bold text-[16px] mb-1"
                  style={{ color: "var(--color-text-deep)" }}
                >
                  {task.title}
                </h4>
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
                    className="text-[13px] leading-relaxed"
                    style={{ color: "var(--color-text-body)" }}
                  >
                    {task.description}
                  </p>
                )}
              </div>

              {/* Rejection context */}
              {isResubmit && task.rejection_reason && (
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: "rgba(232,84,122,0.08)",
                    border: "1px solid rgba(232,84,122,0.3)",
                  }}
                >
                  <p
                    className="text-[10px] tracking-[0.3em] uppercase font-bold mb-2 flex items-center gap-2"
                    style={{ color: "#c23b68" }}
                  >
                    ⚠ Client's note
                  </p>
                  <p
                    className="text-[13px] italic leading-relaxed"
                    style={{ color: "var(--color-text-deep)" }}
                  >
                    "{task.rejection_reason}"
                  </p>
                </div>
              )}

              {!isStart && (
                <label className="block">
                  <span
                    className="block text-[11px] tracking-[0.22em] uppercase font-bold mb-2"
                    style={{ color: "var(--color-text-deep)" }}
                  >
                    Drive link <span style={{ color: "#e8547a" }}>*</span>
                  </span>
                  <input
                    type="url"
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                    placeholder="https://drive.google.com/file/d/…"
                    autoFocus
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1.5px solid rgba(61, 26, 77, 0.16)",
                      background: "rgba(255, 255, 255, 0.85)",
                      fontSize: 14,
                      color: "var(--color-text-deep)",
                    }}
                  />
                  <p
                    className="text-[11px] mt-2 italic"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Make sure Drive sharing is set to "Anyone with the link · viewer".
                  </p>
                </label>
              )}

              {error && (
                <p
                  className="text-[12px] px-3 py-2 rounded-xl flex items-start gap-2"
                  style={{
                    background: "rgba(232,84,122,0.1)",
                    color: "#c23b68",
                    border: "1px solid rgba(232,84,122,0.3)",
                  }}
                >
                  <span>⚠</span> {error}
                </p>
              )}
            </div>

            <footer
              className="px-6 py-4 flex items-center justify-between gap-3"
              style={{ borderTop: "1px solid rgba(232,84,122,0.18)" }}
            >
              <button
                onClick={onClose}
                disabled={loading}
                className="text-[12px] tracking-[0.22em] uppercase font-bold py-3 px-5 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.55)",
                  color: "var(--color-text-deep)",
                  border: "1px solid rgba(232,84,122,0.25)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={isStart ? startWorking : submit}
                disabled={loading}
                className="cta-solid"
                style={{ padding: "14px 26px", fontSize: 12 }}
              >
                {loading
                  ? "…"
                  : isStart
                  ? "Start working"
                  : isResubmit
                  ? "Resubmit"
                  : "Submit for review"}
                {!loading && <span>{isStart ? "→" : "✦"}</span>}
              </button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
