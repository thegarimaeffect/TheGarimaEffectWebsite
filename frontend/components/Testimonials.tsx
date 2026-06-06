"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const FEEDBACK = [
  {
    quote:
      "Garima took our own account from a standing start to 121K views in 7 days — proof the strategy works before she even touches a client brand.",
    name: "The Garima Effect",
    role: "In-house · brand launch",
    metric: "0 → 121K / 7 days",
  },
  {
    quote:
      "Our California real estate sales tripled after she rebuilt our content and outbound pitch. The marketing language alone changed how clients respond to us.",
    name: "Reboot Constructions",
    role: "Real Estate · California",
    metric: "3× Sales Growth",
  },
  {
    quote:
      "Engagement climbed fast and stayed there. She positioned us as the expert in the room instead of just another vendor in the feed.",
    name: "Exports Experts Global",
    role: "B2B Exports",
    metric: "High Engagement",
  },
];

export default function Testimonials() {
  const [bundleOpen, setBundleOpen] = useState(false);

  return (
    <section
      id="feedback"
      className="stack-card relative min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 25% 25%, rgba(255,210,225,0.85), transparent 55%)," +
          "radial-gradient(ellipse at 80% 75%, rgba(210,190,245,0.7), transparent 55%)," +
          "linear-gradient(135deg, #fff5f4 0%, #fbe5ee 50%, #ead8f5 100%)",
      }}
    >
      <FloatBlob top="6%" left="5%" size={260} color="rgba(232,84,122,0.18)" delay={0} />
      <FloatBlob top="58%" left="86%" size={180} color="rgba(245,200,66,0.16)" delay={2} />
      <FloatBlob top="80%" left="-2%" size={300} color="rgba(184,156,224,0.22)" delay={4} />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 pt-24 md:pt-32 pb-20 min-h-screen flex flex-col">
        <div className="text-center mb-10 md:mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="section-eyebrow-rose mb-3"
          >
            ✦ Feedback Wall
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
            className="section-script"
          >
            What Founders Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-5 max-w-xl mx-auto text-[14px] md:text-[15px] italic"
            style={{ color: "var(--color-text-body)" }}
          >
            Five stories. One bundle. Click below to fan them out and feel the
            effect they felt.
          </motion.p>
        </div>

        {/* PREVIEW STACK — three peeking cards inviting click */}
        <div className="relative h-[300px] md:h-[340px] flex items-center justify-center mb-12">
          <PeekCard tilt={-10} x={-160} delay={0.1} feedback={FEEDBACK[0]} />
          <PeekCard tilt={0} x={0} delay={0.25} feedback={FEEDBACK[1]} highlight />
          <PeekCard tilt={10} x={160} delay={0.4} feedback={FEEDBACK[2]} />
        </div>

        {/* BUNDLE BUTTON */}
        <div className="text-center">
          <motion.button
            onClick={() => setBundleOpen(true)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.97 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="cta-solid"
          >
            <span>✦</span>
            Open The Bundle
            <span className="text-base">→</span>
          </motion.button>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-4 text-[11px] tracking-[0.4em] uppercase"
            style={{ color: "var(--color-text-muted)" }}
          >
            {FEEDBACK.length} stories · click to fan them out
          </motion.p>
        </div>
      </div>

      <AnimatePresence>
        {bundleOpen && (
          <BundleDeck feedback={FEEDBACK} onClose={() => setBundleOpen(false)} />
        )}
      </AnimatePresence>
    </section>
  );
}

// ====================================================================

function PeekCard({
  tilt,
  x,
  delay,
  feedback,
  highlight = false,
}: {
  tilt: number;
  x: number;
  delay: number;
  feedback: (typeof FEEDBACK)[0];
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotate: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt, scale: 1, x }}
      whileHover={{ y: -10, rotate: tilt * 0.4, scale: 1.04, zIndex: 30 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay, type: "spring", damping: 16, stiffness: 110 }}
      className="absolute glass p-7 w-[260px] md:w-[300px]"
      style={{
        zIndex: highlight ? 20 : 10,
        background: highlight
          ? "linear-gradient(140deg, rgba(255,255,255,0.95), rgba(255,220,232,0.85))"
          : undefined,
        boxShadow: highlight
          ? "0 30px 70px rgba(232,84,122,0.3)"
          : undefined,
      }}
    >
      <span className="text-3xl leading-none" style={{ color: "#f5c842" }}>
        &ldquo;
      </span>
      <p
        className="italic text-[13px] md:text-[14px] mt-2 leading-relaxed line-clamp-4"
        style={{ color: "var(--color-text-deep)" }}
      >
        {feedback.quote}
      </p>
      <div
        className="mt-5 pt-3 border-t"
        style={{ borderColor: "rgba(232,84,122,0.18)" }}
      >
        <p
          className="text-[10px] tracking-[0.3em] uppercase font-bold"
          style={{ color: "#e8547a" }}
        >
          {feedback.metric}
        </p>
        <p
          className="font-semibold text-[13px] mt-1"
          style={{ color: "var(--color-text-deep)" }}
        >
          {feedback.name}
        </p>
        <p
          className="text-[10px] tracking-[0.18em] uppercase"
          style={{ color: "var(--color-text-muted)" }}
        >
          {feedback.role}
        </p>
      </div>
    </motion.div>
  );
}

