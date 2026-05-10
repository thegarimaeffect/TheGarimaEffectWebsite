"use client";

import { motion } from "framer-motion";

const SERVICES = [
  {
    icon: "📱",
    title: "Instagram Growth & Management",
    desc: "End-to-end IG strategy — from positioning to posting cadence — built to compound followers, saves, and shares into real revenue.",
    tag: "Audience",
  },
  {
    icon: "📈",
    title: "Sales & Marketing Strategy",
    desc: "Funnels that convert lurkers into loyalists. Offers, hooks, lead magnets, and email flows mapped to your brand voice.",
    tag: "Conversion",
  },
  {
    icon: "🎬",
    title: "Brand Storytelling & Scripts",
    desc: "Cinematic scripts that hook in 3 seconds and pay off in 30. Story arcs that make people feel — and click.",
    tag: "Voice",
  },
  {
    icon: "✨",
    title: "Reels, UGC & Content Creation",
    desc: "Scroll-stopping reels and authentic UGC produced end-to-end — concept, shoot, edit, caption, ship.",
    tag: "Craft",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="relative py-32 md:py-40 px-6 md:px-12 z-10"
    >
      <div className="max-w-[1400px] mx-auto">
        {/* HEADER */}
        <div className="flex flex-col items-center text-center mb-20">
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.5em" }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.8 }}
            className="section-eyebrow mb-4"
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
            className="mt-6 h-px w-32 bg-gradient-to-r from-transparent via-accent-primary to-transparent"
          />
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                delay: i * 0.1,
                duration: 0.6,
                ease: "easeOut",
              }}
              className="glass p-8 md:p-10 group relative overflow-hidden"
            >
              {/* Top tag + icon */}
              <div className="flex items-start justify-between mb-8">
                <span className="pill pink">{s.tag}</span>
                <span
                  className="text-5xl md:text-6xl"
                  style={{ filter: "drop-shadow(0 6px 20px rgba(232,84,122,0.4))" }}
                >
                  {s.icon}
                </span>
              </div>

              <h3 className="text-2xl md:text-[28px] font-semibold text-white leading-tight mb-4">
                {s.title}
              </h3>
              <p className="text-white/70 leading-relaxed text-[14px] md:text-[15px]">
                {s.desc}
              </p>

              {/* Decorative gradient line on hover */}
              <div className="mt-8 h-px w-full bg-gradient-to-r from-accent-primary/0 via-accent-primary/60 to-accent-primary/0 opacity-50 group-hover:opacity-100 transition-opacity" />

              <div className="mt-6 flex items-center justify-between">
                <span className="text-[10px] tracking-[0.4em] uppercase text-white/40">
                  0{i + 1} / 04
                </span>
                <span className="text-white/60 group-hover:text-accent-primary group-hover:translate-x-1 transition">
                  Explore →
                </span>
              </div>

              {/* Subtle gold sparkle */}
              <span
                className="absolute top-6 right-6 text-[10px]"
                style={{ color: "#f5c842" }}
              >
                ✦
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
