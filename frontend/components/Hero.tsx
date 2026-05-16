"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

const CAST = [
  "INSTAGRAM GROWTH",
  "BRAND BUILDING",
  "SALES FUNNELS",
  "VIDEO SCRIPTS",
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const watermarkY = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const watermarkOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.55]);
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <section
      ref={ref}
      id="hero"
      className="stack-card relative w-full min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 18% 22%, rgba(255,200,220,0.85) 0%, transparent 55%)," +
          "radial-gradient(ellipse at 82% 38%, rgba(200,175,240,0.75) 0%, transparent 55%)," +
          "radial-gradient(ellipse at 50% 92%, rgba(255,215,220,0.8) 0%, transparent 55%)," +
          "linear-gradient(135deg, #fff0f5 0%, #fadff2 35%, #ead8f5 70%, #fde8e8 100%)",
      }}
    >
      {/* Floating shimmer particles */}
      <ShimmerLayer />

      {/* TOP CAST ROW */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.7 }}
        className="absolute top-24 md:top-28 left-0 right-0 z-20 px-6 md:px-16"
      >
        <div className="flex items-center justify-between gap-2 max-w-[1500px] mx-auto">
          <span className="hidden md:block w-12 h-px bg-[#e8547a]/30" />
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
          <span className="hidden md:block w-12 h-px bg-[#e8547a]/30" />
        </div>
      </motion.div>

      {/* TOP-RIGHT EST */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="absolute top-40 md:top-44 right-6 md:right-10 z-20 text-right"
      >
        <p
          className="text-[10px] tracking-[0.4em] uppercase"
          style={{ color: "var(--color-text-muted)" }}
        >
          Est.
        </p>
        <p
          className="text-[14px] tracking-[0.3em] font-semibold mt-1"
          style={{ color: "var(--color-text-deep)" }}
        >
          2020
        </p>
      </motion.div>

      {/* MAIN GRID — TEXT LEFT, PHOTO RIGHT */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-0 min-h-screen items-end pt-40 md:pt-44 pb-16">
        {/* LEFT: GIANT WATERMARK + STORY */}
        <motion.div
          style={{ y: watermarkY, opacity: watermarkOpacity }}
          className="md:col-span-7 px-6 md:pl-12 md:pr-4 flex flex-col justify-center md:justify-end relative z-10"
        >
          <motion.h1
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 1.1, ease: "easeOut" }}
            className="giant-watermark text-left leading-[0.82]"
            style={{
              color: "rgba(61, 26, 77, 0.85)",
              fontSize: "clamp(64px, 13vw, 200px)",
              textShadow: "0 4px 30px rgba(232,84,122,0.15)",
            }}
          >
            THE
            <br />
            GARIMA
            <br />
            <span style={{ color: "#e8547a" }}>EFFECT</span>
          </motion.h1>

          {/* Decorative ribbon under headline */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="mt-6 h-[2px] w-48 origin-left"
            style={{
              background:
                "linear-gradient(90deg, #e8547a 0%, transparent 100%)",
            }}
          />

          {/* Story */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="mt-8 max-w-md"
          >
            <p
              className="section-eyebrow-rose mb-3"
              style={{ letterSpacing: "0.4em" }}
            >
              ✦ Garima Effect Story
            </p>
            <p
              className="italic leading-relaxed text-[14px] md:text-[15px]"
              style={{ color: "var(--color-text-body)" }}
            >
              From concept to content — Garima transforms brands into magnetic
              stories that sell. A four-year practice in voice, taste, and
              relentless craft.
            </p>
          </motion.div>
        </motion.div>

        {/* RIGHT: PHOTO */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1.1, ease: "easeOut" }}
          className="md:col-span-5 relative h-[55vh] md:h-[88vh] md:-ml-10 z-[5]"
        >
          <motion.div
            style={{
              y: photoY,
              scale: photoScale,
              filter: "drop-shadow(0 30px 80px rgba(155,127,199,0.45))",
            }}
            className="relative w-full h-full"
          >
            <Image
              src="/garima.png"
              alt="Garima Rana"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{
                objectFit: "contain",
                objectPosition: "bottom center",
              }}
            />
          </motion.div>

          {/* Floating decorative tags around photo */}
          <FloatingTag top="14%" right="-2%" delay={2.0} text="✦ 2.3M views" />
          <FloatingTag top="46%" left="-8%" delay={2.4} text="+340% growth" />
          <FloatingTag bottom="20%" right="-2%" delay={2.8} text="6× engagement" />
        </motion.div>
      </div>

      {/* SCROLL HINT */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
      >
        <p
          className="text-[10px] tracking-[0.4em] uppercase"
          style={{ color: "var(--color-text-muted)" }}
        >
          Scroll
        </p>
        <motion.span
          animate={{ y: [0, 6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          style={{ color: "#e8547a" }}
        >
          ↓
        </motion.span>
      </motion.div>
    </section>
  );
}

// ====================================================================
// Decorative shimmer
// ====================================================================

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

function FloatingTag({
  text,
  top,
  bottom,
  left,
  right,
  delay,
}: {
  text: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.6, type: "spring", damping: 14 }}
      style={{
        position: "absolute",
        top,
        bottom,
        left,
        right,
      }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3 + (delay % 1), repeat: Infinity, ease: "easeInOut" }}
        className="px-4 py-2 rounded-full text-[11px] font-bold tracking-[0.18em] uppercase whitespace-nowrap"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(232,84,122,0.4)",
          color: "#e8547a",
          boxShadow: "0 8px 24px rgba(232,84,122,0.18)",
        }}
      >
        {text}
      </motion.div>
    </motion.div>
  );
}
