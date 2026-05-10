"use client";

import { useEffect, useState } from "react";

interface Star {
  top: string;
  left: string;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

/**
 * Renders ~36 randomly-positioned twinkling stars across the upper dark
 * portion of the page. Generated client-side to avoid hydration mismatch.
 */
export default function StarField({ count = 36 }: { count?: number }) {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const arr: Star[] = Array.from({ length: count }).map(() => ({
      // Mostly in the upper 70% so they fade with the dark gradient
      top: `${Math.random() * 70}%`,
      left: `${Math.random() * 100}%`,
      size: 1 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.7,
      duration: 2 + Math.random() * 4,
      delay: Math.random() * 5,
    }));
    setStars(arr);
  }, [count]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {stars.map((s, i) => (
        <span
          key={i}
          className="star"
          style={
            {
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.opacity,
              ["--twinkle-dur" as string]: `${s.duration}s`,
              ["--twinkle-delay" as string]: `${s.delay}s`,
              boxShadow: `0 0 ${s.size * 2}px rgba(255,255,255,0.6)`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
