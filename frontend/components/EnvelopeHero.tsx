"use client";

/**
 * EnvelopeHero — full-bleed cinematic hero video.
 *
 * Plays /public/hero-loop.mp4 at 100% width, responsive to screen size,
 * and feathered at every edge so it dissolves into the page gradient
 * instead of reading as a placed <video> rectangle.
 *
 *  • width:100% + object-fit:cover  → fills the hero on any screen
 *  • radial + linear edge mask      → no hard borders, bleeds into bg
 *  • scroll-driven parallax/scale   → feels native, not embedded
 *  • autoplay/loop/muted/playsInline → silent autoplay (iOS-safe)
 */

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function EnvelopeHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // subtle parallax so it feels part of the page, not a pasted clip
  const y = useTransform(scrollYProgress, [0, 1], [30, -70]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.02, 1.06, 1.02]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.85, 1], [0, 1, 1, 0.6]);

  return (
    <div ref={ref} className="hv-wrap">
      {/* brand-colour glow behind the video */}
      <motion.div
        aria-hidden
        className="hv-halo"
        animate={{ opacity: [0.4, 0.75, 0.4], scale: [0.96, 1.06, 0.96] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.video
        style={{ y, scale, opacity }}
        className="hv-video"
        src="/hero-loop.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />

      {/* edge-blend overlay (fuses top/bottom/sides into the page gradient) */}
      <div className="hv-blend" aria-hidden />
    </div>
  );
}
