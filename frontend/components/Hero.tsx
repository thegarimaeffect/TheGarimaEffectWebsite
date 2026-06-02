"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import RopeReveal from "./RopeReveal";

const CAST = [
  "INSTAGRAM GROWTH",
  "BRAND BUILDING",
  "SALES FUNNELS",
  "VIDEO SCRIPTS",
];

const STATS = [
  { num: "4+",     label: "Years crafting" },
  { num: "60+",    label: "Brands transformed" },
  { num: "120M+",  label: "Combined views" },
  { num: "₹3.4Cr+", label: "Revenue moved" },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  return (
    <section
      ref={ref}
      id="hero"
      className="stack-card relative w-full min-h-screen overflow-hidden"
      style={{
        background: "var(--color-bg-gradient)",
      }}
    >
      {/* Shimmer particles (existing decorative layer) */}
      <ShimmerLayer />

      {/* TOP CAST ROW */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.7 }}
        className="absolute top-24 md:top-28 left-0 right-0 z-20 px-6 md:px-16"
      >
        <div className="flex items-center justify-between gap-2 max-w-[1500px] mx-auto">
          <span className="hidden md:block w-12 h-px" style={{ background: "rgba(232,84,122,0.3)" }} />
          {CAST.map((c, i) => (
            <motion.span
              key={c}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + i * 0.12, duration: 0.5 }}
              className="text-[10px] md:text-[12px] font-bold tracking-[0.2em] uppercase whitespace-nowrap"
              style={{ color: "var(--color-text-deep)" }}
            >
              {c}
              {i < CAST.length - 1 && (
                <span className="hidden md:inline mx-3 md:mx-6 opacity-30">·</span>
              )}
            </motion.span>
          ))}
          <span className="hidden md:block w-12 h-px" style={{ background: "rgba(232,84,122,0.3)" }} />
        </div>
      </motion.div>

      {/* TOP-RIGHT EST */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="absolute top-40 md:top-44 right-6 md:right-10 z-20 text-right"
      >
        <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: "var(--color-text-muted)" }}>
          Est.
        </p>
        <p className="text-[14px] tracking-[0.3em] font-semibold mt-1" style={{ color: "var(--color-text-deep)" }}>
          2020
        </p>
      </motion.div>

      {/* MAIN STAGE — the 3D rope reveal animation */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-40 md:pt-44 pb-28 px-6">
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          animate={{ opacity: 1, letterSpacing: "0.5em" }}
          transition={{ delay: 0.6, duration: 0.9 }}
          className="text-[11px] md:text-[12px] tracking-[0.5em] uppercase font-bold mb-2"
          style={{ color: "var(--color-accent-rose)" }}
        >
          ✦ From concept to content ✦
        </motion.p>

        {/* THE 3D ROPE ANIMATION */}
        <div className="w-full max-w-[760px] mx-auto">
          <RopeReveal />
        </div>

        {/* Short story below the animation */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 5.4, duration: 0.9 }}
          className="text-center max-w-xl mt-2 md:mt-4 italic leading-relaxed text-[14px] md:text-[16px]"
          style={{ color: "var(--color-text-body)" }}
        >
          Tangled brand chaos, untangled into a story people remember —
          four years of voice, taste, and relentless craft.
        </motion.p>

        {/* 4 STATS — moved here from About */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 6.0, duration: 0.9 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-10 md:mt-12 w-full max-w-[920px]"
          style={{ perspective: 900 }}
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 40, rotateX: -20 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              whileHover={{ y: -8, rotateX: 6, scale: 1.04 }}
              transition={{ delay: 6.2 + i * 0.12, type: "spring", damping: 16 }}
              className="stat-tile"
              style={{
                transform: `translateZ(${20 + i * 10}px)`,
                transformStyle: "preserve-3d",
              }}
            >
              <p
                className="stat-num"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-accent-rose) 0%, var(--color-accent-lavender) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {s.num}
              </p>
              <p
                className="text-[10px] md:text-[11px] tracking-[0.3em] uppercase font-semibold mt-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                {s.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* SCROLL HINT */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 7.4, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
      >
        <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: "var(--color-text-muted)" }}>
          Scroll
        </p>
        <motion.span
          animate={{ y: [0, 6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          style={{ color: "var(--color-accent-rose)" }}
        >
          ↓
        </motion.span>
      </motion.div>
    </section>
  );
}

function ShimmerLayer() {
  const dots = Array.from({ length: 28 }).map((_, i) => ({
    top: `${(i * 13) % 90}%`,
    left: `${(i * 31) % 95}%`,
    size: 3 + ((i * 7) % 6),
    color: i % 3 === 0 ? "#f5c842" : i % 3 === 1 ? "#e8547a" : "#b89ce0",
    dur: 2 + ((i * 0.4) % 4),
    delay: (i * 0.27) % 4,
  }));
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none">
      {dots.map((d, i) => (
        <span
          key={i}
          className="shimmer-dot"
          style={
            {
              top: d.top,
              left: d.left,
              width: d.size,
              height: d.size,
              background: d.color,
              opacity: 0.55,
              boxShadow: `0 0 ${d.size * 3}px ${d.color}80`,
              ["--shimmer-dur" as string]: `${d.dur}s`,
              ["--shimmer-delay" as string]: `${d.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
