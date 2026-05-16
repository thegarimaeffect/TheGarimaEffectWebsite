"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BrandIntake } from "@/lib/supabase/database.types";

/**
 * Post-welcome brand intake. The client supplies brand context + the social
 * credentials our team needs to post on their behalf. Credentials are visible
 * to ADMIN ONLY (enforced by RLS on brand_intake) — we say so explicitly here
 * so the client trusts the ask.
 */
export default function IntakeModal({
  open,
  existing,
  onClose,
}: {
  open: boolean;
  existing: BrandIntake | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [instagramHandle, setInstagramHandle] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [goalsText, setGoalsText] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [igPassword, setIgPassword] = useState("");
  const [fbHandle, setFbHandle] = useState("");
  const [fbPassword, setFbPassword] = useState("");
  const [otherPlatforms, setOtherPlatforms] = useState("");

  useEffect(() => {
    if (open) {
      setStep(1);
      setError(null);
      setDone(false);
      setInstagramHandle(existing?.instagram_handle ?? "");
      setBrandVoice(existing?.brand_voice ?? "");
      setTargetAudience(existing?.target_audience ?? "");
      setCompetitors(existing?.competitors ?? "");
      setGoalsText(existing?.goals_text ?? "");
      setAdditionalNotes(existing?.additional_notes ?? "");
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open, existing]);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const credentials: Record<string, string> = {};
      if (igPassword.trim()) credentials.instagram_password = igPassword.trim();
      if (fbHandle.trim()) credentials.facebook_handle = fbHandle.trim();
      if (fbPassword.trim()) credentials.facebook_password = fbPassword.trim();

      const res = await fetch("/api/client/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instagram_handle: instagramHandle.trim() || null,
          brand_voice: brandVoice.trim() || null,
          target_audience: targetAudience.trim() || null,
          competitors: competitors.trim() || null,
          goals_text: goalsText.trim() || null,
          additional_notes: additionalNotes.trim() || null,
          credentials,
          other_platforms: otherPlatforms.trim()
            ? { notes: otherPlatforms.trim() }
            : {},
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save");
      setDone(true);
      setLoading(false);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center px-5 py-8 overflow-y-auto"
          style={{
            zIndex: 190,
            background: "rgba(61,26,77,0.5)",
            backdropFilter: "blur(14px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
            className="relative w-full max-w-[620px] rounded-[32px] my-auto"
            style={{
              background:
                "linear-gradient(180deg, #fff5f4 0%, #fbe5ee 55%, #ead8f5 100%)",
              border: "1px solid rgba(232,84,122,0.28)",
              boxShadow: "0 40px 110px rgba(155,127,199,0.38)",
            }}
          >
            <div
              className="px-7 py-6"
              style={{ borderBottom: "1px solid rgba(232,84,122,0.16)" }}
            >
              <p
                className="text-[10px] tracking-[0.45em] uppercase font-bold mb-1"
                style={{ color: "#c23b68" }}
              >
                ✦ A few words about your brand
              </p>
              <h3 className="section-script" style={{ fontSize: 34, lineHeight: 1 }}>
                {done ? "You're all set" : "Tell us your world"}
              </h3>
            </div>

            {done ? (
              <div className="px-7 py-12 text-center">
                <div
                  className="text-[40px] mb-4"
                  style={{ color: "#e8547a" }}
                >
                  ✦
                </div>
                <p
                  className="text-2xl mb-3"
                  style={{
                    fontFamily: "var(--font-script), cursive",
                    color: "var(--color-text-deep)",
                    fontWeight: 700,
                  }}
                >
                  Thank you for trusting us
                </p>
                <p
                  className="text-[14px] italic max-w-sm mx-auto mb-8"
                  style={{ color: "var(--color-text-body)" }}
                >
                  Your story is in good hands. We&apos;ll start crafting your
                  calendar — you&apos;ll be the first to see it.
                </p>
                <button
                  onClick={onClose}
                  className="cta-solid mx-auto"
                  style={{ padding: "14px 32px", fontSize: 12 }}
                >
                  Enter my studio <span>→</span>
                </button>
              </div>
            ) : (
              <>
                <div className="px-7 py-6 space-y-5 max-h-[60vh] overflow-y-auto">
                  {/* Step indicator */}
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2].map((s) => (
                      <div
                        key={s}
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: s === step ? 36 : 18,
                          background:
                            s <= step
                              ? "linear-gradient(135deg, #e8547a, #b89ce0)"
                              : "rgba(232,84,122,0.2)",
                        }}
                      />
                    ))}
                  </div>

                  {step === 1 && (
                    <>
                      <Field label="Instagram handle">
                        <input
                          className="ik-input"
                          value={instagramHandle}
                          onChange={(e) => setInstagramHandle(e.target.value)}
                          placeholder="@yourbrand"
                        />
                      </Field>
                      <Field label="Your brand voice">
                        <textarea
                          className="ik-input"
                          rows={3}
                          value={brandVoice}
                          onChange={(e) => setBrandVoice(e.target.value)}
                          placeholder="Warm, founder-led, a little rebellious…"
                        />
                      </Field>
                      <Field label="Who are you talking to?">
                        <textarea
                          className="ik-input"
                          rows={2}
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          placeholder="Women 25–40 who invest in their skin…"
                        />
                      </Field>
                      <Field label="Brands you admire / compete with">
                        <input
                          className="ik-input"
                          value={competitors}
                          onChange={(e) => setCompetitors(e.target.value)}
                          placeholder="Glossier, The Ordinary…"
                        />
                      </Field>
                      <Field label="What does winning look like?">
                        <textarea
                          className="ik-input"
                          rows={2}
                          value={goalsText}
                          onChange={(e) => setGoalsText(e.target.value)}
                          placeholder="100K followers, a sold-out launch…"
                        />
                      </Field>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div
                        className="rounded-2xl p-4 flex items-start gap-3"
                        style={{
                          background: "rgba(232,84,122,0.08)",
                          border: "1px solid rgba(232,84,122,0.25)",
                        }}
                      >
                        <span className="text-[16px]">🔒</span>
                        <p
                          className="text-[12px] leading-relaxed"
                          style={{ color: "var(--color-text-body)" }}
                        >
                          So we can post for you, we need account access. These
                          credentials are visible to{" "}
                          <strong style={{ color: "#c23b68" }}>
                            Garima &amp; the admin team only
                          </strong>{" "}
                          — never your project manager or interns.
                        </p>
                      </div>
                      <Field label="Instagram password">
                        <input
                          className="ik-input"
                          type="password"
                          value={igPassword}
                          onChange={(e) => setIgPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="new-password"
                        />
                      </Field>
                      <Field label="Facebook page / handle">
                        <input
                          className="ik-input"
                          value={fbHandle}
                          onChange={(e) => setFbHandle(e.target.value)}
                          placeholder="facebook.com/yourbrand"
                        />
                      </Field>
                      <Field label="Facebook password">
                        <input
                          className="ik-input"
                          type="password"
                          value={fbPassword}
                          onChange={(e) => setFbPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="new-password"
                        />
                      </Field>
                      <Field label="Other platforms / anything else">
                        <textarea
                          className="ik-input"
                          rows={3}
                          value={otherPlatforms}
                          onChange={(e) => setOtherPlatforms(e.target.value)}
                          placeholder="YouTube, TikTok handles, scheduling tools…"
                        />
                      </Field>
                      <Field label="Notes for the team">
                        <textarea
                          className="ik-input"
                          rows={2}
                          value={additionalNotes}
                          onChange={(e) => setAdditionalNotes(e.target.value)}
                          placeholder="Anything we should know going in."
                        />
                      </Field>
                    </>
                  )}

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
                </div>

                <div
                  className="px-7 py-5 flex items-center justify-between gap-3"
                  style={{ borderTop: "1px solid rgba(232,84,122,0.16)" }}
                >
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="text-[11px] tracking-[0.2em] uppercase font-bold"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Skip for now
                  </button>
                  <div className="flex items-center gap-3">
                    {step === 2 && (
                      <button
                        onClick={() => setStep(1)}
                        disabled={loading}
                        className="text-[12px] tracking-[0.2em] uppercase font-bold py-3 px-5 rounded-xl"
                        style={{
                          background: "rgba(255,255,255,0.6)",
                          color: "var(--color-text-deep)",
                          border: "1px solid rgba(232,84,122,0.25)",
                        }}
                      >
                        ← Back
                      </button>
                    )}
                    {step === 1 ? (
                      <button
                        onClick={() => setStep(2)}
                        className="cta-solid"
                        style={{ padding: "13px 28px", fontSize: 12 }}
                      >
                        Next <span>→</span>
                      </button>
                    ) : (
                      <button
                        onClick={submit}
                        disabled={loading}
                        className="cta-solid"
                        style={{ padding: "13px 28px", fontSize: 12 }}
                      >
                        {loading ? "Saving…" : "Submit"}
                        {!loading && <span>✦</span>}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

            <style jsx>{`
              :global(.ik-input) {
                width: 100%;
                padding: 12px 14px;
                border-radius: 12px;
                border: 1.5px solid rgba(61, 26, 77, 0.16);
                background: rgba(255, 255, 255, 0.78);
                font-size: 14px;
                color: var(--color-text-deep);
                font-family: inherit;
                resize: vertical;
                transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
              }
              :global(.ik-input:focus) {
                outline: none;
                border-color: #e8547a;
                background: white;
                box-shadow: 0 0 0 4px rgba(232, 84, 122, 0.14);
              }
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span
        className="block text-[11px] tracking-[0.2em] uppercase font-bold mb-2"
        style={{ color: "var(--color-text-deep)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
