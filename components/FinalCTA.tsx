"use client";

import { motion } from "framer-motion";

interface Props {
  onBookCall: () => void;
}

export default function FinalCTA({ onBookCall }: Props) {
  return (
    <section
      id="contact"
      className="relative py-32 md:py-44 px-6 md:px-12 z-10 overflow-hidden"
    >
      {/* Intensified gradient backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(232,84,122,0.35) 0%, rgba(155,127,199,0.18) 40%, transparent 70%)",
        }}
      />

      <div className="max-w-[1100px] mx-auto text-center">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="inline-block text-3xl mb-6"
          style={{ color: "#f5c842" }}
        >
          ✦
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="section-script"
          style={{ fontSize: "clamp(56px, 9vw, 132px)" }}
        >
          Ready to Feel
          <br />
          The Effect?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-8 text-white/80 text-lg md:text-xl italic max-w-xl mx-auto"
        >
          Let&apos;s build something unforgettable together.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-12 flex flex-col items-center gap-6"
        >
          <button onClick={onBookCall} className="cta-solid">
            Book Your Free Call
            <span>✨</span>
          </button>

          <p className="text-[11px] tracking-[0.4em] uppercase text-white/50">
            30-min discovery — no obligation
          </p>
        </motion.div>
      </div>
    </section>
  );
}
