"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import StarField from "./StarField";

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

  // Parallax: giant text drifts up slowly, photo drifts down faster
  const watermarkY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const watermarkScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const photoOpacity = useTransform(scrollYProgress, [0, 0.7, 1], [1, 0.75, 0]);
  const starsY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  return (
    <section
      ref={ref}
      id="hero"
      className="stack-card relative w-full min-h-screen overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #1a1a3e 0%, #2a1f50 55%, #3d2b5e 100%)",
      }}
    >
      {/* PARALLAX STAR LAYER */}
      <motion.div style={{ y: starsY }} className="absolute inset-0">
        <StarField count={48} />
      </motion.div>

      {/* Top-right release date */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="absolute top-24 md:top-28 right-6 md:right-10 z-20 text-right"
      >
        <p className="text-[10px] tracking-[0.4em] text-white/50 uppercase">
          Est.
        </p>
        <p className="text-[14px] tracking-[0.3em] text-white/80 font-semibold mt-1">
          2020
        </p>
      </motion.div>

      {/* TOP CAST ROW */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.7 }}
        className="absolute top-28 md:top-32 left-0 right-0 z-20 px-6 md:px-16"
      >
        <div className="flex items-center justify-between gap-2 max-w-[1500px] mx-auto">
          <span className="hidden md:block w-12 h-px bg-white/30" />
          {CAST.map((c, i) => (
            <motion.span
              key={c}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + i * 0.12, duration: 0.5 }}
              className="text-[10px] md:text-[12px] font-bold tracking-[0.2em] text-white/85 uppercase whitespace-nowrap"
            >
              {c}
              {i < CAST.length - 1 && (
                <span className="hidden md:inline mx-3 md:mx-6 text-white/30">
                  ·
                </span>
              )}
            </motion.span>
          ))}
          <span className="hidden md:block w-12 h-px bg-white/30" />
        </div>
      </motion.div>

      {/* GIANT BACKGROUND WATERMARK — "THE GARIMA EFFECT" */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-[5]"
        style={{ y: watermarkY, scale: watermarkScale }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
          className="giant-watermark text-center"
          style={{ fontSize: "clamp(72px, 14vw, 220px)" }}
        >
          THE GARIMA
        </motion.h2>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 1.2, ease: "easeOut" }}
          className="giant-watermark text-center"
          style={{ fontSize: "clamp(72px, 14vw, 220px)", marginTop: "-0.05em" }}
        >
          EFFECT
        </motion.h2>
      </motion.div>

      {/* GARIMA PHOTO with parallax */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 1.0, ease: "easeOut" }}
        className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-center md:justify-end pr-0 md:pr-[8%] pointer-events-none"
        style={{ height: "88%" }}
      >
        <motion.div
          className="relative h-full w-full md:w-[55%] max-w-[720px]"
          style={{
            filter: "drop-shadow(0 30px 80px rgba(0,0,0,0.55))",
            y: photoY,
            opacity: photoOpacity,
          }}
        >
          <Image
            src="/garima.png"
            alt="Garima Rana"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 720px"
            style={{ objectFit: "contain", objectPosition: "bottom center" }}
          />
        </motion.div>
      </motion.div>

      {/* BOTTOM-LEFT STORY BLOCK */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-12 md:bottom-16 left-6 md:left-10 z-20 max-w-xs"
      >
        <p className="section-eyebrow mb-3">Garima Effect Story</p>
        <p className="italic text-white/75 leading-relaxed text-[13px] md:text-[14px]">
          From concept to content — Garima transforms brands into magnetic
          stories that sell.
        </p>
      </motion.div>

      {/* SCROLL HINT */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
      >
        <p className="text-[10px] tracking-[0.4em] text-white/55 uppercase">
          Scroll
        </p>
        <motion.span
          animate={{ y: [0, 6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="text-white/70"
        >
          ↓
        </motion.span>
      </motion.div>
    </section>
  );
}
