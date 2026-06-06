"use client";

/**
 * EnvelopeHero — one unified stage. Everything (envelope body, flap, ribbon,
 * wordmark, orbit) shares ONE coordinate frame so it all lines up.
 *
 * Reference frame: a 900 × 640 box. The envelope is centred in it; the flap
 * is part of the SAME svg (hinged to the body's top edge); the wordmark and
 * the 4 orbiting labels are HTML, centred on the SAME point the envelope
 * opens at (50% x). Nothing floats off on its own.
 *
 * Sequence:
 *   0.0s  closed cream envelope, red ribbon + bow
 *   0.6s  cut flash sweeps the ribbon
 *   0.7s  ribbon arms fly off, bow drops
 *   1.5s  flap flips open (up, behind the letter)
 *   2.1s  "The Garima Effect" rises out of the mouth (cursive)
 *   2.8s  4 labels appear and revolve around it at a constant distance
 */

import { motion, useAnimationFrame } from "framer-motion";
import { useRef } from "react";

const LABELS = ["INSTAGRAM GROWTH", "BRAND BUILDING", "SALES FUNNELS", "VIDEO SCRIPTS"];

// ── viewBox reference ──
const VB_W = 900;
const VB_H = 640;
const CX = VB_W / 2;          // 450 — horizontal centre (everything aligns here)
const MOUTH_Y = 250;          // envelope top edge (the hinge / mouth line)
const SEAM_Y = 430;           // where the front-pocket seams meet
const BODY_L = 200, BODY_R = 700, BODY_B = 560; // body left/right/bottom
const RIBBON_W = 18;

// Orbit
const ORBIT_RX_MAX = 320;
const ORBIT_RY_RATIO = 0.46;
const ORBIT_SPEED = 0.22;

