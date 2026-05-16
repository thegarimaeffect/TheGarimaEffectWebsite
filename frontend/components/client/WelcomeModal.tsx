"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Emotional, on-brand welcome shown to clients during the build phase.
 * Shows on every visit until the calendar is approved; the first dismissal
 * stamps welcome_seen_at so we know they've been greeted at least once.
 */
export default function WelcomeModal({
  firstName,
  open,
  onDismiss,
}: {
  firstName: string;
  open: boolean;
  onDismiss: () => void;
}) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  async function dismiss() {
    if (closing) return;
    setClosing(true);
    // Fire-and-forget — first dismissal records the timestamp.
    fetch("/api/client/welcome-seen", { method: "PATCH" }).catch(() => {});
    setTimeout(() => {
      onDismiss();
      setClosing(false);
    }, 380);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: closing ? 0 : 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center px-5"
          style={{
            zIndex: 200,
            background: "rgba(61,26,77,0.55)",
            backdropFilter: "blur(16px) saturate(120%)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{
              opacity: closing ? 0 : 1,
              scale: closing ? 0.94 : 1,
              y: closing ? 20 : 0,
            }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="relative w-full max-w-[640px] rounded-[36px] overflow-hidden text-center"
            style={{
              background:
                "radial-gradient(ellipse at 20% 18%, rgba(255,200,220,0.95) 0%, transparent 58%)," +
                "radial-gradient(ellipse at 82% 82%, rgba(200,175,240,0.9) 0%, transparent 58%)," +
                "linear-gradient(135deg, #fff5f4 0%, #fbe5ee 50%, #ead8f5 100%)",
              border: "1px solid rgba(232,84,122,0.28)",
              boxShadow: "0 40px 120px rgba(155,127,199,0.4)",
            }}
          >
            {/* Floating orbs */}
            <motion.div
              aria-hidden
              className="absolute -top-28 -right-20 w-80 h-80 rounded-full blur-3xl"
              style={{ background: "rgba(232,84,122,0.4)" }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.75, 0.5] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              className="absolute -bottom-28 -left-20 w-80 h-80 rounded-full blur-3xl"
              style={{ background: "rgba(184,156,224,0.4)" }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.45, 0.7, 0.45] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative px-8 py-14 md:px-16 md:py-16">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
                className="text-[34px] mb-6"
                style={{ color: "#e8547a" }}
              >
                ✦
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[11px] tracking-[0.5em] uppercase font-bold mb-5"
                style={{ color: "#c23b68" }}
              >
                Welcome to the journey
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.7 }}
                className="section-script mb-6"
                style={{ fontSize: "clamp(38px, 6vw, 70px)", lineHeight: 1.02 }}
              >
                Let&apos;s make your
                <br />
                brand big, {firstName}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-[15px] md:text-[16px] italic leading-relaxed max-w-md mx-auto mb-10"
                style={{ color: "var(--color-text-body)" }}
              >
                Every iconic brand started with a single brave decision. You just
                made yours. From here, we craft your story — one cinematic moment
                at a time, together.
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                onClick={dismiss}
                disabled={closing}
                className="cta-solid mx-auto"
                style={{ padding: "18px 44px", fontSize: 13 }}
              >
                Begin the journey <span>→</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
