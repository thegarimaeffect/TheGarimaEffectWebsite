"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const TESTIMONIALS = [
  {
    quote:
      "Garima didn't just manage our Instagram — she changed how the world sees our brand.",
    name: "Priya S.",
    role: "Founder, Lumen Skincare",
  },
  {
    quote:
      "Within 90 days our reach 6×'d and DMs turned into a waitlist. Pure magic — and pure strategy.",
    name: "Aarav M.",
    role: "CEO, NorthLane Studio",
  },
  {
    quote:
      "Her scripts make people stop scrolling. Our last reel hit 2.3M views and 14k saves.",
    name: "Ishita K.",
    role: "Creative Director, Bloom Co.",
  },
  {
    quote:
      "She translated our chaotic vision into a brand story that finally sounds like us.",
    name: "Rohan D.",
    role: "Founder, Tide & Tonic",
  },
  {
    quote:
      "Working with Garima feels like cheating — except it's all hard work, taste, and instinct.",
    name: "Maya R.",
    role: "Head of Growth, Wildflower",
  },
];

export default function Testimonials() {
  const [paused, setPaused] = useState(false);
  // Duplicate the list so the marquee loops seamlessly
  const loop = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section
      id="testimonials"
      className="relative py-28 md:py-36 z-10 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="section-eyebrow mb-4"
        >
          Words From The Wave
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="section-script"
        >
          The Effect They Felt
        </motion.h2>
      </div>

      {/* Auto-scrolling marquee carousel */}
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* edge fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-r from-[#3d2b5e]/80 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-l from-[#b48ca8]/40 to-transparent" />

        <div
          className={`flex gap-6 md:gap-8 marquee-track ${
            paused ? "paused" : ""
          }`}
          style={{ width: "fit-content" }}
        >
          {loop.map((t, i) => (
            <article
              key={i}
              className="glass p-8 md:p-10 flex-shrink-0 w-[300px] md:w-[420px] flex flex-col justify-between"
            >
              <div>
                <span
                  className="text-5xl leading-none"
                  style={{ color: "#f5c842" }}
                >
                  &ldquo;
                </span>
                <p className="italic text-white/90 text-[15px] md:text-[17px] leading-relaxed mt-2">
                  {t.quote}
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="font-semibold text-white text-[14px]">{t.name}</p>
                <p className="text-[12px] tracking-[0.18em] uppercase mt-1 text-accent-primary/90"
                   style={{ color: "#ffb3c5" }}
                >
                  {t.role}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
