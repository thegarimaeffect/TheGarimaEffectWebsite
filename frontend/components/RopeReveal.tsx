"use client";

/**
 * RopeReveal — cinematic infinite-loop hero animation.
 *
 * Visual story (plays forever, like a looping video):
 *   • A constant stream of chaotic wavy "ropes" flies in from the edges,
 *     curving through 3D space toward a glowing wheel at centre.
 *   • As each rope reaches the wheel it gets "resolved" — its arc
 *     straightens into a clean spoke that tucks into the wheel, then
 *     dissolves.
 *   • The wheel rotates continuously, halo pulsing softly.
 *   • At the centre, "The Garima Effect" is written once at start in the
 *     script font (stroke-draw), then breathes in/out forever.
 *   • All colours from brand tokens. Positive-Z parallax everywhere.
 */

import { motion } from "framer-motion";
import { useMemo } from "react";

// ── Brand palette (sourced from globals.css tokens via CSS var fallback) ──
const ROSE = "#e8547a";
const ROSE_LIGHT = "#ff8aab";
const LAV = "#b89ce0";
const VIOLET = "#9b7fc7";
const GOLD = "#f5c842";
const DEEP = "#3d1a4d";

const VB = 1000;
const CX = VB / 2;
const CY = VB / 2;
const WHEEL_R = 170;

// ── Rope stream factory ──────────────────────────────────────────────────
// Each rope has a deterministic-but-varied path that loops forever.
type Stream = {
  id: number;
  color: string;
  z: number;            // positive Z parallax (depth)
  width: number;
  duration: number;     // single-cycle duration in seconds
  delay: number;        // stagger so streams overlap continuously
  d: string;            // SVG path data (off-edge entry → wheel rim)
  flipDir: 1 | -1;
};

const PALETTE = [ROSE, LAV, VIOLET, ROSE_LIGHT, GOLD];

function mkStream(i: number): Stream {
  // Deterministic pseudo-random
  const r = (seed: number) => (Math.sin((i + 1) * seed * 12.9898) + 1) * 0.5;

  // Entry point — far outside viewBox so it feels like it's flying in
  const angle = r(1) * Math.PI * 2;
  const radius = 700 + r(2) * 400;
  const ex = CX + Math.cos(angle) * radius;
  const ey = CY + Math.sin(angle) * radius;

  // Exit point — somewhere on the wheel circumference
  const wheelAngle = (i / 16) * Math.PI * 2 + r(3) * 0.7;
  const wx = CX + Math.cos(wheelAngle) * WHEEL_R;
  const wy = CY + Math.sin(wheelAngle) * WHEEL_R;

  // Two control points to bend the rope chaotically toward the wheel
  const bend = 250 + r(4) * 350;
  const c1angle = angle + (r(5) - 0.5) * 2.4;
  const c1x = ex + Math.cos(c1angle) * -bend * 0.5;
  const c1y = ey + Math.sin(c1angle) * -bend * 0.5;
  const c2angle = wheelAngle + (r(6) - 0.5) * 1.8;
  const c2x = wx + Math.cos(c2angle) * bend * 0.6;
  const c2y = wy + Math.sin(c2angle) * bend * 0.6;

  return {
    id: i,
    color: PALETTE[i % PALETTE.length],
    z: 30 + (i % 7) * 25,
    width: 2.4 + (i % 4) * 0.5,
    duration: 3.6 + r(7) * 2.4,
    delay: r(8) * 5,        // stagger up to 5s so streams are always flowing
    d: `M ${ex} ${ey} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${wx} ${wy}`,
    flipDir: i % 2 === 0 ? 1 : -1,
  };
}

const STREAM_COUNT = 16;

