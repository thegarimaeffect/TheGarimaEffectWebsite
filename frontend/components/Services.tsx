"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const SERVICES = [
  {
    icon: "📱",
    title: "Content Marketing",
    desc: "Build brand identity and social credibility through a strategic, consistent presence across the platforms that matter.",
    tag: "Inbound",
    accent: "#e8547a",
  },
  {
    icon: "🎯",
    title: "Outbound Sales",
    desc: "Targeted delivery of your offer to a filtered, high-conversion audience — your pitch in front of exactly the right people.",
    tag: "Outbound",
    accent: "#b89ce0",
  },
  {
    icon: "💬",
    title: "The Marketing Language",
    desc: "Translating what your brand does into words that pitch, persuade, and close — the language that turns interest into yes.",
    tag: "Voice",
    accent: "#f5c842",
  },
  {
    icon: "🧭",
    title: "Brand Strategy",
    desc: "A foundational strategy to help brands grow, nurture, and stabilize — the roadmap underneath every reel, caption, and funnel.",
    tag: "Foundation",
    accent: "#ff8aab",
  },
];

export default function Services() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const headY = useTransform(scrollYProgress, [0, 1], ["20%", "-12%"]);

  return (
    <section
      ref={ref}
      id="services"
      className="stack-card relative min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 80% 20%, rgba(255,210,225,0.7), transparent 55%)," +
          "radial-gradient(ellipse at 20% 80%, rgba(184,156,224,0.5), transparent 55%)," +
          "linear-gradient(135deg, #fbe5ee 0%, #ead8f5 100%)",
      }}
    >
      <motion.div
        aria-hidden
        style={{ y: headY }}
        className="absolute inset-0 flex items-start justify-center pointer-events-none pt-32"
      >
        <span
          className="giant-watermark-outline"
          style={{
            fontSize: "clamp(80px, 16vw, 240px)",
            opacity: 0.22,
            letterSpacing: "-0.02em",
          }}
        >
          SERVICES
        </span>
      </motion.div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 py-24 md:py-32">
        <div className="flex flex-col items-center text-center mb-16">
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.5em" }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8 }}
            className="section-eyebrow-rose mb-4"
          >
            From Concept to Content
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="section-script"
          >
            What I Do
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mt-6 h-px w-32"
            style={{
              background:
                "linear-gradient(90deg, transparent, #e8547a, transparent)",
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {SERVICES.map((s, i) => {
            const fromLeft = i % 2 === 0;
            return (
              <motion.div
                key={s.title}
                initial={{
                  opacity: 0,
                  y: 120,
                  x: fromLeft ? -180 : 180,
                  rotate: fromLeft ? -22 : 22,
                  scale: 0.85,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  x: 0,
                  rotate: 0,
                  scale: 1,
                }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  delay: i * 0.15,
                  type: "spring",
                  damping: 15,
                  stiffness: 90,
                }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="glass p-8 md:p-10 group relative overflow-hidden"
              >
                {/* Accent corner blob */}
                <div
                  aria-hidden
                  className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-2xl opacity-50"
                  style={{ background: `${s.accent}55` }}
                />

                <div className="relative flex items-start justify-between mb-8">
                  <span className="pill pink">{s.tag}</span>
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.4,
                    }}
                    className="text-5xl md:text-6xl"
                    style={{
                      filter:
                        "drop-shadow(0 6px 20px rgba(232,84,122,0.35))",
                    }}
                  >
                    {s.icon}
                  </motion.span>
                </div>

                <h3
                  className="text-2xl md:text-[28px] font-semibold leading-tight mb-4 relative"
                  style={{ color: "var(--color-text-deep)" }}
                >
                  {s.title}
                </h3>
                <p
                  className="leading-relaxed text-[14px] md:text-[15px] relative"
                  style={{ color: "var(--color-text-body)" }}
                >
                  {s.desc}
                </p>

                <div
                  className="mt-8 h-px w-full opacity-50 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${s.accent}, transparent)`,
                  }}
                />

                <div className="mt-6 flex items-center justify-between relative">
                  <span
                    className="text-[10px] tracking-[0.4em] uppercase"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    0{i + 1} / 04
                  </span>
                  <span
                    className="font-semibold group-hover:translate-x-1 transition"
                    style={{ color: s.accent }}
                  >
                    Explore →
                  </span>
                </div>

                <span
                  className="absolute top-6 right-6 text-[10px]"
                  style={{ color: "#f5c842" }}
                >
                  ✦
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
