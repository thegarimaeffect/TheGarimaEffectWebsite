"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

const STATS = [
  { num: "4+", label: "Years crafting" },
  { num: "60+", label: "Brands transformed" },
  { num: "120M+", label: "Combined views" },
  { num: "₹3.4Cr+", label: "Revenue moved" },
];

const PILLARS = [
  {
    icon: "✦",
    title: "Voice First",
    desc: "Every brand has a sound. I find yours, then make it impossible to mistake for anyone else's.",
  },
  {
    icon: "◆",
    title: "Story Architect",
    desc: "Hooks, arcs, and pay-offs that make people stop scrolling — and start buying.",
  },
  {
    icon: "✿",
    title: "Numbers-aware",
    desc: "Taste with a calculator next to it. Every reel, every funnel, every caption is measured.",
  },
];

export default function About() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], ["18%", "-18%"]);
  const watermarkX = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      ref={ref}
      id="about"
      className="stack-card relative min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 30% 30%, rgba(255,210,225,0.85), transparent 55%)," +
          "radial-gradient(ellipse at 75% 70%, rgba(210,190,245,0.78), transparent 55%)," +
          "linear-gradient(135deg, #fff5f4 0%, #fde0ed 50%, #ead8f5 100%)",
      }}
    >
      {/* Floating watermark word — drifts horizontally */}
      <motion.div
        aria-hidden
        style={{ x: watermarkX }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <span
          className="giant-watermark-outline"
          style={{
            fontSize: "clamp(140px, 26vw, 420px)",
            opacity: 0.18,
            letterSpacing: "-0.04em",
          }}
        >
          Garima
        </span>
      </motion.div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
        {/* LEFT: PHOTO + DECORATION */}
        <motion.div
          style={{ y: photoY }}
          className="lg:col-span-5 relative h-[480px] md:h-[640px]"
        >
          {/* Tilted frame behind */}
          <motion.div
            initial={{ opacity: 0, rotate: -2, scale: 0.95 }}
            whileInView={{ opacity: 1, rotate: -4, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute inset-4 rounded-[36px] border-2"
            style={{
              borderColor: "rgba(232,84,122,0.45)",
              background:
                "linear-gradient(135deg, rgba(255,200,220,0.4), rgba(200,170,240,0.3))",
            }}
          />

          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, y: 60, rotate: 4 }}
            whileInView={{ opacity: 1, y: 0, rotate: 2 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0.1 }}
            className="absolute inset-0 rounded-[36px] overflow-hidden"
            style={{
              background:
                "linear-gradient(160deg, rgba(255,200,220,0.6), rgba(200,170,240,0.6))",
              boxShadow: "0 30px 80px rgba(155,127,199,0.3)",
            }}
          >
            <Image
              src="/garima.png"
              alt="Garima Rana"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              style={{
                objectFit: "cover",
                objectPosition: "center top",
              }}
            />
            {/* Glass overlay corner badge */}
            <div
              className="absolute top-6 left-6 px-4 py-2 rounded-full text-[10px] tracking-[0.3em] uppercase font-bold"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(8px)",
                color: "#e8547a",
              }}
            >
              ✦ Founder
            </div>
          </motion.div>

          {/* Floating "since 2020" badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: 12 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -8 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, type: "spring", damping: 12 }}
            className="absolute -bottom-6 -right-4 md:-right-8"
          >
            <div
              className="px-6 py-4 rounded-3xl"
              style={{
                background: "linear-gradient(135deg, #e8547a, #b89ce0)",
                color: "white",
                boxShadow: "0 16px 40px rgba(232,84,122,0.45)",
                fontFamily: "var(--font-script), cursive",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              since 2020 ✦
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT: BIO */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.5em" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="section-eyebrow-rose mb-4"
          >
            About The Founder
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="section-script"
            style={{ fontSize: "clamp(46px, 6vw, 84px)" }}
          >
            Meet Garima Rana
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="mt-2 text-[15px] tracking-[0.2em] uppercase font-semibold"
            style={{ color: "var(--color-accent-rose)" }}
          >
            Founder &amp; CEO · The Garima Effect
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="mt-8 space-y-5 max-w-2xl text-[15px] md:text-[16px] leading-relaxed"
            style={{ color: "var(--color-text-body)" }}
          >
            <p>
              Garima Rana is a content strategist, brand storyteller, and the
              creative engine behind <em>The Garima Effect</em> — a boutique
              studio that helps founders turn a feed full of noise into a
              brand people remember.
            </p>
            <p>
              Since 2020 she has shaped the voice, scripts, funnels, and feed
              of <strong style={{ color: "var(--color-text-deep)" }}>60+ brands</strong>{" "}
              across beauty, wellness, hospitality, fashion and food — moving
              over <strong style={{ color: "var(--color-text-deep)" }}>120M views</strong>{" "}
              and translating attention into revenue.
            </p>
            <p>
              Her practice sits at the rare intersection of taste, story and
              numbers: every reel earns its hook, every caption earns its
              click, every funnel earns its yes.
            </p>
          </motion.div>

          {/* Pull quote */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mt-10 pl-6 border-l-2 max-w-xl"
            style={{ borderColor: "#e8547a" }}
          >
            <p
              className="italic text-[18px] md:text-[22px] leading-snug"
              style={{
                fontFamily: "var(--font-script), cursive",
                color: "var(--color-text-deep)",
              }}
            >
              "I don't sell content. I sell the way a brand makes someone feel
              the second they see it."
            </p>
            <p
              className="mt-3 text-[11px] tracking-[0.4em] uppercase"
              style={{ color: "var(--color-text-muted)" }}
            >
              — Garima Rana
            </p>
          </motion.div>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ y: -6, scale: 1.03 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", damping: 16 }}
              className="glass p-6 md:p-8 text-center"
            >
              <p
                className="text-4xl md:text-5xl font-black text-gradient-rose"
                style={{ lineHeight: 1 }}
              >
                {s.num}
              </p>
              <p
                className="mt-3 text-[10px] md:text-[11px] tracking-[0.3em] uppercase font-semibold"
                style={{ color: "var(--color-text-muted)" }}
              >
                {s.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* PILLARS */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.12, duration: 0.7 }}
              className="glass p-7"
            >
              <div
                className="text-3xl mb-3"
                style={{ color: "#e8547a" }}
              >
                {p.icon}
              </div>
              <h4
                className="font-bold text-lg mb-2"
                style={{ color: "var(--color-text-deep)" }}
              >
                {p.title}
              </h4>
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: "var(--color-text-body)" }}
              >
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
