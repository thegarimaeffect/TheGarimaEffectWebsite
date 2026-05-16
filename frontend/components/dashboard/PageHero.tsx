"use client";

import { motion } from "framer-motion";

/**
 * Premium hero block for every dashboard page.
 * Eyebrow → script title → muted subtitle, with the signature ✦ sparkle.
 */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10"
    >
      <div>
        <p
          className="text-[11px] tracking-[0.4em] uppercase font-bold mb-3 flex items-center gap-2"
          style={{ color: "#e8547a" }}
        >
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            style={{ display: "inline-block" }}
          >
            ✦
          </motion.span>
          {eyebrow}
        </p>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="section-script"
          style={{ fontSize: "clamp(42px, 6vw, 84px)", lineHeight: 1 }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mt-3 text-[15px] italic max-w-2xl"
            style={{ color: "var(--color-text-body)" }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
      {right && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {right}
        </motion.div>
      )}
    </motion.section>
  );
}
