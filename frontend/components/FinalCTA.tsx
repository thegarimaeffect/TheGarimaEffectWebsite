"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface Props {
  onBookCall: () => void;
}

export default function FinalCTA({ onBookCall }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.7, 1.3, 1]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["40%", "-20%"]);

  return (
    <section
      ref={ref}
      id="contact"
      className="stack-card relative min-h-screen overflow-hidden flex items-center justify-center px-6 md:px-12"
      style={{
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(255,200,220,0.9), transparent 55%)," +
          "radial-gradient(ellipse at 80% 80%, rgba(200,170,240,0.65), transparent 60%)," +
          "linear-gradient(135deg, #fde0ed 0%, #f5dff0 50%, #ead8f5 100%)",
      }}
    >
      <motion.div
        aria-hidden
        style={{ scale: glowScale }}
        className="absolute inset-0 -z-0 pointer-events-none"
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] max-w-[150vw] max-h-[150vh]"
          style={{
            background:
              "radial-gradient(circle, rgba(232,84,122,0.4) 0%, rgba(184,156,224,0.25) 35%, transparent 70%)",
          }}
        />
      </motion.div>

      {[...Array(14)].map((_, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute pointer-events-none text-2xl"
          style={{
            top: `${10 + ((i * 73) % 80)}%`,
            left: `${5 + ((i * 47) % 90)}%`,
            color: i % 2 === 0 ? "#f5c842" : "#e8547a",
            opacity: 0.55,
          }}
          animate={{
            y: [0, -18, 0],
            opacity: [0.3, 0.9, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 4 + (i % 4),
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          ✦
        </motion.span>
      ))}

      <motion.div
        style={{ y: titleY }}
        className="relative max-w-[1100px] mx-auto text-center z-10"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, type: "spring", damping: 12 }}
          className="inline-block text-4xl mb-6"
          style={{ color: "#e8547a" }}
        >
          ✦
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 50 }}
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
          className="mt-8 text-lg md:text-xl italic max-w-xl mx-auto"
          style={{ color: "var(--color-text-body)" }}
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
          <motion.button
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBookCall}
            className="cta-solid"
          >
            Book Your Free Call
            <span>✨</span>
          </motion.button>

          <p
            className="text-[11px] tracking-[0.4em] uppercase"
            style={{ color: "var(--color-text-muted)" }}
          >
            30-min discovery — no obligation
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
