"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead, LeadStatus } from "@/lib/supabase/database.types";

const STATUSES: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "negotiating", label: "Negotiating" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

export default function LeadDrawer({
  open,
  lead,
  onClose,
}: {
  open: boolean;
  lead: Lead | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<LeadStatus>("new");
  const [followUp, setFollowUp] = useState("");
  const [source, setSource] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFullName(lead?.full_name ?? "");
      setEmail(lead?.email ?? "");
      setPhone(lead?.phone ?? "");
      setStatus(lead?.status ?? "new");
      setFollowUp(lead?.follow_up_date ?? "");
      setSource(lead?.source ?? "");
      setNotes(lead?.notes ?? "");
      setError(null);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open, lead]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        full_name: fullName,
        email: email || null,
        phone: phone || null,
        status,
        follow_up_date: followUp || null,
        source: source || null,
        notes: notes || null,
      };
      const res = await fetch(
        lead ? `/api/admin/leads/${lead.id}` : "/api/admin/leads",
        {
          method: lead ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "save failed");
      onClose();
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
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
                  ✦ {lead ? "Edit Lead" : "New Lead"}
                </p>
                <h3 className="section-script" style={{ fontSize: 30 }}>
                  {lead ? "Update the trail" : "Track a prospect"}
                </h3>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="w-9 h-9 rounded-full border flex items-center justify-center"
                style={{
                  borderColor: "rgba(232,84,122,0.4)",
                  color: "var(--color-text-deep)",
                }}
              >
                ✕
              </button>
            </header>

            <form
              onSubmit={save}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-5"
            >
              <Field label="Full name" required>
                <input
                  required
                  className="ld-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Meera Kapoor"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email">
                  <input
                    className="ld-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="meera@brand.in"
                  />
                </Field>
                <Field label="Phone">
                  <input
                    className="ld-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 …"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Status">
                  <select
                    className="ld-input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as LeadStatus)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Follow-up date">
                  <input
                    className="ld-input"
                    type="date"
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Source">
                <input
                  className="ld-input"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Instagram DM, referral…"
                />
              </Field>
              <Field label="Notes">
                <textarea
                  className="ld-input"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What do they want? Pricing discussed?"
                />
              </Field>

              {error && (
                <p
                  className="text-[12px] px-3 py-2 rounded-xl"
                  style={{
                    background: "rgba(232,84,122,0.1)",
                    color: "#c23b68",
                    border: "1px solid rgba(232,84,122,0.3)",
                  }}
                >
                  ⚠ {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="text-[12px] tracking-[0.22em] uppercase font-bold py-3 px-5 rounded-xl flex-1"
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
                  disabled={loading}
                  className="cta-solid flex-1 justify-center"
                  style={{ padding: "14px 22px", fontSize: 12 }}
                >
                  {loading ? "Saving…" : lead ? "Save Changes" : "Create Lead"}
                  {!loading && <span>✦</span>}
                </button>
              </div>
            </form>

            <style jsx>{`
              :global(.ld-input) {
                width: 100%;
                padding: 12px 14px;
                border-radius: 12px;
                border: 1.5px solid rgba(61, 26, 77, 0.16);
                background: rgba(255, 255, 255, 0.75);
                font-size: 14px;
                color: var(--color-text-deep);
                font-family: inherit;
                resize: vertical;
                transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
              }
              :global(.ld-input:focus) {
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
