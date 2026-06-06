"use client";

/**
 * EnvelopeHero — one unified stage, slow & legible sequence.
 *
 *   0.0–1.4s  CLOSED: cream envelope tied with a thick RED ribbon + bow.
 *             (held long enough to actually read it)
 *   1.4s      CUT: a bright blade-flash sweeps across the ribbon.
 *   1.6–2.6s  ribbon arms snap apart and fall away; bow drops.
 *   2.6–3.5s  flap flips open.
 *   3.4–4.4s  "The Garima Effect" rises UP out of the mouth (above envelope).
 *   4.2s+     the 4 service labels revolve around it at a constant distance.
 *
 * Envelope lives in the LOWER half; wordmark + orbit live ABOVE it, both
 * sharing centre x = 450 so nothing drifts.
 */

import { motion, useAnimationFrame } from "framer-motion";
import { useRef } from "react";

const LABELS = ["INSTAGRAM GROWTH", "BRAND BUILDING", "SALES FUNNELS", "VIDEO SCRIPTS"];

// viewBox
const VB_W = 900;
const VB_H = 640;
const CX = VB_W / 2;            // 450
const MOUTH_Y = 300;           // envelope top edge (hinge)
const SEAM_Y = 470;            // front seams meet here
const BODY_L = 210, BODY_R = 690, BODY_B = 600;
const RIBBON_W = 26;           // thick & visible

// Orbit
const ORBIT_RX_MAX = 300;
const ORBIT_RY_RATIO = 0.34;
const ORBIT_SPEED = 0.22;

