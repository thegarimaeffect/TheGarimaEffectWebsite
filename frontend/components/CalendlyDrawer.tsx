"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export const CALENDLY_URL = "https://calendly.com/thegarimaeffect/30min";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CalendlyDrawer({ open, onClose }: Props) {
  useEffect(() => {
    const id = "calendly-widget-script";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
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
            className="fixed top-0 right-0 h-full shadow-2xl flex flex-col"
            style={{
              zIndex: 101,
              width: "min(420px, 100vw)",
              background:
                "linear-gradient(180deg, #fff5f4 0%, #fbe5ee 50%, #ead8f5 100%)",
              borderLeft: "1px solid rgba(232,84,122,0.25)",
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: "1px solid rgba(232,84,122,0.18)" }}
            >
              <div>
                <p
                  className="text-[10px] tracking-[0.4em] uppercase"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Schedule
                </p>
                <h3
                  className="script-logo text-2xl mt-1"
                  style={{
                    background:
                      "linear-gradient(135deg, #4a1a4d 0%, #e8547a 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Book a Call
                </h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-10 h-10 rounded-full border border-[#e8547a]/40 hover:border-[#e8547a] hover:bg-[#e8547a]/10 flex items-center justify-center transition"
                style={{ color: "var(--color-text-deep)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                  <line x1="6" y1="18" x2="18" y2="6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex-1 bg-white">
              <div
                className="calendly-inline-widget"
                data-url={CALENDLY_URL}
                style={{ minWidth: "320px", height: "100%" }}
              />
            </div>

            <div
              className="px-6 py-3 text-center text-[11px] tracking-[0.3em] uppercase"
              style={{
                borderTop: "1px solid rgba(232,84,122,0.18)",
                color: "var(--color-text-muted)",
              }}
            >
              Powered by Calendly
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
