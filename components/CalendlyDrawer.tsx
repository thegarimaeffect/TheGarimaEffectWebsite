"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export const CALENDLY_URL = "https://calendly.com/garimaeffect";

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Right-side drawer that embeds Calendly inline.
 * Loads Calendly's external widget script once when the component mounts.
 */
export default function CalendlyDrawer({ open, onClose }: Props) {
  // Inject Calendly widget script once
  useEffect(() => {
    const id = "calendly-widget-script";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Close on Escape
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
          {/* BACKDROP */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: 100 }}
          />

          {/* DRAWER */}
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 240, damping: 32 }}
            className="fixed top-0 right-0 h-full bg-gradient-to-b from-[#1a1a3e] via-[#3d2b5e] to-[#0f0f2e] shadow-2xl flex flex-col"
            style={{
              zIndex: 101,
              width: "min(420px, 100vw)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div>
                <p className="text-[10px] tracking-[0.4em] text-white/60 uppercase">
                  Schedule
                </p>
                <h3 className="script-logo text-white text-2xl mt-1">
                  Book a Call
                </h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-10 h-10 rounded-full border border-white/30 hover:border-accent-primary hover:bg-white/10 flex items-center justify-center transition"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
                  <line x1="6" y1="18" x2="18" y2="6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Calendly inline widget */}
            <div className="flex-1 bg-white">
              <div
                className="calendly-inline-widget"
                data-url={CALENDLY_URL}
                style={{ minWidth: "320px", height: "100%" }}
              />
            </div>

            <div className="px-6 py-3 border-t border-white/10 text-center text-[11px] tracking-[0.3em] uppercase text-white/50">
              Powered by Calendly
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