export default function EnvelopeHero() {
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const startRef = useRef<number | null>(null);

  useAnimationFrame((t) => {
    if (startRef.current === null) startRef.current = t;
    const a0 = ((t - startRef.current) / 1000) * ORBIT_SPEED;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const rx = Math.min(ORBIT_RX_MAX, vw * 0.34);
    const ry = rx * ORBIT_RY_RATIO;

    labelRefs.current.forEach((el, i) => {
      if (!el) return;
      const a = a0 + (i / LABELS.length) * Math.PI * 2;
      const x = Math.cos(a) * rx;
      const y = Math.sin(a) * ry;
      const depth = (y / ry + 1) / 2;
      const scale = 0.82 + depth * 0.3;
      el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
      el.style.opacity = String(0.55 + depth * 0.45);
      el.style.zIndex = String(20 + Math.round(depth * 10));
    });
  });

  return (
    <div className="env-hero">
      <div className="env-stage">
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
              <stop offset="0%" stopColor="#fffdfa" /><stop offset="100%" stopColor="#f4e9da" />
            </linearGradient>
            <linearGradient id="ev-pocket" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f7eddf" /><stop offset="100%" stopColor="#ecdcc8" />
            </linearGradient>
            <linearGradient id="ev-inner" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e7d6c2" /><stop offset="100%" stopColor="#f3e7d7" />
            </linearGradient>
            <linearGradient id="ev-flap" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbf3e8" /><stop offset="100%" stopColor="#ead9c4" />
            </linearGradient>
            <linearGradient id="ev-ribbon" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff6b84" /><stop offset="50%" stopColor="#e8344f" /><stop offset="100%" stopColor="#c4304f" />
            </linearGradient>
            <filter id="ev-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="22" stdDeviation="30" floodColor="#9b7fc7" floodOpacity="0.30" />
            </filter>
            <filter id="rb-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#c4304f" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Body */}
          <rect x={BODY_L} y={MOUTH_Y} width={BODY_R - BODY_L} height={BODY_B - MOUTH_Y}
            rx="16" fill="url(#ev-body)" filter="url(#ev-shadow)"
            stroke="rgba(232,84,122,0.16)" strokeWidth="1.5" />
          {/* Inner */}
          <path d={`M${BODY_L} ${MOUTH_Y} L${CX} ${SEAM_Y} L${BODY_R} ${MOUTH_Y} Z`} fill="url(#ev-inner)" />
          {/* Front pocket */}
          <path d={`M${BODY_L} ${MOUTH_Y} L${CX} ${SEAM_Y} L${BODY_L} ${BODY_B} Z`} fill="url(#ev-body)" />
          <path d={`M${BODY_R} ${MOUTH_Y} L${CX} ${SEAM_Y} L${BODY_R} ${BODY_B} Z`} fill="url(#ev-body)" />
          <path d={`M${BODY_L} ${BODY_B} L${BODY_R} ${BODY_B} L${CX} ${SEAM_Y} Z`} fill="url(#ev-pocket)" />
          <path d={`M${BODY_L} ${MOUTH_Y} L${CX} ${SEAM_Y} L${BODY_R} ${MOUTH_Y}`} fill="none" stroke="rgba(232,84,122,0.12)" strokeWidth="1.5" />
          <path d={`M${BODY_L} ${BODY_B} L${CX} ${SEAM_Y} L${BODY_R} ${BODY_B}`} fill="none" stroke="rgba(232,84,122,0.12)" strokeWidth="1.5" />
          <text x={CX} y={BODY_B - 34} textAnchor="middle" className="env-foot">Trusted by Top Brands</text>

          {/* ── FLAP (flips open at 2.6s) ── */}
          <motion.g
            style={{ transformBox: "view-box", transformOrigin: `${CX}px ${MOUTH_Y}px` } as any}
            initial={{ scaleY: 1 }}
            animate={{ scaleY: -1 }}
            transition={{ delay: 2.6, duration: 0.9, ease: [0.6, 0, 0.2, 1] }}
          >
            <path d={`M${BODY_L} ${MOUTH_Y} L${BODY_R} ${MOUTH_Y} L${CX} ${MOUTH_Y + 190} Z`}
              fill="url(#ev-flap)" stroke="rgba(232,84,122,0.16)" strokeWidth="1.5" />
          </motion.g>

          {/* ── RED RIBBON (thick) — held 0–1.4s, then arms fly off at 1.6s ── */}
          <g filter="url(#rb-shadow)">
            {/* vertical top arm */}
            <motion.rect x={CX - RIBBON_W / 2} y={130} width={RIBBON_W} height={SEAM_Y - 130}
              fill="url(#ev-ribbon)" rx={RIBBON_W / 2}
              initial={{ y: 0, opacity: 1 }} animate={{ y: -200, opacity: 0 }}
              transition={{ delay: 1.6, duration: 1.0, ease: "easeIn" }} />
            {/* vertical bottom arm */}
            <motion.rect x={CX - RIBBON_W / 2} y={SEAM_Y} width={RIBBON_W} height={BODY_B + 30 - SEAM_Y}
              fill="url(#ev-ribbon)" rx={RIBBON_W / 2}
              initial={{ y: 0, opacity: 1 }} animate={{ y: 220, opacity: 0 }}
              transition={{ delay: 1.6, duration: 1.0, ease: "easeIn" }} />
            {/* horizontal left arm */}
            <motion.rect x={BODY_L - 40} y={SEAM_Y - RIBBON_W / 2} width={CX - (BODY_L - 40)} height={RIBBON_W}
              fill="url(#ev-ribbon)" rx={RIBBON_W / 2}
              initial={{ x: 0, opacity: 1 }} animate={{ x: -260, opacity: 0 }}
              transition={{ delay: 1.6, duration: 1.0, ease: "easeIn" }} />
            {/* horizontal right arm */}
            <motion.rect x={CX} y={SEAM_Y - RIBBON_W / 2} width={(BODY_R + 40) - CX} height={RIBBON_W}
              fill="url(#ev-ribbon)" rx={RIBBON_W / 2}
              initial={{ x: 0, opacity: 1 }} animate={{ x: 260, opacity: 0 }}
              transition={{ delay: 1.6, duration: 1.0, ease: "easeIn" }} />

            {/* BOW — two loops + knot, centred on the cross */}
            <motion.g
              style={{ transformBox: "view-box", transformOrigin: `${CX}px ${SEAM_Y}px` } as any}
              initial={{ opacity: 1, scale: 1, y: 0 }}
              animate={{ opacity: 0, scale: 0.4, y: 220 }}
              transition={{ delay: 1.6, duration: 0.9, ease: "easeIn" }}
            >
              <ellipse cx={CX - 34} cy={SEAM_Y} rx={30} ry={20} fill="url(#ev-ribbon)" transform={`rotate(-22 ${CX - 34} ${SEAM_Y})`} />
              <ellipse cx={CX + 34} cy={SEAM_Y} rx={30} ry={20} fill="url(#ev-ribbon)" transform={`rotate(22 ${CX + 34} ${SEAM_Y})`} />
              <path d={`M${CX} ${SEAM_Y} L${CX - 22} ${SEAM_Y + 54} L${CX - 6} ${SEAM_Y + 50} Z`} fill="url(#ev-ribbon)" />
              <path d={`M${CX} ${SEAM_Y} L${CX + 22} ${SEAM_Y + 54} L${CX + 6} ${SEAM_Y + 50} Z`} fill="url(#ev-ribbon)" />
              <circle cx={CX} cy={SEAM_Y} r={15} fill="#e8344f" />
            </motion.g>
          </g>

          {/* CUT FLASH — sweeps across the ribbon cross at 1.4s */}
          <motion.rect
            x={BODY_L - 60} y={SEAM_Y - 4} width={(BODY_R + 60) - (BODY_L - 60)} height={8} rx={4}
            fill="#ffffff"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1, 1], opacity: [0, 1, 0] }}
            transition={{ delay: 1.35, duration: 0.55, ease: "easeOut" }}
            style={{ transformBox: "view-box", transformOrigin: `${BODY_L}px ${SEAM_Y}px`, filter: "drop-shadow(0 0 14px #fff)" } as any}
          />
        </motion.svg>

        {/* ════ REVEAL — ABOVE the envelope, centred on x=450 ════ */}
        <div className="env-reveal">
          <motion.div className="env-halo"
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 3.4, duration: 0.9 }} />
          <motion.div className="env-title"
            initial={{ opacity: 0, y: 220, scale: 0.55 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 3.4, duration: 1.0, ease: [0.34, 1.4, 0.64, 1] }}>
            The Garima<br />Effect
          </motion.div>
          {LABELS.map((label, i) => (
            <motion.div key={label}
              ref={(el) => { labelRefs.current[i] = el; }}
              className="env-orbit-label"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 4.2 + i * 0.12, duration: 0.5 }}>
              {label}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