// ====================================================================

function FloatBlob({
  size,
  top,
  left,
  color,
  delay,
}: {
  size: number;
  top: string;
  left: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      aria-hidden
      animate={{
        y: [0, -22, 0],
        x: [0, 12, 0],
        scale: [1, 1.06, 1],
      }}
      transition={{
        duration: 7 + delay,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute rounded-full pointer-events-none blur-3xl"
      style={{ width: size, height: size, top, left, background: color }}
    />
  );
}

// ====================================================================

function BundleDeck({
  feedback,
  onClose,
}: {
  feedback: typeof FEEDBACK;
  onClose: () => void;
}) {
  const [dismissed, setDismissed] = useState<number[]>([]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const visible = feedback.filter((_, i) => !dismissed.includes(i));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 200 }}
      onClick={onClose}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(61,26,77,0.55)",
          backdropFilter: "blur(20px)",
        }}
      />

      <button
        onClick={onClose}
        className="absolute top-6 right-6 md:top-10 md:right-10 z-10 w-12 h-12 rounded-full border border-white/40 hover:border-white hover:bg-white/15 flex items-center justify-center text-white text-lg transition"
        aria-label="Close bundle"
      >
        ✕
      </button>

      <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center px-4 z-10">
        <p
          className="text-[10px] tracking-[0.5em] uppercase mb-2"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          The Bundle
        </p>
        <h3
          className="font-black text-white"
          style={{
            fontFamily: "var(--font-script), cursive",
            fontSize: "clamp(40px, 6vw, 76px)",
            textShadow: "0 4px 30px rgba(232,84,122,0.5)",
          }}
        >
          Five Stories
        </h3>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-center px-4">
        <p
          className="text-[11px] tracking-[0.4em] uppercase"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Hover · click a card to dismiss · esc to close
        </p>
      </div>

      <div
        className="relative w-full max-w-[1100px] h-[60vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {visible.map((t, idx) => {
          const total = visible.length;
          const center = (total - 1) / 2;
          const angle = (idx - center) * 12;
          const xOffset = (idx - center) * 110;
          const yOffset = Math.abs(idx - center) * 18;
          const realIndex = feedback.indexOf(t);
          return (
            <motion.article
              key={realIndex}
              initial={{ opacity: 0, y: 240, rotate: 0, x: 0, scale: 0.7 }}
              animate={{
                opacity: 1,
                y: yOffset,
                rotate: angle,
                x: xOffset,
                scale: 1,
              }}
              exit={{ opacity: 0, y: 200, rotate: 0, scale: 0.6 }}
              transition={{
                delay: idx * 0.08,
                type: "spring",
                damping: 16,
                stiffness: 120,
              }}
              whileHover={{
                y: yOffset - 30,
                rotate: angle * 0.3,
                scale: 1.06,
                zIndex: 60,
              }}
              onClick={() => setDismissed((d) => [...d, realIndex])}
              className="absolute cursor-pointer p-7 md:p-8 w-[260px] md:w-[300px] flex flex-col justify-between rounded-3xl"
              style={{
                height: 360,
                zIndex: 30 - Math.abs(idx - center),
                background: "rgba(255,255,255,0.96)",
                boxShadow: "0 30px 70px rgba(61,26,77,0.45)",
                border: "1px solid rgba(232,84,122,0.3)",
              }}
            >
              <div>
                <span
                  className="text-4xl leading-none"
                  style={{ color: "#f5c842" }}
                >
                  &ldquo;
                </span>
                <p
                  className="italic text-[14px] md:text-[15px] leading-relaxed mt-2"
                  style={{ color: "var(--color-text-deep)" }}
                >
                  {t.quote}
                </p>
              </div>
              <div
                className="mt-6 pt-5 border-t"
                style={{ borderColor: "rgba(232,84,122,0.2)" }}
              >
                <p
                  className="text-[10px] tracking-[0.3em] uppercase font-bold mb-2"
                  style={{ color: "#e8547a" }}
                >
                  {t.metric}
                </p>
                <p
                  className="font-semibold text-[14px]"
                  style={{ color: "var(--color-text-deep)" }}
                >
                  {t.name}
                </p>
                <p
                  className="text-[11px] tracking-[0.18em] uppercase mt-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {t.role}
                </p>
              </div>
            </motion.article>
          );
        })}

        {visible.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p
              className="text-white"
              style={{
                fontFamily: "var(--font-script), cursive",
                fontSize: "clamp(40px, 6vw, 80px)",
              }}
            >
              That's the bundle.
            </p>
            <button
              onClick={() => setDismissed([])}
              className="cta-outline mt-6"
              style={{ color: "white", borderColor: "white" }}
            >
              Replay deck
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
