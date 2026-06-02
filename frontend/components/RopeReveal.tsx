"use client";

/**
 * RopeReveal — three-act cinematic motion graphic, infinite loop.
 *
 *  ACT 1  CHAOS         Dense multi-coloured neon ropes stream in from
 *                       every edge of the frame toward a chronometer wheel.
 *
 *  ACT 2  WHEEL         The wheel rotates and "resolves" the tangle.
 *                       A single bright rope emerges from the bottom of
 *                       the wheel.
 *
 *  ACT 3  WRITING       That single rope's glowing pen-tip traces the
 *                       cursive wordmark "The Garima Effect" below the
 *                       wheel — the text neon-lights up as the tip
 *                       passes over it.
 *
 *  Loop length: ~10s. All colours from brand tokens. Strong neon glow.
 *  Positive-Z parallax. Wheel ABOVE, text BELOW, rope CONNECTS them.
 */

import { motion } from "framer-motion";
import { useMemo } from "react";

// Brand palette
const ROSE = "#e8547a";
const ROSE_LIGHT = "#ff8aab";
const LAV = "#b89ce0";
const VIOLET = "#9b7fc7";
const GOLD = "#f5c842";
const DEEP = "#3d1a4d";

// ── Layout (viewBox 1000 × 1000) ─────────────────────────────────────────
const VB = 1000;

// Wheel placed in upper-third of the frame
const WCX = 500;
const WCY = 320;
const R_OUTER = 180;
const R_TICK = 162;
const R_MIDDLE = 130;
const R_INNER = 100;
const R_HUB = 65;

// Text baseline below wheel
const TX_LINE1_Y = 640;
const TX_LINE2_Y = 760;

// The "writing rope" — single curved path from wheel bottom to text start
const RIBBON_D = `M ${WCX} ${WCY + R_OUTER}
                  C ${WCX - 80} ${WCY + R_OUTER + 100},
                    ${WCX - 200} ${WCY + R_OUTER + 180},
                    ${WCX - 240} ${TX_LINE1_Y - 30}`;

// Loop master duration
const LOOP = 10;            // seconds per full cycle

// ── Chaotic input ropes ──────────────────────────────────────────────────
const INPUT_PALETTE = [ROSE, LAV, VIOLET, ROSE_LIGHT, GOLD, "#d68fe0", "#c47acf"];

type Stream = {
  id: number; color: string; z: number; width: number;
  duration: number; delay: number; d: string;
};

function mkInput(i: number): Stream {
  const r = (s: number) => (Math.sin((i + 1) * s * 12.9898) + 1) * 0.5;
  const entryAngle = r(1) * Math.PI * 2;
  const entryRadius = 700 + r(2) * 400;
  const ex = WCX + Math.cos(entryAngle) * entryRadius;
  const ey = WCY + Math.sin(entryAngle) * entryRadius;
  const wheelAngle = entryAngle + (r(3) - 0.5) * 1.0;
  const wx = WCX + Math.cos(wheelAngle) * R_OUTER;
  const wy = WCY + Math.sin(wheelAngle) * R_OUTER;
  const bend = 260 + r(4) * 480;
  const c1A = entryAngle + (r(5) - 0.5) * 3.0;
  const c1x = ex + Math.cos(c1A) * -bend * 0.55;
  const c1y = ey + Math.sin(c1A) * -bend * 0.55;
  const c2A = wheelAngle + (r(6) - 0.5) * 2.2;
  const c2x = wx + Math.cos(c2A) * bend * 0.65;
  const c2y = wy + Math.sin(c2A) * bend * 0.65;
  return {
    id: i,
    color: INPUT_PALETTE[i % INPUT_PALETTE.length],
    z: 25 + (i % 9) * 22,
    width: 1.8 + (i % 5) * 0.6,
    duration: 3.0 + r(7) * 2.4,
    delay: r(8) * 6,
    d: `M ${ex} ${ey} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${wx} ${wy}`,
  };
}

// ─────────────────────────────────────────────────────────────────────────