export default function EnvelopeHero() {
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const startRef = useRef<number | null>(null);

  useAnimationFrame((t) => {
    if (startRef.current === null) startRef.current = t;
    const a0 = ((t - startRef.current) / 1000) * ORBIT_SPEED;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const rx = Math.min(ORBIT_RX_MAX, vw * 0.36);
    const ry = rx * ORBIT_RY_RATIO;

    labelRefs.current.forEach((el, i) => {
      if (!el) return;
      const a = a0 + (i / LABELS.length) * Math.PI * 2;
      const x = Math.cos(a) * rx;
      const y = Math.sin(a) * ry;
      const depth = (y / ry + 1) / 2;            // 0 back → 1 front
      const scale = 0.8 + depth * 0.34;
      el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
      el.style.opacity = String(0.5 + depth * 0.5);
      el.style.zIndex = String(20 + Math.round(depth * 10));
    });
  });

  return (
    <div className="env-hero">
      <div className="env-stage">
        {/* ════════ ONE SVG: body + pocket + flap + ribbon ════════ */}
        <motion.svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="env-svg"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          aria-hidden
        >
          <defs>
            <linearGradient id="ev-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fffdfa" />
              <stop offset="100%" stopColor="#f4e9da" />
            </linearGradient>
            <linearGradient id="ev-pocket" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f7eddf" />
              <stop offset="100%" stopColor="#ecdcc8" />
            </linearGradient>
            <linearGradient id="ev-inner" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e7d6c2" />
              <stop offset="100%" stopColor="#f3e7d7" />
            </linearGradient>
            <linearGradient id="ev-flap" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbf3e8" />
              <stop offset="100%" stopColor="#ead9c4" />
            </linearGradient>
            <linearGradient id="ev-ribbon" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff5b76" />
              <stop offset="100%" stopColor="#c4304f" />
            </linearGradient>
            <filter id="ev-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="22" stdDeviation="30" floodColor="#9b7fc7" floodOpacity="0.30" />
            </filter>
          </defs>

          {/* Body */}
          <rect
            x={BODY_L} y={MOUTH_Y} width={BODY_R - BODY_L} height={BODY_B - MOUTH_Y}
            rx="16" fill="url(#ev-body)" filter="url(#ev-shadow)"
            stroke="rgba(232,84,122,0.16)" strokeWidth="1.5"
          />
          {/* Inner (the open interior the letter rises from) */}
          <path d={`M${BODY_L} ${MOUTH_Y} L${CX} ${SEAM_Y} L${BODY_R} ${MOUTH_Y} Z`} fill="url(#ev-inner)" />
          {/* Front pocket: left / right / bottom triangles, seams meet at centre */}
          <path d={`M${BODY_L} ${MOUTH_Y} L${CX} ${SEAM_Y} L${BODY_L} ${BODY_B} Z`} fill="url(#ev-body)" />
          <path d={`M${BODY_R} ${MOUTH_Y} L${CX} ${SEAM_Y} L${BODY_R} ${BODY_B} Z`} fill="url(#ev-body)" />
          <path d={`M${BODY_L} ${BODY_B} L${BODY_R} ${BODY_B} L${CX} ${SEAM_Y} Z`} fill="url(#ev-pocket)" />
          {/* seam lines */}
          <path d={`M${BODY_L} ${MOUTH_Y} L${CX} ${SEAM_Y} L${BODY_R} ${MOUTH_Y}`} fill="none" stroke="rgba(232,84,122,0.12)" strokeWidth="1.5" />
          <path d={`M${BODY_L} ${BODY_B} L${CX} ${SEAM_Y} L${BODY_R} ${BODY_B}`} fill="none" stroke="rgba(232,84,122,0.12)" strokeWidth="1.5" />

          {/* Footer line */}
          <text x={CX} y={BODY_B - 34} textAnchor="middle" className="env-foot">Trusted by Top Brands</text>

          {/* ── TOP FLAP — hinged at the mouth line, flips open ── */}
          <motion.g
            style={{ transformBox: "view-box", transformOrigin: `${CX}px ${MOUTH_Y}px` } as any}
            initial={{ scaleY: 1 }}
            animate={{ scaleY: -1 }}
            transition={{ delay: 1.5, duration: 0.85, ease: [0.6, 0, 0.2, 1] }}
          >
            <path
              d={`M${BODY_L} ${MOUTH_Y} L${BODY_R} ${MOUTH_Y} L${CX} ${MOUTH_Y + 200} Z`}
              fill="url(#ev-flap)" stroke="rgba(232,84,122,0.16)" strokeWidth="1.5"
            />
          </motion.g>

          {/* ── RIBBON (red) — 4 arms + bow, then cut ── */}
          {/* vertical top arm */}
          <motion.rect
            x={CX - RIBBON_W / 2} y={140} width={RIBBON_W} height={SEAM_Y - 140}
            fill="url(#ev-ribbon)" rx={RIBBON_W / 2}
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -180, opacity: 0 }}
            transition={{ delay: 0.75, duration: 0.8, ease: "easeIn" }}
          />
          {/* vertical bottom arm */}
          <motion.rect
            x={CX - RIBBON_W / 2} y={SEAM_Y} width={RIBBON_W} height={BODY_B + 30 - SEAM_Y}
            fill="url(#ev-ribbon)" rx={RIBBON_W / 2}
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: 200, opacity: 0 }}
            transition={{ delay: 0.75, duration: 0.8, ease: "easeIn" }}
          />
          {/* horizontal left arm */}
          <motion.rect
            x={BODY_L - 30} y={SEAM_Y - RIBBON_W / 2} width={CX - (BODY_L - 30)} height={RIBBON_W}
            fill="url(#ev-ribbon)" rx={RIBBON_W / 2}
            initial={{ x: 0, opacity: 1 }}
            animate={{ x: -220, opacity: 0 }}
            transition={{ delay: 0.75, duration: 0.8, ease: "easeIn" }}
          />
          {/* horizontal right arm */}
          <motion.rect
            x={CX} y={SEAM_Y - RIBBON_W / 2} width={(BODY_R + 30) - CX} height={RIBBON_W}
            fill="url(#ev-ribbon)" rx={RIBBON_W / 2}
            initial={{ x: 0, opacity: 1 }}
            animate={{ x: 220, opacity: 0 }}
            transition={{ delay: 0.75, duration: 0.8, ease: "easeIn" }}
          />
          {/* bow */}
          <motion.text
            x={CX} y={SEAM_Y + 18} textAnchor="middle" fontSize="64" fill="#e8547a"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 0.5, y: SEAM_Y + 180 }}
            transition={{ delay: 0.75, duration: 0.8, ease: "easeIn" }}
            style={{ transformBox: "view-box", transformOrigin: `${CX}px ${SEAM_Y}px` } as any}
          >
            ❦
          </motion.text>
          {/* cut flash */}
          <motion.rect
            x={BODY_L - 40} y={SEAM_Y - 3} width={(BODY_R + 40) - (BODY_L - 40)} height={6} rx={3}
            fill="#ffffff"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1, 1], opacity: [0, 1, 0] }}
            transition={{ delay: 0.55, duration: 0.5, ease: "easeOut" }}
            style={{ transformBox: "view-box", transformOrigin: `${BODY_L}px ${SEAM_Y}px`, filter: "drop-shadow(0 0 12px #fff)" } as any}
          />
        </motion.svg>

        {/* ════════ REVEAL — centred on the envelope mouth (50% x) ════════ */}
        <div className="env-reveal">
          <motion.div
            className="env-halo"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.1, duration: 0.9 }}
          />
          {/* wordmark rises up out of the mouth */}
          <motion.div
            className="env-title"
            initial={{ opacity: 0, y: 150, scale: 0.55 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 2.1, duration: 1.0, ease: [0.34, 1.4, 0.64, 1] }}
          >
            The Garima<br />Effect
          </motion.div>

          {LABELS.map((label, i) => (
            <motion.div
              key={label}
              ref={(el) => { labelRefs.current[i] = el; }}
              className="env-orbit-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.8 + i * 0.12, duration: 0.5 }}
            >
              {label}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
