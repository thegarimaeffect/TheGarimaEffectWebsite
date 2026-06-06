"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import EnvelopeHero from "./EnvelopeHero";

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

      {/* MAIN STAGE — envelope reveal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-28 md:pt-32 pb-24">
        {/* envelope reveal animation */}
        <div className="w-full">
          <EnvelopeHero />
        </div>

        {/* Tagline + CTA below the animation */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.6, duration: 0.9 }}
          className="text-center max-w-2xl mt-2 px-6 italic leading-relaxed text-[15px] md:text-[18px]"
          style={{ color: "var(--color-text-body)" }}
        >
          Every reel earns its hook. Every caption earns its click. Every
          funnel earns its yes.
        </motion.p>

        <motion.a
          href="/contact"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.9, duration: 0.8 }}
          whileHover={{ scale: 1.05 }}
          className="mt-6 inline-flex items-center px-8 py-3 rounded-full text-white font-bold text-[12px] tracking-[0.22em] uppercase"
          style={{
            background: "linear-gradient(135deg, #e8547a 0%, #b89ce0 100%)",
            boxShadow: "0 12px 32px rgba(232,84,122,0.4)",
          }}
        >
          ✦ Book a Discovery Call
        </motion.a>
      </div>

      {/* SCROLL HINT */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 4.0, duration: 0.8 }}
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
