"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { isValidDriveLink } from "@/lib/tasks";

interface InternOption {
  id: string;
  full_name: string | null;
  email: string;
}

interface CalendarRowOption {
  id: string;
  label: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  brandName?: string | null;
  interns: InternOption[];
  calendarRows?: CalendarRowOption[];
}

/**
 * Slide-in drawer for PM/Admin to create a task.
 * Fields: title, description, brand_name (auto-filled), deadline,
 *         assignee (intern), calendar_day (optional), drive_link (optional)
 */
export default function TaskCreateDrawer({
  open,
  onClose,
  campaignId,
  brandName,
  interns,
  calendarRows = [],
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState(brandName ?? "");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState<string>(interns[0]?.id ?? "");
  const [calendarRowId, setCalendarRowId] = useState<string>("");
  const [driveLink, setDriveLink] = useState("");
  const [priority, setPriority] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setBrand(brandName ?? "");
    }
  }, [open, brandName]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      window.addEventListener("keydown", handler);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", handler);
        document.body.style.overflow = prev;
      };
    }
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (driveLink && !isValidDriveLink(driveLink)) {
      setError("Drive link must be a valid http(s) URL.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("tasks").insert({
      campaign_id: campaignId,
      title: title.trim(),
      description: description.trim() || null,
      brand_name: brand.trim() || null,
      due_date: dueDate || null,
      assigned_to: assignedTo || null,
      calendar_row_id: calendarRowId || null,
      drive_link: driveLink.trim() || null,
      priority,
      status: "todo",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setTitle("");
    setDescription("");
    setDueDate("");
    setDriveLink("");
    setCalendarRowId("");
    setLoading(false);
    onClose();
    router.refresh();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0"
            style={{
              zIndex: 100,
              background: "rgba(61,26,77,0.5)",
              backdropFilter: "blur(12px)",
            }}
          />
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 240, damping: 32 }}
            className="fixed top-0 right-0 h-full flex flex-col"
            style={{
              zIndex: 101,
              width: "min(520px, 100vw)",
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
                  ✦ New Task
                </p>
                <h3
                  className="section-script"
                  style={{ fontSize: 30 }}
                >
                  Assign work
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

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-5"
            >
              <Field label="Task title" required>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Edit reel for Day 5"
                  className="drawer-input"
                />
              </Field>

              <Field label="Description">
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Color grade, caption, hashtags. Aim for 15–25s."
                  className="drawer-input"
                  style={{ resize: "vertical" }}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Brand name">
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Lumen Skincare"
                    className="drawer-input"
                  />
                </Field>
                <Field label="Deadline">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="drawer-input"
                  />
                </Field>
              </div>

              <Field label="Assign to" required>
                <select
                  required
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="drawer-input"
                >
                  {interns.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.full_name || i.email}
                    </option>
                  ))}
                  {interns.length === 0 && (
                    <option value="">— no interns on this campaign —</option>
                  )}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Calendar row">
                  <select
                    value={calendarRowId}
                    onChange={(e) => setCalendarRowId(e.target.value)}
                    className="drawer-input"
                  >
                    <option value="">— unlinked —</option>
                    {calendarRows.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Priority">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="drawer-input"
                  >
                    <option value={1}>High</option>
                    <option value={2}>Normal</option>
                    <option value={3}>Low</option>
                  </select>
                </Field>
              </div>

              <Field label="Drive link (optional)">
                <input
                  type="url"
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  placeholder="https://drive.google.com/…"
                  className="drawer-input"
                />
                <p
                  className="text-[11px] mt-1 italic"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  The intern can add this later when they submit their work.
                </p>
              </Field>

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
            </form>

            <footer
              className="px-6 py-4 flex items-center justify-between gap-3"
              style={{ borderTop: "1px solid rgba(232,84,122,0.18)" }}
            >
              <button
                type="button"
                onClick={onClose}
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
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="cta-solid"
                style={{ padding: "14px 26px", fontSize: 12 }}
              >
                {loading ? "Creating…" : "Create task"}
                {!loading && <span>✦</span>}
              </button>
            </footer>

            <style jsx>{`
              :global(.drawer-input) {
                width: 100%;
                padding: 12px 14px;
                border-radius: 12px;
                border: 1.5px solid rgba(61, 26, 77, 0.16);
                background: rgba(255, 255, 255, 0.75);
                font-size: 14px;
                color: var(--color-text-deep);
                font-family: inherit;
                transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
              }
              :global(.drawer-input:focus) {
                outline: none;
                border-color: #e8547a;
                background: white;
                box-shadow: 0 0 0 4px rgba(232, 84, 122, 0.14);
              }
            `}</style>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span
        className="block text-[11px] tracking-[0.22em] uppercase font-bold mb-2"
        style={{ color: "var(--color-text-deep)" }}
      >
        {label}
        {required && (
          <span className="ml-1" style={{ color: "#e8547a" }}>
            *
          </span>
        )}
      </span>
      {children}
    </label>
  );
}
