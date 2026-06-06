"use client";

/**
 * FounderSpeaks — a horizontal reel rail of Garima's Instagram content.
 *
 * Each card is a native Instagram embed: it shows the reel's thumbnail +
 * caption + view count, and the visitor can play / open it right there.
 * As you scroll the rail sideways, reels snap into view.
 */

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Garima's reels (most-viewed first)
const REELS = [
  "https://www.instagram.com/reel/DVJOZ4kkpyR/", // 133K
  "https://www.instagram.com/reel/DVV89KBkhbQ/", // 88.7K
  "https://www.instagram.com/reel/DWY9mRPgVWP/", // 36K
  "https://www.instagram.com/reel/DV-9OdNAV-e/",
];

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

export default function FounderSpeaks() {
  const railRef = useRef<HTMLDivElement>(null);

  // Load Instagram's embed script and process the blockquotes
  useEffect(() => {
    const id = "instagram-embed-script";
    const process = () => window.instgrm?.Embeds?.process();
    if (document.getElementById(id)) {
      process();
      return;
    }
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://www.instagram.com/embed.js";
    s.async = true;
    s.onload = process;
    document.body.appendChild(s);
    // re-process shortly after in case it loaded before blockquotes painted
    const t = setTimeout(process, 1200);
    return () => clearTimeout(t);
  }, []);

  const scrollBy = (dir: number) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
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
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="section-eyebrow-rose mb-3"
          >
            ✦ Straight from the source
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="section-script"
            style={{ fontSize: "clamp(40px, 6vw, 78px)" }}
          >
            The Founder Speaks
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="mt-4 max-w-xl mx-auto text-[14px] md:text-[15px] italic"
            style={{ color: "var(--color-text-body)" }}
          >
            Garima&rsquo;s most-watched reels — strategy, story, and the
            marketing language, in her own words. Scroll across and press play.
          </motion.p>
        </div>

        {/* Reel rail */}
        <div className="relative flex-1 flex items-center">
          <ArrowBtn dir={-1} onClick={() => scrollBy(-1)} />
          <div
            ref={railRef}
            data-lenis-prevent
            className="fs-rail no-scrollbar"
          >
            {REELS.map((url) => (
              <div key={url} className="fs-card">
                <blockquote
                  className="instagram-media"
                  data-instgrm-permalink={`${url}?utm_source=ig_embed`}
                  data-instgrm-version="14"
                  style={{
                    background: "#fff",
                    border: 0,
                    margin: 0,
                    width: "100%",
                    minWidth: "260px",
                  }}
                />
              </div>
            ))}
          </div>
          <ArrowBtn dir={1} onClick={() => scrollBy(1)} />
        </div>

        <p
          className="text-center mt-6 text-[11px] tracking-[0.3em] uppercase"
          style={{ color: "var(--color-text-muted)" }}
        >
          ← drag or use arrows →
        </p>
      </div>
    </section>
  );
}

function ArrowBtn({ dir, onClick }: { dir: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={dir < 0 ? "Previous" : "Next"}
      className="fs-arrow hidden md:flex"
      style={{ [dir < 0 ? "left" : "right"]: "-6px" } as React.CSSProperties}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        {dir < 0 ? (
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}