export default function RopeReveal() {
  const inputs = useMemo<Stream[]>(
    () => Array.from({ length: 44 }, (_, i) => mkInput(i)),
    []
  );

  return (
    <div
      className="rope-stage relative w-full"
      style={{
        perspective: 1800,
        perspectiveOrigin: "50% 38%",
        minHeight: 640,
      }}
    >
      <motion.div
        aria-hidden
        className="rope-glow"
        animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.92, 1.08, 0.92] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.svg
        viewBox={`0 0 ${VB} ${VB}`}
        className="rope-svg"
        style={{
          width: "100%",
          maxWidth: 920,
          margin: "0 auto",
          display: "block",
          transformStyle: "preserve-3d",
          willChange: "transform",
          filter:
            "drop-shadow(0 30px 80px rgba(232,84,122,0.32)) drop-shadow(0 10px 30px rgba(184,156,224,0.22))",
        }}
        animate={{ rotateX: [-2, 4, -2], rotateY: [4, -2, 4] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor={ROSE_LIGHT} stopOpacity="0.9" />
            <stop offset="40%" stopColor={ROSE}       stopOpacity="0.55" />
            <stop offset="80%" stopColor={LAV}        stopOpacity="0.2" />
            <stop offset="100%" stopColor={DEEP}      stopOpacity="0" />
          </radialGradient>

          <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"  stopColor={ROSE} />
            <stop offset="60%" stopColor={ROSE_LIGHT} />
            <stop offset="100%" stopColor={GOLD} />
          </linearGradient>

          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b1" />
            <feGaussianBlur stdDeviation="8" result="b2" />
            <feMerge>
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="textNeon" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="b1" />
            <feGaussianBlur stdDeviation="5" result="b2" />
            <feGaussianBlur stdDeviation="10" result="b3" />
            <feMerge>
              <feMergeNode in="b3" />
              <feMergeNode in="b2" />
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ═════ ACT 1: CHAOTIC INPUT ROPES (always flowing) ═════ */}
        {inputs.map((s) => (
          <g key={s.id} style={{ transform: `translateZ(${s.z}px)` }}>
            <motion.path
              d={s.d}
              stroke={s.color}
              strokeWidth={s.width}
              strokeLinecap="round"
              fill="none"
              filter="url(#softGlow)"
              initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 0.4, 0.4, 0],
                pathOffset: [0, 0, 0.65, 0.9],
                opacity:    [0, 0.85, 0.85, 0],
              }}
              transition={{
                duration: s.duration,
                delay: s.delay,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.35, 0.78, 1],
              }}
            />
          </g>
        ))}

        {/* ═════ ACT 2: CHRONOMETER WHEEL ═════ */}

        {/* Wheel hub glow */}
        <motion.circle
          cx={WCX} cy={WCY} r={R_OUTER * 1.4}
          fill="url(#hubGlow)"
          animate={{ opacity: [0.6, 0.95, 0.6], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: `${WCX}px ${WCY}px` }}
        />

        {/* Outer ring */}
        <circle
          cx={WCX} cy={WCY} r={R_OUTER}
          fill="none"
          stroke={ROSE} strokeOpacity={0.55} strokeWidth={1.3}
          filter="url(#softGlow)"
        />

        {/* 60 chronometer tick marks */}
        <g filter="url(#softGlow)">
          {Array.from({ length: 60 }).map((_, i) => {
            const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
            const isHour = i % 5 === 0;
            const len = isHour ? 18 : 8;
            const w = isHour ? 2.2 : 0.9;
            const op = isHour ? 0.9 : 0.45;
            const x1 = WCX + Math.cos(a) * (R_TICK - len);
            const y1 = WCY + Math.sin(a) * (R_TICK - len);
            const x2 = WCX + Math.cos(a) * R_TICK;
            const y2 = WCY + Math.sin(a) * R_TICK;
            return (
              <line key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={ROSE} strokeOpacity={op}
                strokeWidth={w} strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* Middle ring rotates clockwise */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${WCX}px ${WCY}px` }}
        >
          <circle
            cx={WCX} cy={WCY} r={R_MIDDLE}
            fill="none"
            stroke={LAV} strokeOpacity={0.65} strokeWidth={1.6}
            strokeDasharray="4 10"
            filter="url(#softGlow)"
          />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <circle key={i}
                cx={WCX + Math.cos(a) * R_MIDDLE}
                cy={WCY + Math.sin(a) * R_MIDDLE}
                r={2.4} fill={LAV} fillOpacity={0.85}
              />
            );
          })}
        </motion.g>

        {/* Inner ring counter-rotates with 8 spokes */}
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${WCX}px ${WCY}px` }}
        >
          <circle
            cx={WCX} cy={WCY} r={R_INNER}
            fill="none"
            stroke={ROSE} strokeOpacity={0.6} strokeWidth={1.2}
            strokeDasharray="1 8"
          />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <line key={i}
                x1={WCX + Math.cos(a) * (R_INNER - 22)}
                y1={WCY + Math.sin(a) * (R_INNER - 22)}
                x2={WCX + Math.cos(a) * R_INNER}
                y2={WCY + Math.sin(a) * R_INNER}
                stroke={ROSE} strokeOpacity={0.55}
                strokeWidth={1.5} strokeLinecap="round"
              />
            );
          })}
        </motion.g>

        {/* Fast hub ring */}
        <motion.circle
          cx={WCX} cy={WCY} r={R_HUB}
          fill="none"
          stroke={ROSE} strokeOpacity={0.85} strokeWidth={1.3}
          strokeDasharray="3 5"
          filter="url(#softGlow)"
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${WCX}px ${WCY}px` }}
        />

        {/* Pulsing centre dot */}
        <motion.circle
          cx={WCX} cy={WCY} r={6}
          fill={ROSE_LIGHT}
          filter="url(#neonGlow)"
          animate={{ scale: [1, 1.5, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: `${WCX}px ${WCY}px` }}
        />

        {/* ═════ ACT 3: THE WRITING ROPE & WORDMARK ═════ */}

        {/* The single rope emerges from the wheel and curves down toward the text */}
        <motion.path
          d={RIBBON_D}
          stroke="url(#ribbonGrad)"
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
          filter="url(#neonGlow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            // Cycle: invisible (chaos act) → grows to text start → holds → fades
            pathLength: [0,   0,   1,    1,    1,    0],
            opacity:    [0,   0,   1,    1,    1,    0],
          }}
          transition={{
            duration: LOOP,
            times:    [0, 0.20, 0.32, 0.55, 0.88, 1],
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Rope tip glow — sits at the end of the rope as it grows */}
        <motion.circle
          r={10}
          fill={GOLD}
          filter="url(#neonGlow)"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0, 1, 1, 1, 0],
            cx: [WCX, WCX, WCX - 240, WCX - 240, WCX - 240, WCX - 240],
            cy: [WCY + R_OUTER, WCY + R_OUTER, TX_LINE1_Y - 30, TX_LINE1_Y - 30, TX_LINE1_Y - 30, TX_LINE1_Y - 30],
          }}
          transition={{
            duration: LOOP,
            times: [0, 0.20, 0.32, 0.55, 0.88, 1],
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Wordmark — drawn by stroke-dashoffset reduction, synced with rope */}
        <g filter="url(#textNeon)">
          <motion.text
            x={WCX} y={TX_LINE1_Y}
            textAnchor="middle"
            fill="transparent"
            stroke={ROSE}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              fontFamily: "var(--font-script), cursive",
              fontSize: 92,
              letterSpacing: "-0.01em",
              strokeDasharray: 2800,
            }}
            initial={{ strokeDashoffset: 2800, opacity: 0 }}
            animate={{
              strokeDashoffset: [2800, 2800, 2800,   0,    0, 2800],
              opacity:          [0,    0,    1,      1,    1,    0],
              fill:             ["transparent","transparent","transparent","transparent",ROSE, "transparent"],
            }}
            transition={{
              duration: LOOP,
              times: [0, 0.28, 0.32, 0.62, 0.85, 1],
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            The Garima
          </motion.text>

          <motion.text
            x={WCX} y={TX_LINE2_Y}
            textAnchor="middle"
            fill="transparent"
            stroke={ROSE}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              fontFamily: "var(--font-script), cursive",
              fontSize: 92,
              letterSpacing: "-0.01em",
              strokeDasharray: 2200,
            }}
            initial={{ strokeDashoffset: 2200, opacity: 0 }}
            animate={{
              strokeDashoffset: [2200, 2200, 2200,   2200,  0,   2200],
              opacity:          [0,    0,    0.5,    1,     1,    0],
              fill:             ["transparent","transparent","transparent","transparent",ROSE, "transparent"],
            }}
            transition={{
              duration: LOOP,
              times: [0, 0.45, 0.50, 0.70, 0.88, 1],
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Effect
          </motion.text>
        </g>

        {/* Sparkles pop after text completes */}
        {[
          { x: WCX - 200, y: TX_LINE1_Y - 30, d: 0.0 },
          { x: WCX + 200, y: TX_LINE1_Y - 10, d: 0.2 },
          { x: WCX - 160, y: TX_LINE2_Y + 20, d: 0.4 },
          { x: WCX + 160, y: TX_LINE2_Y + 20, d: 0.6 },
        ].map((s, i) => (
          <motion.text
            key={i}
            x={s.x} y={s.y}
            fill={GOLD}
            fontSize={26}
            textAnchor="middle"
            filter="url(#neonGlow)"
            animate={{
              opacity: [0, 0, 0, 1, 0.4, 1, 0],
              scale:   [0.3, 0.3, 0.3, 1.4, 0.9, 1.2, 0.3],
            }}
            transition={{
              duration: LOOP,
              times: [0, 0.6, 0.7, 0.78 + s.d * 0.04, 0.85, 0.92, 1],
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ✦
          </motion.text>
        ))}
      </motion.svg>

      <DepthParticles />
    </div>
  );
}

function DepthParticles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        i,
        z: 60 + (i % 8) * 38,
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
