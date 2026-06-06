"use client";

/**
 * FounderSpeaks — rail of Garima's reels.
 *
 * Uses Instagram's own /embed iframe (real thumbnail, plays inline in the
 * site) but the iframe is CROPPED inside a portrait wrapper so only the
 * VIDEO shows — the white header (profile/follow) and the bottom bar
 * (likes/caption/"view on Instagram") are clipped out of view.
 * A small view-count badge is overlaid on top.
 */

import { motion } from "framer-motion";
import { useRef } from "react";

type Reel = { id: string; views: string };

const REELS: Reel[] = [
  { id: "DVJOZ4kkpyR", views: "133K" },
  { id: "DVV89KBkhbQ", views: "88.7K" },
  { id: "DWY9mRPgVWP", views: "36K" },
  { id: "DV-9OdNAV-e", views: "" },
];

export default function FounderSpeaks() {
  const railRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: number) => {
    const el = railRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section
      id="founder-speaks"
      className="stack-card relative min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 20% 20%, rgba(255,210,225,0.7), transparent 55%)," +
          "radial-gradient(ellipse at 80% 80%, rgba(184,156,224,0.55), transparent 55%)," +
          "linear-gradient(135deg, #fff5f4 0%, #fbe5ee 50%, #ead8f5 100%)",
      }}
    >
      <div className="relative z-10 max-w-[1500px] mx-auto px-6 md:px-12 pt-24 md:pt-32 pb-20 min-h-screen flex flex-col">
        <div className="text-center mb-10 md:mb-14">
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="section-eyebrow-rose mb-3"
          >
            ✦ Straight from the source
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.9, ease: "easeOut" }}
            className="section-script" style={{ fontSize: "clamp(40px, 6vw, 78px)" }}
          >
            The Founder Speaks
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ delay: 0.15, duration: 0.7 }}
            className="mt-4 max-w-xl mx-auto text-[14px] md:text-[15px] italic"
            style={{ color: "var(--color-text-body)" }}
          >
            Garima&rsquo;s most-watched reels — strategy, story, and the
            marketing language, in her own words. Press play.
          </motion.p>
        </div>

        <div className="relative flex-1 flex items-center">
          <ArrowBtn dir={-1} onClick={() => scrollBy(-1)} />
          <div ref={railRef} data-lenis-prevent className="fs-rail no-scrollbar">
            {REELS.map((r, i) => (
              <motion.div
                key={r.id}
                className="fs-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                {/* cropped IG video */}
                <div className="fs-crop">
                  <iframe
                    src={`https://www.instagram.com/reel/${r.id}/embed/`}
                    title="Instagram reel"
                    loading="lazy"
                    scrolling="no"
                    allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
                    allowFullScreen
                  />
                </div>
                {/* views badge overlay */}
                {r.views && (
                  <div className="fs-views">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>{r.views}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          <ArrowBtn dir={1} onClick={() => scrollBy(1)} />
        </div>

        <p className="text-center mt-6 text-[11px] tracking-[0.3em] uppercase"
          style={{ color: "var(--color-text-muted)" }}>
          ← drag or use arrows →
        </p>
      </div>
    </section>
  );
}

function ArrowBtn({ dir, onClick }: { dir: number; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={dir < 0 ? "Previous" : "Next"}
      className="fs-arrow hidden md:flex"
      style={{ [dir < 0 ? "left" : "right"]: "-6px" } as React.CSSProperties}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        {dir < 0
          ? <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          : <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </button>
  );
}
