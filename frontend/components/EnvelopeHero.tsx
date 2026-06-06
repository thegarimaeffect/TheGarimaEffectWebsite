"use client";

/**
 * EnvelopeHero — elegant envelope-reveal hero (autoplays on load).
 *
 * Sequence:
 *   1. THE CUT   — a cream envelope tied with a rose ribbon + bow.
 *                  The ribbon is sliced; the two halves fall away.
 *   2. THE OPEN  — the top flap lifts up and back (3D rotateX).
 *   3. THE REVEAL— "The Garima Effect" rises out in the site's cursive
 *                  script (no ugly 3D ball — just the wordmark).
 *   4. THE ORBIT — the 4 service labels emerge and revolve around the
 *                  wordmark at a CONSTANT distance, in the site's pill
 *                  style, with a gentle elliptical (3D-ish) tilt.
 *
 * Built with SVG + CSS 3D + framer-motion (reliable + crisp at all sizes),
 * not raw WebGL primitives. Colours come from the site CSS tokens.
 */

import { motion, useAnimationFrame } from "framer-motion";
import { useRef } from "react";

const LABELS = ["INSTAGRAM GROWTH", "BRAND BUILDING", "SALES FUNNELS", "VIDEO SCRIPTS"];

// Orbit geometry — radii are computed responsively each frame
const ORBIT_RX_MAX = 300; // max horizontal radius (desktop)
const ORBIT_RY_RATIO = 0.4; // vertical radius = rx * ratio → elliptical tilt
const ORBIT_SPEED = 0.2; // radians/sec

export default function EnvelopeHero() {
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const startRef = useRef<number | null>(null);

  // Continuous orbit — update label transforms directly each frame (no React re-render)
  useAnimationFrame((t) => {
    if (startRef.current === null) startRef.current = t;
    const elapsed = (t - startRef.current) / 1000;
    const angleBase = elapsed * ORBIT_SPEED;

    // Responsive radius: never wider than ~40% of viewport
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const rx = Math.min(ORBIT_RX_MAX, vw * 0.4);
    const ry = rx * ORBIT_RY_RATIO;

    labelRefs.current.forEach((el, i) => {
      if (!el) return;
      const a = angleBase + (i / LABELS.length) * Math.PI * 2;
      const x = Math.cos(a) * rx;
      const y = Math.sin(a) * ry;
      // depth cue: items at the "front" (y>0) are larger & brighter
      const depth = (y / ry + 1) / 2; // 0 (back) → 1 (front)
      const scale = 0.82 + depth * 0.32;
      const op = 0.55 + depth * 0.45;
      el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
      el.style.opacity = String(op);
      el.style.zIndex = String(10 + Math.round(depth * 10));
    });
  });

  return (
    <div className="env-hero">
      <div className="env-stage">
        {/* ─────────── ENVELOPE (SVG) ─────────── */}
        <motion.div
          className="env-wrap"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <svg viewBox="0 0 600 440" className="env-svg" aria-hidden>
            <defs>
              <linearGradient id="envBody" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fffdfa" />
                <stop offset="100%" stopColor="#f6ecdf" />
              </linearGradient>
              <linearGradient id="envFlap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbf3e8" />
                <stop offset="100%" stopColor="#f0e2d0" />
              </linearGradient>
              <linearGradient id="envInner" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#efe2d2" />
                <stop offset="100%" stopColor="#f8f0e6" />
              </linearGradient>
              <filter id="envShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="18" stdDeviation="26" floodColor="#9b7fc7" floodOpacity="0.28" />
              </filter>
            </defs>

            {/* Envelope body */}
            <rect
              x="60" y="150" width="480" height="250" rx="14"
              fill="url(#envBody)" filter="url(#envShadow)"
              stroke="rgba(232,84,122,0.18)" strokeWidth="1.5"
            />
            {/* Inner (revealed) pocket */}
            <path d="M60 150 L300 330 L540 150 Z" fill="url(#envInner)" opacity="0.9" />
            {/* Front pocket side folds */}
            <path d="M60 400 L60 150 L300 330 Z" fill="url(#envBody)" opacity="0.96" />
            <path d="M540 400 L540 150 L300 330 Z" fill="url(#envBody)" opacity="0.96" />
            <path d="M60 400 L540 400 L300 250 Z" fill="url(#envFlap)" />
            {/* "Trusted by top brands" line */}
            <text x="300" y="378" textAnchor="middle"
              className="env-foot">Trusted by Top Brands</text>
          </svg>

          {/* ─────────── TOP FLAP (opens) ─────────── */}
          <motion.div
            className="env-flap"
            initial={{ rotateX: 0 }}
            animate={{ rotateX: 178 }}
            transition={{ delay: 1.4, duration: 0.9, ease: [0.6, 0, 0.2, 1] }}
          >
            <svg viewBox="0 0 600 200" aria-hidden>
              <path d="M60 0 L540 0 L300 188 Z" fill="url(#envFlap)"
                stroke="rgba(232,84,122,0.18)" strokeWidth="1.5" />
            </svg>
          </motion.div>

          {/* ─────────── RIBBON + BOW (gets cut) ─────────── */}
          {/* Left half */}
          <motion.div
            className="env-ribbon env-ribbon-left"
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={{ x: -120, y: 260, rotate: -40, opacity: 0 }}
            transition={{ delay: 0.7, duration: 0.9, ease: "easeIn" }}
          />
          {/* Right half */}
          <motion.div
            className="env-ribbon env-ribbon-right"
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={{ x: 120, y: 260, rotate: 40, opacity: 0 }}
            transition={{ delay: 0.7, duration: 0.9, ease: "easeIn" }}
          />
          {/* Bow knot — pops then drops with the cut */}
          <motion.div
            className="env-bow"
            initial={{ scale: 1, opacity: 1, y: 0 }}
            animate={{ scale: 0.7, opacity: 0, y: 240 }}
            transition={{ delay: 0.7, duration: 0.8, ease: "easeIn" }}
          >
            ❦
          </motion.div>

          {/* Cut flash line */}
          <motion.div
            className="env-cut-flash"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1, 1], opacity: [0, 1, 0] }}
            transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
          />
        </motion.div>

        {/* ─────────── REVEAL: wordmark + orbit ─────────── */}
        <div className="env-reveal">
          {/* Soft glow halo behind the wordmark */}
          <motion.div
            className="env-halo"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.0, duration: 0.9 }}
          />

          {/* The Garima Effect — cursive, rises out of the envelope */}
          <motion.div
            className="env-title"
            initial={{ opacity: 0, y: 80, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 2.0, duration: 1.0, ease: [0.34, 1.56, 0.64, 1] }}
          >
            The Garima<br />Effect
          </motion.div>

          {/* 4 orbiting service labels (constant distance) */}
          {LABELS.map((label, i) => (
            <motion.div
              key={label}
              ref={(el) => { labelRefs.current[i] = el; }}
              className="env-orbit-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.6 + i * 0.12, duration: 0.5 }}
            >
              {label}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
