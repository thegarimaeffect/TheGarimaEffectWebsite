"use client";

/**
 * FounderSpeaks — a rail of Garima's reels as clean glass poster cards.
 *
 * No Instagram embed chrome (no white box / profile / caption clutter).
 * Each card merges into the section background, shows just the VIEW COUNT
 * and a play button, and opens the reel on Instagram when clicked.
 */

import { motion } from "framer-motion";
import { useRef } from "react";

type Reel = { url: string; views: string; accent: string };

const REELS: Reel[] = [
  { url: "https://www.instagram.com/reel/DVJOZ4kkpyR/", views: "133K", accent: "#e8547a" },
  { url: "https://www.instagram.com/reel/DVV89KBkhbQ/", views: "88.7K", accent: "#b89ce0" },
  { url: "https://www.instagram.com/reel/DWY9mRPgVWP/", views: "36K", accent: "#9b7fc7" },
  { url: "https://www.instagram.com/reel/DV-9OdNAV-e/", views: "Watch", accent: "#ff8aab" },
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
        {/* Heading */}
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
            marketing language, in her own words.
          </motion.p>
        </div>

        {/* Reel rail */}
        <div className="relative flex-1 flex items-center">
          <ArrowBtn dir={-1} onClick={() => scrollBy(-1)} />
          <div ref={railRef} data-lenis-prevent className="fs-rail no-scrollbar">
            {REELS.map((r, i) => (
              <motion.a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="fs-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                style={{
                  background: `linear-gradient(160deg, ${r.accent}22 0%, rgba(255,255,255,0.06) 60%), linear-gradient(135deg, ${r.accent}33, #ffffff10)`,
                }}
              >
                {/* views badge */}
                <div className="fs-views">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>{r.views}</span>
                </div>

                {/* play button */}
                <div className="fs-play" style={{ background: r.accent }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>

                <div className="fs-cta">▶ Watch on Instagram</div>
              </motion.a>
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
