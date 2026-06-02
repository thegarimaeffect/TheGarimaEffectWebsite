"use client";

/**
 * RopeReveal — cinematic motion-graphic loop for the Hero.
 *
 *  ┌──────────────────────────────────────────────────────────────┐
 *  │  CHAOS IN  →   CHRONOMETER WHEEL   →   ORDER OUT             │
 *  │                                                              │
 *  │  • Dense tangle of multi-coloured neon "ropes" streams in    │
 *  │    from every edge of the frame, like messy yarn flying      │
 *  │    toward a central machine.                                 │
 *  │  • A multi-ring chronometer wheel sits at centre — outer     │
 *  │    tick-marks, inner counter-rotating ring, geometric        │
 *  │    spokes, glowing rose hub.                                 │
 *  │  • As ropes enter the wheel they're "resolved" and emerge    │
 *  │    on the right/bottom side as a parallel, organised flow    │
 *  │    of rose-and-gold strands.                                 │
 *  │  • Inside the wheel, the resolved strands weave the cursive  │
 *  │    neon wordmark "The Garima Effect" — the brand IS the      │
 *  │    output of the chaos becoming order.                       │
 *  │                                                              │
 *  │  All neon glow via SVG filter, all colours from brand        │
 *  │  tokens, full positive-Z parallax, infinite loop.            │
 *  └──────────────────────────────────────────────────────────────┘
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
const CREAM = "#fff4f5";

const VB = 1000;
const CX = VB / 2;
const CY = VB / 2;

// Wheel radii (chronometer rings)
const R_OUTER = 240;
const R_TICK = 220;
const R_MIDDLE = 180;
const R_INNER = 145;
const R_HUB = 100;

// ─────────────────────────────────────────────────────────────────────────
// CHAOTIC INPUT — 50 dense ropes streaming in from all edges
// ─────────────────────────────────────────────────────────────────────────

const INPUT_PALETTE = [ROSE, LAV, VIOLET, ROSE_LIGHT, GOLD, "#d68fe0", "#c47acf"];

type Rope = {
  id: number;
  color: string;
  z: number;
  width: number;
  duration: number;
  delay: number;
  d: string;
};

function mkInputRope(i: number): Rope {
  const r = (s: number) => (Math.sin((i + 1) * s * 12.9898) + 1) * 0.5;
  // Random entry angle from anywhere outside the viewBox
  const entryAngle = r(1) * Math.PI * 2;
  const entryRadius = 720 + r(2) * 380;
  const ex = CX + Math.cos(entryAngle) * entryRadius;
  const ey = CY + Math.sin(entryAngle) * entryRadius;

  // End somewhere on the OUTER tick ring (where rope enters mechanism)
  const wheelAngle = entryAngle + (r(3) - 0.5) * 1.2;
  const wx = CX + Math.cos(wheelAngle) * R_OUTER;
  const wy = CY + Math.sin(wheelAngle) * R_OUTER;

  // Two control points create a wild loop
  const bend = 280 + r(4) * 480;
  const c1A = entryAngle + (r(5) - 0.5) * 3.2;
  const c1x = ex + Math.cos(c1A) * -bend * 0.55;
  const c1y = ey + Math.sin(c1A) * -bend * 0.55;
  const c2A = wheelAngle + (r(6) - 0.5) * 2.4;
  const c2x = wx + Math.cos(c2A) * bend * 0.65;
  const c2y = wy + Math.sin(c2A) * bend * 0.65;

  return {
    id: i,
    color: INPUT_PALETTE[i % INPUT_PALETTE.length],
    z: 25 + (i % 9) * 22,
    width: 1.8 + (i % 5) * 0.6,
    duration: 3.2 + r(7) * 2.6,
    delay: r(8) * 6,
    d: `M ${ex} ${ey} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${wx} ${wy}`,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// SOLVED OUTPUT — parallel rose+gold strands flowing out to the right
// ─────────────────────────────────────────────────────────────────────────

const OUTPUT_PALETTE = [ROSE, GOLD, ROSE_LIGHT];

function mkOutputRope(i: number): Rope {
  const r = (s: number) => (Math.sin((i + 5) * s * 7.123) + 1) * 0.5;

  // Output ropes exit on the RIGHT half of the wheel
  // (a sweep of angles between -45° and 45° from horizontal-right)
  const exitAngle = -Math.PI / 4 + (i / 11) * (Math.PI / 2);
  const sx = CX + Math.cos(exitAngle) * R_OUTER;
  const sy = CY + Math.sin(exitAngle) * R_OUTER;

  // End far to the right, slightly off-screen
  const reach = 540 + r(1) * 100;
  const ex = sx + Math.cos(exitAngle) * reach;
  const ey = sy + Math.sin(exitAngle) * reach + (r(2) - 0.5) * 30;

  // Gentle straightening curve — output is "solved", so subtle bend only
  const cx = (sx + ex) / 2 + Math.cos(exitAngle + Math.PI / 2) * 15;
  const cy = (sy + ey) / 2 + Math.sin(exitAngle + Math.PI / 2) * 15;

  return {
    id: 1000 + i,
    color: OUTPUT_PALETTE[i % OUTPUT_PALETTE.length],
    z: 40 + (i % 5) * 18,
    width: 2.4,
    duration: 2.6 + r(3) * 1.4,
    delay: r(4) * 3,
    d: `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`,
  };
}

const INPUT_COUNT = 50;
const OUTPUT_COUNT = 11;

// ─────────────────────────────────────────────────────────────────────────

export default function RopeReveal() {
  const inputs = useMemo(
    () => Array.from({ length: INPUT_COUNT }, (_, i) => mkInputRope(i)),
    []
  );
  const outputs = useMemo(
    () => Array.from({ length: OUTPUT_COUNT }, (_, i) => mkOutputRope(i)),
    []
  );

  return (
    <div
      className="rope-stage relative w-full"
      style={{
        perspective: 1800,
        perspectiveOrigin: "50% 42%",
        minHeight: 620,
      }}
    >
      {/* Pulsing halo behind everything */}
      <motion.div
        aria-hidden
        className="rope-glow"
        animate={{
          opacity: [0.35, 0.7, 0.35],
          scale: [0.92, 1.08, 0.92],
        }}
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
            "drop-shadow(0 30px 80px rgba(232,84,122,0.32)) drop-shadow(0 10px 30px rgba(184,156,224,0.25))",
        }}
        animate={{ rotateX: [-2, 4, -2], rotateY: [5, -3, 5] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          {/* Wheel core glow */}
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor={ROSE_LIGHT} stopOpacity="0.85" />
            <stop offset="40%" stopColor={ROSE}       stopOpacity="0.50" />
            <stop offset="80%" stopColor={LAV}        stopOpacity="0.18" />
            <stop offset="100%" stopColor={DEEP}      stopOpacity="0" />
          </radialGradient>

          <linearGradient id="ropeStream" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"  stopColor={ROSE} stopOpacity="0" />
            <stop offset="50%" stopColor={ROSE} stopOpacity="1" />
            <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
          </linearGradient>

          {/* HARD neon glow — multiple blur passes */}
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur1" />
            <feGaussianBlur stdDeviation="8" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Subtler glow for fine elements */}
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Extra-strong glow for the wordmark */}
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

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* CHAOTIC INPUT — 50 dense ropes from every direction          */}
        {/* ═════════════════════════════════════════════════════════════ */}
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

        {/* Subtle geometric "rail" lines integrated into the flow */}
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          const r1 = 560;
          const r2 = R_OUTER + 30;
          return (
            <motion.line
              key={`rail-${i}`}
              x1={CX + Math.cos(a) * r1}
              y1={CY + Math.sin(a) * r1}
              x2={CX + Math.cos(a) * r2}
              y2={CY + Math.sin(a) * r2}
              stroke={LAV}
              strokeOpacity={0.18}
              strokeWidth={1}
              strokeDasharray="2 6"
              animate={{ strokeOpacity: [0.08, 0.22, 0.08] }}
              transition={{ duration: 4, delay: i * 0.4, repeat: Infinity }}
            />
          );
        })}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* CHRONOMETER WHEEL MECHANISM                                  */}
        {/* ═════════════════════════════════════════════════════════════ */}

        {/* Hub glow (largest first, in the back) */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={R_OUTER * 1.4}
          fill="url(#hubGlow)"
          animate={{ opacity: [0.6, 0.95, 0.6], scale: [0.93, 1.06, 0.93] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />

        {/* Outermost ring — solid thin */}
        <circle
          cx={CX} cy={CY} r={R_OUTER}
          fill="none"
          stroke={ROSE} strokeOpacity={0.5} strokeWidth={1.2}
          filter="url(#softGlow)"
        />

        {/* 60 tick marks (chronometer dial) */}
        <g filter="url(#softGlow)">
          {Array.from({ length: 60 }).map((_, i) => {
            const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
            const isHour = i % 5 === 0;
            const len = isHour ? 22 : 10;
            const w = isHour ? 2.4 : 1;
            const op = isHour ? 0.85 : 0.45;
            const x1 = CX + Math.cos(a) * (R_TICK - len);
            const y1 = CY + Math.sin(a) * (R_TICK - len);
            const x2 = CX + Math.cos(a) * R_TICK;
            const y2 = CY + Math.sin(a) * R_TICK;
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={ROSE} strokeOpacity={op}
                strokeWidth={w} strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* Middle ring — rotates clockwise */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        >
          <circle
            cx={CX} cy={CY} r={R_MIDDLE}
            fill="none"
            stroke={LAV} strokeOpacity={0.6} strokeWidth={1.6}
            strokeDasharray="4 10"
            filter="url(#softGlow)"
          />
          {/* 12 indices on middle ring */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const x = CX + Math.cos(a) * R_MIDDLE;
            const y = CY + Math.sin(a) * R_MIDDLE;
            return (
              <circle
                key={i} cx={x} cy={y} r={2.5}
                fill={LAV} fillOpacity={0.8}
              />
            );
          })}
        </motion.g>

        {/* Inner ring — counter-rotating, faster */}
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        >
          <circle
            cx={CX} cy={CY} r={R_INNER}
            fill="none"
            stroke={ROSE} strokeOpacity={0.55} strokeWidth={1.2}
            strokeDasharray="1 8"
          />
          {/* Spokes/cross */}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const x1 = CX + Math.cos(a) * (R_INNER - 22);
            const y1 = CY + Math.sin(a) * (R_INNER - 22);
            const x2 = CX + Math.cos(a) * R_INNER;
            const y2 = CY + Math.sin(a) * R_INNER;
            return (
              <line
                key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={ROSE} strokeOpacity={0.5} strokeWidth={1.5}
                strokeLinecap="round"
              />
            );
          })}
        </motion.g>

        {/* Hub ring — small, fast, intense */}
        <motion.circle
          cx={CX} cy={CY} r={R_HUB}
          fill="none"
          stroke={ROSE} strokeOpacity={0.8} strokeWidth={1.4}
          strokeDasharray="3 5"
          filter="url(#softGlow)"
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />

        {/* Centre dot */}
        <motion.circle
          cx={CX} cy={CY} r={6}
          fill={ROSE}
          filter="url(#softGlow)"
          animate={{ scale: [1, 1.5, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SOLVED OUTPUT — parallel rose+gold strands exit right        */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {outputs.map((s) => (
          <g key={s.id} style={{ transform: `translateZ(${s.z}px)` }}>
            <motion.path
              d={s.d}
              stroke={s.color}
              strokeWidth={s.width}
              strokeLinecap="round"
              fill="none"
              filter="url(#neonGlow)"
              initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 0.55, 0.55, 0],
                pathOffset: [0, 0, 0.6, 0.95],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: s.duration,
                delay: s.delay,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.3, 0.75, 1],
              }}
            />
          </g>
        ))}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* WORDMARK — woven inside the wheel                            */}
        {/* ═════════════════════════════════════════════════════════════ */}
        <g filter="url(#textNeon)">
          <motion.text
            x={CX}
            y={CY - 6}
            textAnchor="middle"
            fill={ROSE}
            stroke={ROSE_LIGHT}
            strokeWidth={0.6}
            style={{
              fontFamily: "var(--font-script), cursive",
              fontSize: 78,
              letterSpacing: "-0.01em",
            }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{
              opacity: [0, 1, 0.94, 1],
              scale:   [0.94, 1.02, 1, 1.02],
            }}
            transition={{
              duration: 4,
              delay: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.4, 0.7, 1],
            }}
          >
            The Garima
          </motion.text>
          <motion.text
            x={CX}
            y={CY + 70}
            textAnchor="middle"
            fill={ROSE}
            stroke={ROSE_LIGHT}
            strokeWidth={0.6}
            style={{
              fontFamily: "var(--font-script), cursive",
              fontSize: 78,
              letterSpacing: "-0.01em",
            }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{
              opacity: [0, 1, 0.94, 1],
              scale:   [0.94, 1.02, 1, 1.02],
            }}
            transition={{
              duration: 4,
              delay: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.4, 0.7, 1],
            }}
          >
            Effect
          </motion.text>
        </g>

        {/* Sparkles around the wordmark */}
        {[
          { x: CX - 175, y: CY - 40, d: 0.0 },
          { x: CX + 175, y: CY - 10, d: 0.7 },
          { x: CX - 130, y: CY + 110, d: 1.4 },
          { x: CX + 140, y: CY + 110, d: 2.1 },
          { x: CX - 215, y: CY + 50, d: 2.8 },
          { x: CX + 215, y: CY + 50, d: 3.5 },
        ].map((s, i) => (
          <motion.text
            key={i}
            x={s.x}
            y={s.y}
            fill={GOLD}
            fontSize={22}
            textAnchor="middle"
            filter="url(#softGlow)"
            animate={{
              opacity: [0, 1, 0.4, 1, 0],
              scale: [0.4, 1.3, 0.9, 1.2, 0.4],
            }}
            transition={{
              duration: 3.6,
              delay: 4 + s.d,
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
      Array.from({ length: 32 }, (_, i) => ({
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
