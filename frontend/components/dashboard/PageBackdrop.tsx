"use client";

import { motion } from "framer-motion";

/**
 * Reusable decorative backdrop for any premium page.
 * Two slow-floating gradient blobs + scattered sparkles.
 * Sits at z-index 0 — pages render content above it at higher z.
 */
export default function PageBackdrop({
  variant = "default",
}: {
  variant?: "default" | "rose" | "lavender";
}) {
  const blobs =
    variant === "rose"
      ? [
          { top: "8%", left: "4%", size: 320, color: "rgba(232,84,122,0.22)" },
          { top: "62%", left: "82%", size: 280, color: "rgba(255,138,171,0.18)" },
          { top: "82%", left: "10%", size: 240, color: "rgba(184,156,224,0.18)" },
        ]
      : variant === "lavender"
      ? [
          { top: "6%", left: "78%", size: 320, color: "rgba(184,156,224,0.25)" },
          { top: "50%", left: "-6%", size: 360, color: "rgba(155,127,199,0.18)" },
          { top: "84%", left: "70%", size: 220, color: "rgba(232,84,122,0.16)" },
        ]
      : [
          { top: "8%", left: "6%", size: 280, color: "rgba(232,84,122,0.2)" },
          { top: "58%", left: "84%", size: 260, color: "rgba(184,156,224,0.22)" },
          { top: "82%", left: "12%", size: 220, color: "rgba(245,200,66,0.14)" },
        ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -22, 0],
            x: [0, 12, 0],
            scale: [1, 1.06, 1],
          }}
          transition={{
            duration: 9 + i * 1.5,
            delay: i * 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute rounded-full blur-3xl"
          style={{
            width: b.size,
            height: b.size,
            top: b.top,
            left: b.left,
            background: b.color,
          }}
        />
      ))}
      {Array.from({ length: 8 }).map((_, i) => {
        const t = (i * 47 + 13) % 100;
        const l = (i * 73 + 7) % 100;
        const c = i % 3 === 0 ? "#f5c842" : i % 3 === 1 ? "#e8547a" : "#b89ce0";
        const sz = 2 + ((i * 5) % 4);
        return (
          <span
            key={`s-${i}`}
            className="shimmer-dot"
            style={
              {
                top: `${t}%`,
                left: `${l}%`,
                width: sz,
                height: sz,
                background: c,
                opacity: 0.5,
                boxShadow: `0 0 ${sz * 4}px ${c}66`,
                ["--shimmer-dur" as string]: `${3 + (i % 3)}s`,
                ["--shimmer-delay" as string]: `${(i * 0.3) % 4}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
