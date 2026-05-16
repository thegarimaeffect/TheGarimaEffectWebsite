"use client";

import { motion } from "framer-motion";

/**
 * Premium stat card — gradient number, decorative corner blob, micro-trend optional.
 */
export default function StatTile({
  label,
  value,
  accent = "#e8547a",
  trend,
  icon,
  index = 0,
}: {
  label: string;
  value: string | number;
  accent?: string;
  trend?: { delta: string; positive?: boolean };
  icon?: React.ReactNode;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, type: "spring", damping: 18 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="glass p-6 md:p-7 relative overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-2xl opacity-60"
        style={{ background: `${accent}55` }}
      />
      <div className="flex items-start justify-between mb-3 relative">
        <p
          className="text-[10px] tracking-[0.32em] uppercase font-bold"
          style={{ color: "var(--color-text-muted)" }}
        >
          {label}
        </p>
        {icon && (
          <span
            className="text-xl"
            style={{ color: accent, filter: `drop-shadow(0 4px 14px ${accent}66)` }}
          >
            {icon}
          </span>
        )}
      </div>
      <p
        className="font-black relative"
        style={{
          fontSize: "clamp(40px, 4vw, 56px)",
          lineHeight: 1,
          background: `linear-gradient(135deg, ${accent}, #b89ce0)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {value}
      </p>
      {trend && (
        <p
          className="mt-3 text-[11px] tracking-[0.18em] uppercase font-semibold flex items-center gap-1"
          style={{
            color: trend.positive === false ? "#c23b68" : "#1f7a3c",
          }}
        >
          <span>{trend.positive === false ? "↘" : "↗"}</span>
          {trend.delta}
        </p>
      )}
    </motion.div>
  );
}