export default function RopeReveal() {
  const streams = useMemo<Stream[]>(
    () => Array.from({ length: STREAM_COUNT }, (_, i) => mkStream(i)),
    []
  );

  return (
    <div
      className="rope-stage relative w-full"
      style={{
        perspective: 1600,
        perspectiveOrigin: "50% 45%",
        minHeight: 600,
      }}
    >
      {/* Soft halo behind everything */}
      <motion.div
        aria-hidden
        className="rope-glow"
        animate={{
          opacity: [0.35, 0.7, 0.35],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.svg
        viewBox={`0 0 ${VB} ${VB}`}
        className="rope-svg"
        style={{
          width: "100%",
          maxWidth: 820,
          margin: "0 auto",
          display: "block",
          transformStyle: "preserve-3d",
          willChange: "transform",
          filter: "drop-shadow(0 30px 60px rgba(155,127,199,0.28))",
        }}
        // Tiny continuous 3D wobble — makes everything feel alive
        animate={{ rotateX: [-3, 3, -3], rotateY: [4, -4, 4] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      >
        <defs>
          <radialGradient id="wheelGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={ROSE} stopOpacity="0.55" />
            <stop offset="50%" stopColor={LAV} stopOpacity="0.22" />
            <stop offset="100%" stopColor={DEEP} stopOpacity="0" />
          </radialGradient>

          <linearGradient id="ropeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={ROSE} />
            <stop offset="55%" stopColor={LAV} />
            <stop offset="100%" stopColor={VIOLET} />
          </linearGradient>

          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Mask: only show the part of each rope that's currently "in flight" */}
        </defs>

        {/* ── Wheel halo (pulsing) ── */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={WHEEL_R * 1.8}
          fill="url(#wheelGlow)"
          animate={{ opacity: [0.55, 0.85, 0.55], scale: [0.9, 1.05, 0.9] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />

        {/* ── Wheel: dashed rotating ring ── */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={WHEEL_R}
          fill="none"
          stroke={ROSE}
          strokeOpacity={0.55}
          strokeWidth={1.8}
          strokeDasharray="6 8"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />

        {/* ── Wheel: secondary outer ring (counter-rotates) ── */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={WHEEL_R + 20}
          fill="none"
          stroke={LAV}
          strokeOpacity={0.35}
          strokeWidth={1.2}
          strokeDasharray="2 12"
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />

        {/* ── Wheel: bright centre dot ── */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={7}
          fill={ROSE}
          animate={{ scale: [1, 1.4, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            transformOrigin: `${CX}px ${CY}px`,
            filter: "drop-shadow(0 0 12px rgba(232,84,122,0.8))",
          }}
        />

        {/* ── Infinite rope streams flowing into the wheel ── */}
        {streams.map((s) => (
          <g
            key={s.id}
            style={{
              // positive Z parallax — varies per rope for depth
              transform: `translateZ(${s.z}px)`,
            }}
          >
            <motion.path
              d={s.d}
              stroke={s.color}
              strokeWidth={s.width}
              strokeLinecap="round"
              fill="none"
              filter="url(#softGlow)"
              // Animation: a "comet" travels along the path —
              // the visible segment moves from start (off-screen) to
              // end (wheel rim), then fades and restarts.
              initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 0.35, 0.35, 0],
                pathOffset: [0, 0, 0.7, 1],
                opacity: [0, 0.9, 0.9, 0],
              }}
              transition={{
                duration: s.duration,
                delay: s.delay,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.35, 0.8, 1],
              }}
            />
          </g>
        ))}

        {/* ── Wordmark — drawn once at start, then breathes forever ── */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 2.6 }}
        >
          <motion.text
            x={CX}
            y={CY + 30}
            textAnchor="middle"
            fill="transparent"
            stroke={ROSE}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              fontFamily: "var(--font-script), cursive",
              fontSize: 118,
              letterSpacing: "-0.02em",
            }}
            initial={{ pathLength: 0 } as any}
            animate={{
              pathLength: 1,
              // gentle breath after initial draw
              strokeOpacity: [0.85, 1, 0.85],
            } as any}
            transition={{
              pathLength: { duration: 2.6, ease: "easeInOut", delay: 2.2 },
              strokeOpacity: {
                duration: 4,
                delay: 5,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >
            The Garima
          </motion.text>

          <motion.text
            x={CX}
            y={CY + 140}
            textAnchor="middle"
            fill="transparent"
            stroke={ROSE}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              fontFamily: "var(--font-script), cursive",
              fontSize: 118,
              letterSpacing: "-0.02em",
            }}
            initial={{ pathLength: 0 } as any}
            animate={{
              pathLength: 1,
              strokeOpacity: [0.85, 1, 0.85],
            } as any}
            transition={{
              pathLength: { duration: 2.4, ease: "easeInOut", delay: 3.8 },
              strokeOpacity: {
                duration: 4,
                delay: 6.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >
            Effect
          </motion.text>

          {/* Decorative underline that draws after text */}
          <motion.path
            d={`M ${CX - 140} ${CY + 175} Q ${CX} ${CY + 195}, ${CX + 140} ${CY + 175}`}
            stroke={ROSE}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 6, ease: "easeOut" }}
          />

          {/* Sparkles around wordmark — pulse forever */}
          {[
            { x: CX - 200, y: CY + 30,  d: 0.0 },
            { x: CX + 200, y: CY + 70,  d: 0.7 },
            { x: CX - 120, y: CY + 215, d: 1.4 },
            { x: CX + 130, y: CY + 215, d: 2.1 },
            { x: CX - 250, y: CY + 140, d: 2.8 },
            { x: CX + 250, y: CY + 140, d: 3.5 },
          ].map((s, i) => (
            <motion.text
              key={i}
              x={s.x}
              y={s.y}
              fill={GOLD}
              fontSize={28}
              textAnchor="middle"
              animate={{
                opacity: [0, 1, 0.5, 1, 0],
                scale: [0.4, 1.3, 1, 1.2, 0.4],
              }}
              transition={{
                duration: 3.6,
                delay: 6 + s.d,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              ✦
            </motion.text>
          ))}
        </motion.g>
      </motion.svg>

      {/* Floating depth particles in front of SVG (positive Z) */}
      <DepthParticles />
    </div>
  );
}

function DepthParticles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        i,
        z: 70 + (i % 7) * 35,
        x: (i * 37) % 100,
        y: (i * 53) % 100,
        color: [ROSE, LAV, VIOLET, GOLD][i % 4],
        size: 3 + (i % 4),
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
            opacity: [0.15, 0.75, 0.15],
            scale: [0.4, 1.2, 0.4],
            y: [0, -24, 0],
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
            boxShadow: `0 0 ${d.size * 4}px ${d.color}`,
            transform: `translateZ(${d.z}px)`,
          }}
        />
      ))}
    </div>
  );
}
