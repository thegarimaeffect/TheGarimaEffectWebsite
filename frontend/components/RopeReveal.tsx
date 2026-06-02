"use client";

/**
 * RopeReveal — opening 3D animation for the Hero section.
 *
 * Story arc:
 *   1. 10 wavy "ropes" float chaotically in 3D space (positive Z parallax)
 *   2. They converge toward centre and weave into a glowing wheel
 *   3. One rope detaches from the wheel and traces the script wordmark
 *      "The Garima Effect"
 *   4. Idle state: subtle continuous breathing motion
 *
 * Everything uses brand tokens (rose / lavender / violet / aubergine).
 * No external assets — all SVG paths, all Framer Motion driven.
 */

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Brand palette — sourced from globals.css tokens
const ROSE = "#e8547a";
const ROSE_LIGHT = "#ff8aab";
const LAV = "#b89ce0";
const VIOLET = "#9b7fc7";
const GOLD = "#f5c842";
const DEEP = "#3d1a4d";

// Viewport for SVG (kept squareish so wheel looks circular)
const VB = 1000;
const CX = VB / 2;
const CY = VB / 2;
const WHEEL_R = 180;

// Chaotic rope definitions — 10 ropes, each with chaos start/end points
// and a wheel-state arrangement around the wheel circumference.
type Rope = {
  id: number;
  color: string;
  z: number; // positive Z for 3D depth (parallax)
  // chaos state (start)
  c: {
    x1: number; y1: number;
    cx: number; cy: number;
    x2: number; y2: number;
    rot: number;
  };
  // wheel state (target) — angle around wheel + outward bend
  w: {
    angleA: number; // entry angle around wheel
    angleB: number; // exit angle (loops around)
    bend: number;   // outward bulge for thickness illusion
  };
};

const ROPES: Rope[] = Array.from({ length: 10 }, (_, i) => {
  const palette = [ROSE, LAV, VIOLET, ROSE_LIGHT, GOLD];
  const seed = i * 137;
  const chaos = (n: number) => ((Math.sin(n) + 1) / 2) * 1000;
  const x1 = (chaos(seed * 1.13) - 500) * 0.95 + 500;
  const y1 = (chaos(seed * 2.71) - 500) * 0.92 + 500;
  const x2 = (chaos(seed * 3.41) - 500) * 0.95 + 500;
  const y2 = (chaos(seed * 4.27) - 500) * 0.92 + 500;
  const cx = (chaos(seed * 5.09) - 500) * 0.9 + 500;
  const cy = (chaos(seed * 6.17) - 500) * 0.9 + 500;

  return {
    id: i,
    color: palette[i % palette.length],
    z: 30 + (i % 5) * 30, // positive Z parallax
    c: {
      x1, y1, cx, cy, x2, y2,
      rot: ((i * 47) % 360) - 180,
    },
    w: {
      angleA: (i / 10) * Math.PI * 2,
      angleB: (i / 10) * Math.PI * 2 + Math.PI * 1.7,
      bend: 18 + (i % 3) * 10,
    },
  };
});

