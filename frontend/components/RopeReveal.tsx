"use client";

/**
 * RopeReveal — Hero centerpiece.
 *
 * Plays the pre-rendered cinematic video (/public/hero-loop.mp4) but
 * wraps it so it feels like a native part of the page, not a foreign
 * <video> rectangle dropped in.
 *
 *  • Feathered radial mask    → no hard edges, video bleeds into bg
 *  • Brand-colour halo glow   → matches rose/lavender gradient
 *  • Scroll-driven parallax   → moves slower than scroll = depth
 *  • Subtle 3D wobble + scale → breathes even when stationary
 *  • Depth particles (Z-axis) → continuity with rest of site
 *  • Soft inner vignette ring → frames without enclosing
 *
 * Browser hardening:
 *  • autoplay + muted + playsInline (iOS Safari requirement)
 *  • preload metadata + lazy paint
 *  • Reduced-motion respected via media query
 */

import { motion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef } from "react";

const ROSE = "#e8547a";
const LAV = "#b89ce0";
const VIOLET = "#9b7fc7";
const GOLD = "#f5c842";

export default function RopeReveal() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // ── Scroll-driven motion ──
  const y       = useTransform(scrollYProgress, [0, 1],          [40, -90]);
  const scale   = useTransform(scrollYProgress, [0, 0.5, 1],     [0.94, 1.02, 0.98]);
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.85, 1], [0, 1, 1, 0.55]);
  const tiltX   = useTransform(scrollYProgress, [0, 1],          [-4, 4]);

  return (
    <div
      ref={ref}
      className="rope-stage relative w-full"
      style={{
        perspective: 1800,
        perspectiveOrigin: "50% 45%",
        minHeight: 620,
      }}
    >
      {/* ── Big diffuse halo glow ── */}
      <motion.div
        aria-hidden
        className="video-halo"
        animate={{
          opacity: [0.45, 0.85, 0.45],
          scale:   [0.95, 1.08, 0.95],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── The video itself ── */}
      <motion.div
        className="video-wrap"
        style={{
          y,
          scale,
          opacity,
          rotateX: tiltX,
          transformStyle: "preserve-3d",
          willChange: "transform, opacity",
        }}
        // Independent breath layer on top of scroll-driven scale
        animate={{ filter: ["brightness(1.0) saturate(1.05)", "brightness(1.05) saturate(1.1)", "brightness(1.0) saturate(1.05)"] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <video
          src="/hero-loop.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/garima.png"
          className="video-el"
        />

        {/* Inner vignette ring — frames the video without enclosing it */}
        <div className="video-ring" aria-hidden />

        {/* Soft inner gradient overlay to blend into page bg */}
        <div className="video-blend" aria-hidden />
      </motion.div>

      {/* Subtle 3D depth particles in front of the video */}
      <DepthParticles />
    </div>
  );
}

function DepthParticles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        i,
        z: 70 + (i % 8) * 36,
        x: (i * 37) % 100,
        y: (i * 53) % 100,
        color: [ROSE, LAV, VIOLET, GOLD][i % 4],
        size: 2 + (i % 5),
        dur: 3 + (i % 5),
      })),
    []
  );
  return (
    <div
      aria-hidden
      className="rope-particles"
      style={{ transformStyle: "preserve-3d" }}
    >
      {dots.map((d) => (
        <motion.span
          key={d.i}
          className="rope-particle"
          animate={{
            opacity: [0.15, 0.8, 0.15],
            scale: [0.4, 1.2, 0.4],
            y: [0, -28, 0],
          }}
          transition={{
            duration: d.dur,
            repeat: Infinity,
            delay: (d.i % 5) * 0.3,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: `${d.y}%`,
            left: `${d.x}%`,
            width: d.size,
            height: d.size,
            background: d.color,
            borderRadius: 999,
            boxShadow: `0 0 ${d.size * 5}px ${d.color}`,
            transform: `translateZ(${d.z}px)`,
          }}
        />
      ))}
    </div>
  );
}
