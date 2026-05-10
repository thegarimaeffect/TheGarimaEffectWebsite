"use client";

/**
 * Brand butterfly — matches "The Garima Effect" logo:
 * - One large heart-shaped wing (upper-left, rose pink)
 * - One smaller teardrop wing (lower-right, soft pink)
 * - Thin body / stem
 * Wing-flap uses CSS classes from globals.css
 */
export default function Butterfly({
  size = 80,
  className = "",
  color = "#e8547a",
}: {
  size?: number;
  className?: string;
  color?: string;
}) {
  const h = size;
  const w = size * 0.95;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id="bfWing1" cx="35%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#ff8aab" stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.85" />
        </radialGradient>
        <radialGradient id="bfWing2" cx="60%" cy="55%" r="65%">
          <stop offset="0%" stopColor="#ffb3cc" stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.75" />
        </radialGradient>
        <filter id="bfGlow">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <g filter="url(#bfGlow)">
        {/* LEFT / UPPER large heart-shaped wing */}
        <g className="wing-left-upper">
          <path
            d="M40 48
               C 38 36, 28 20, 20 14
               C 12 8,  4 12,  4 20
               C 4 30,  14 38, 28 44
               C 34 47, 38 48, 40 48 Z"
            fill="url(#bfWing1)"
          />
        </g>

        {/* RIGHT / LOWER smaller teardrop wing */}
        <g className="wing-right-lower">
          <path
            d="M40 50
               C 48 44, 64 42, 70 50
               C 74 56, 68 66, 58 64
               C 50 62, 42 56, 40 50 Z"
            fill="url(#bfWing2)"
          />
        </g>

        {/* Body — thin curved stem */}
        <path
          d="M40 20 Q 41 35 40 62"
          stroke="#c23b68"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Head */}
        <circle cx="40" cy="19" r="2.5" fill="#c23b68" />

        {/* Antennae */}
        <path d="M40 18 Q 35 10 31 6" stroke="#c23b68" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        <path d="M40 18 Q 44 10 48 6" stroke="#c23b68" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        <circle cx="31" cy="6" r="1.8" fill={color} />
        <circle cx="48" cy="6" r="1.8" fill={color} />
      </g>
    </svg>
  );
}