function chaosPath(r: Rope): string {
  const { x1, y1, cx, cy, x2, y2 } = r.c;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

function wheelPath(r: Rope): string {
  // Arc around the wheel circumference using cubic bezier
  const a1 = r.w.angleA;
  const a2 = r.w.angleB;
  const r1 = WHEEL_R + r.w.bend;
  const r2 = WHEEL_R - r.w.bend * 0.4;
  const sx = CX + Math.cos(a1) * r1;
  const sy = CY + Math.sin(a1) * r1;
  const ex = CX + Math.cos(a2) * r1;
  const ey = CY + Math.sin(a2) * r1;
  // Control points pull the curve toward an inner radius
  const mid = (a1 + a2) / 2;
  const c1x = CX + Math.cos(a1 + 0.3) * r2;
  const c1y = CY + Math.sin(a1 + 0.3) * r2;
  const c2x = CX + Math.cos(mid) * (WHEEL_R - 60);
  const c2y = CY + Math.sin(mid) * (WHEEL_R - 60);
  return `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`;
}

// The single rope that escapes from the wheel and turns into the wordmark
const ESCAPE_PATH =
  "M 500 320 C 600 310, 700 305, 760 320 L 760 380";

export default function RopeReveal() {
  const [phase, setPhase] = useState<"chaos" | "wheel" | "writing" | "idle">(
    "chaos"
  );

  // Phase orchestration
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("wheel"), 2400);
    const t2 = setTimeout(() => setPhase("writing"), 4200);
    const t3 = setTimeout(() => setPhase("idle"), 7200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div
      className="rope-stage relative w-full"
      style={{
        perspective: 1400,
        perspectiveOrigin: "50% 40%",
        minHeight: 480,
      }}
    >
      {/* Glow halo behind the wheel */}
      <motion.div
        aria-hidden
        className="rope-glow"
        animate={
          phase === "chaos"
            ? { opacity: 0, scale: 0.4 }
            : phase === "wheel"
            ? { opacity: 0.55, scale: 1 }
            : { opacity: 0.4, scale: 1.05 }
        }
        transition={{ duration: 1.4, ease: "easeOut" }}
      />

      <motion.svg
        viewBox={`0 0 ${VB} ${VB}`}
        className="rope-svg"
        style={{
          width: "100%",
          maxWidth: 720,
          margin: "0 auto",
          display: "block",
          transformStyle: "preserve-3d",
          willChange: "transform",
          filter: "drop-shadow(0 30px 60px rgba(155,127,199,0.25))",
        }}
        animate={
          phase === "chaos"
            ? { rotateX: -8, rotateY: 6 }
            : phase === "wheel"
            ? { rotateX: 0, rotateY: -3 }
            : { rotateX: 2, rotateY: 0 }
        }
        transition={{ duration: 1.6, ease: "easeInOut" }}
      >
        <defs>
          {/* Soft radial glow gradient for wheel halo (inline use) */}
          <radialGradient id="wheelGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={ROSE} stopOpacity="0.35" />
            <stop offset="55%" stopColor={LAV} stopOpacity="0.15" />
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
        </defs>

        {/* Wheel hub glow (revealed once ropes converge) */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={WHEEL_R * 1.4}
          fill="url(#wheelGlow)"
          initial={{ opacity: 0 }}
          animate={{
            opacity:
              phase === "chaos" ? 0 : phase === "wheel" || phase === "writing" || phase === "idle" ? 1 : 0,
          }}
          transition={{ duration: 1.2 }}
        />

        {/* Inner wheel ring (subtle) */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={WHEEL_R}
          fill="none"
          stroke={ROSE}
          strokeOpacity={0.35}
          strokeWidth={1.5}
          strokeDasharray="3 6"
          initial={{ opacity: 0, rotate: 0 }}
          animate={{
            opacity: phase === "chaos" ? 0 : 0.7,
            rotate: phase === "idle" ? 360 : 0,
          }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
          transition={{
            opacity: { duration: 1, delay: 1.4 },
            rotate: { duration: 40, repeat: Infinity, ease: "linear" },
          }}
        />

        {/* Wheel center dot */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={6}
          fill={ROSE}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: phase === "chaos" ? 0 : 1,
            scale: phase === "chaos" ? 0 : 1,
          }}
          transition={{ duration: 0.5, delay: 1.4 }}
          style={{ filter: "drop-shadow(0 0 12px rgba(232,84,122,0.7))" }}
        />

        {/* The 10 ropes — each animates from chaos path → wheel path */}
        {ROPES.map((r) => {
          const targetPath =
            phase === "chaos" ? chaosPath(r) : wheelPath(r);

          return (
            <motion.g
              key={r.id}
              style={{
                // positive Z parallax — varies per rope for depth
                transform: `translateZ(${r.z}px)`,
              }}
            >
              <motion.path
                d={targetPath}
                stroke={r.color}
                strokeOpacity={phase === "chaos" ? 0.55 : 0.85}
                strokeWidth={phase === "chaos" ? 2.2 : 3.5}
                strokeLinecap="round"
                fill="none"
                filter="url(#softGlow)"
                initial={{
                  pathLength: 0,
                  rotate: r.c.rot,
                }}
                animate={{
                  d: targetPath,
                  pathLength: 1,
                  rotate: phase === "chaos" ? r.c.rot : 0,
                  strokeOpacity: phase === "chaos" ? 0.6 : 0.85,
                  strokeWidth: phase === "chaos" ? 2.2 : 3.4,
                } as any}
                transition={{
                  pathLength: { duration: 1.4, delay: 0.05 * r.id, ease: "easeOut" },
                  d: { duration: 1.6, ease: [0.65, 0.0, 0.35, 1] },
                  rotate: { duration: 1.4, ease: "easeInOut" },
                  default: { duration: 1.2 },
                }}
                style={{ transformOrigin: `${CX}px ${CY}px` }}
              />
            </motion.g>
          );
        })}

        {/* Escape rope — emerges from wheel and traces text */}
        <motion.path
          d={ESCAPE_PATH}
          stroke="url(#ropeGradient)"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: phase === "writing" || phase === "idle" ? 1 : 0,
            opacity: phase === "writing" || phase === "idle" ? 1 : 0,
          }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />

        {/* WORDMARK — "The Garima Effect" written by the rope (stroke draw) */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "writing" || phase === "idle" ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <motion.text
            x={CX}
            y={CY + 30}
            textAnchor="middle"
            fill="transparent"
            stroke={ROSE}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              fontFamily: "var(--font-script), cursive",
              fontSize: 110,
              letterSpacing: "-0.02em",
            }}
            initial={{ pathLength: 0 } as any}
            animate={{ pathLength: phase === "writing" || phase === "idle" ? 1 : 0 } as any}
            transition={{ duration: 2.4, ease: "easeInOut", delay: 0.4 }}
          >
            The Garima
          </motion.text>
          <motion.text
            x={CX}
            y={CY + 130}
            textAnchor="middle"
            fill="transparent"
            stroke={ROSE}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              fontFamily: "var(--font-script), cursive",
              fontSize: 110,
              letterSpacing: "-0.02em",
            }}
            initial={{ pathLength: 0 } as any}
            animate={{ pathLength: phase === "writing" || phase === "idle" ? 1 : 0 } as any}
            transition={{ duration: 2.4, ease: "easeInOut", delay: 1.4 }}
          >
            Effect
          </motion.text>

          {/* Decorative underline that draws after text */}
          <motion.path
            d={`M ${CX - 130} ${CY + 165} Q ${CX} ${CY + 180}, ${CX + 130} ${CY + 165}`}
            stroke={ROSE}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: phase === "idle" ? 1 : 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          />

          {/* Sparkle accents */}
          {[
            { x: CX - 170, y: CY + 20, d: 0.2 },
            { x: CX + 170, y: CY + 60, d: 0.6 },
            { x: CX - 100, y: CY + 200, d: 1.0 },
            { x: CX + 120, y: CY + 200, d: 1.4 },
          ].map((s, i) => (
            <motion.text
              key={i}
              x={s.x}
              y={s.y}
              fill={GOLD}
              fontSize={28}
              textAnchor="middle"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: phase === "idle" ? [0, 1, 0.7, 1] : 0,
                scale: phase === "idle" ? [0, 1.2, 1, 1.1] : 0,
              }}
              transition={{
                duration: 2.4,
                delay: 1 + s.d,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              ✦
            </motion.text>
          ))}
        </motion.g>
      </motion.svg>

      {/* Floating depth particles (positive Z) */}
      <DepthParticles phase={phase} />
    </div>
  );
}

function DepthParticles({ phase }: { phase: string }) {
  const dots = Array.from({ length: 22 }, (_, i) => ({
    i,
    z: 60 + (i % 6) * 40,
    x: ((i * 37) % 100),
    y: ((i * 53) % 100),
    color: [ROSE, LAV, VIOLET, GOLD][i % 4],
    size: 4 + (i % 4),
    dur: 3 + (i % 5),
  }));
  return (
    <div aria-hidden className="rope-particles" style={{ transformStyle: "preserve-3d" }}>
      {dots.map((d) => (
        <motion.span
          key={d.i}
          className="rope-particle"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{
            opacity: phase === "chaos" ? [0, 0.6, 0.2] : [0.2, 0.7, 0.2],
            scale: [0.3, 1.1, 0.6],
            y: [0, -22, 0],
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
