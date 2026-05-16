"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

/**
 * "Inside the Studio" — a cinematic 3D scroll showcase of the platform
 * (admin command center, the living calendar, client experience, team
 * workshop). Faithful CSS recreations of the real dashboards so it stays
 * crisp at any resolution and on-brand. Sits in the stacked-scroll deck
 * between Testimonials and the final CTA.
 */
export default function Studio() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Scroll-driven 3D: the screen cluster tilts from deep perspective to flat
  const clusterRotX = useTransform(scrollYProgress, [0, 0.5, 1], [16, 2, -8]);
  const clusterY = useTransform(scrollYProgress, [0, 1], ["12%", "-12%"]);
  const portraitY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);

  return (
    <section
      ref={ref}
      id="studio"
      className="stack-card relative min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 20% 18%, rgba(255,205,222,0.85), transparent 55%)," +
          "radial-gradient(ellipse at 84% 78%, rgba(205,185,242,0.7), transparent 55%)," +
          "linear-gradient(135deg, #fff5f4 0%, #fbe5ee 50%, #ead8f5 100%)",
      }}
    >
      {/* soft floating orbs */}
      <motion.div
        aria-hidden
        className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(232,84,122,0.16)" }}
        animate={{ y: [0, 26, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-28 right-[-60px] w-[460px] h-[460px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(184,156,224,0.18)" }}
        animate={{ y: [0, -28, 0], scale: [1, 1.07, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-[1500px] mx-auto px-6 md:px-12 pt-24 md:pt-28 pb-20 min-h-screen grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
        {/* LEFT — story + founder portrait */}
        <div className="lg:col-span-5 relative">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="section-eyebrow-rose mb-4"
          >
            ✦ Inside The Studio
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className="section-script"
            style={{ fontSize: "clamp(40px, 5.4vw, 80px)", lineHeight: 1.02 }}
          >
            Not just content.
            <br />A command center.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="mt-6 text-[15px] md:text-[16px] leading-relaxed max-w-md"
            style={{ color: "var(--color-text-body)" }}
          >
            Behind every post is a calm, cinematic platform your whole team —
            and your client — actually loves to open. Built in-house, designed
            like the brands we serve.
          </motion.p>

          {/* Founder portrait (the new image) */}
          <motion.div
            style={{ y: portraitY }}
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative mt-10 h-[300px] md:h-[420px] w-full max-w-[420px]"
          >
            <div
              aria-hidden
              className="absolute inset-x-6 bottom-4 top-10 rounded-[40px]"
              style={{
                background:
                  "linear-gradient(160deg, rgba(232,84,122,0.30), rgba(184,156,224,0.28))",
                filter: "blur(2px)",
              }}
            />
            <Image
              src="/garima-studio.png"
              alt="Garima Rana — founder"
              fill
              sizes="(max-width: 1024px) 80vw, 36vw"
              style={{ objectFit: "contain", objectPosition: "bottom center" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.6, rotate: 10 }}
              whileInView={{ opacity: 1, scale: 1, rotate: -6 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, type: "spring", damping: 12 }}
              className="absolute -bottom-2 -right-2 px-5 py-3 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #e8547a, #b89ce0)",
                color: "white",
                boxShadow: "0 16px 40px rgba(232,84,122,0.4)",
                fontFamily: "var(--font-script), cursive",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              built by the studio ✦
            </motion.div>
          </motion.div>
        </div>

        {/* RIGHT — 3D screen cluster */}
        <div
          className="lg:col-span-7 relative"
          style={{ perspective: 1600 }}
        >
          <motion.div
            style={{
              rotateX: clusterRotX,
              y: clusterY,
              transformStyle: "preserve-3d",
            }}
            className="relative h-[440px] md:h-[560px]"
          >
            <ScreenCard
              z={0}
              x="6%"
              y="2%"
              tilt={-9}
              delay={0.1}
              w="68%"
              label="Admin · Command center"
              caption="Every brand & soul on the team, one glance."
            >
              <AdminMock />
            </ScreenCard>

            <ScreenCard
              z={70}
              x="30%"
              y="26%"
              tilt={7}
              delay={0.28}
              w="64%"
              label="Calendar · Build together"
              caption="Client leaves notes, approves in a click."
              highlight
            >
              <CalendarMock />
            </ScreenCard>

            <ScreenCard
              z={140}
              x="2%"
              y="52%"
              tilt={-5}
              delay={0.46}
              w="52%"
              label="Client · Cared for"
              caption="Welcome → approve → a message away."
            >
              <ClientMock />
            </ScreenCard>

            <ScreenCard
              z={120}
              x="56%"
              y="60%"
              tilt={9}
              delay={0.6}
              w="44%"
              label="Team · Always on"
              caption="Priorities & due-soon, never missed."
            >
              <TeamMock />
            </ScreenCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ===================================================================
// Floating 3D screen frame
// ===================================================================
function ScreenCard({
  children,
  label,
  caption,
  x,
  y,
  z,
  tilt,
  w,
  delay,
  highlight = false,
}: {
  children: React.ReactNode;
  label: string;
  caption: string;
  x: string;
  y: string;
  z: number;
  tilt: number;
  w: string;
  delay: number;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 70, rotateY: tilt < 0 ? -22 : 22, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, rotateY: tilt, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay, type: "spring", damping: 18, stiffness: 90 }}
      className="absolute"
      style={{
        left: x,
        top: y,
        width: w,
        zIndex: highlight ? 40 : 20,
        transform: `translateZ(${z}px)`,
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.92)",
          border: highlight
            ? "1px solid rgba(232,84,122,0.5)"
            : "1px solid rgba(232,84,122,0.22)",
          boxShadow: highlight
            ? "0 40px 90px rgba(232,84,122,0.34)"
            : "0 26px 70px rgba(155,127,199,0.3)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* browser chrome */}
        <div
          className="flex items-center gap-1.5 px-3 py-2"
          style={{
            background:
              "linear-gradient(90deg, rgba(232,84,122,0.12), rgba(184,156,224,0.12))",
            borderBottom: "1px solid rgba(232,84,122,0.16)",
          }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: "#e8547a" }} />
          <span className="w-2 h-2 rounded-full" style={{ background: "#f5c842" }} />
          <span className="w-2 h-2 rounded-full" style={{ background: "#b89ce0" }} />
        </div>
        <div className="p-3.5">{children}</div>
      </div>
      <div className="mt-3">
        <p
          className="text-[10px] tracking-[0.26em] uppercase font-bold"
          style={{ color: "#c23b68" }}
        >
          {label}
        </p>
        <p
          className="text-[12px] mt-0.5"
          style={{ color: "var(--color-text-body)" }}
        >
          {caption}
        </p>
      </div>
    </motion.div>
  );
}

// ===================================================================
// Mini dashboard mockups — mirror the real UI patterns
// ===================================================================
const BAR = "rgba(61,26,77,0.12)";

function AdminMock() {
  return (
    <div className="flex gap-3" style={{ minHeight: 150 }}>
      <div
        className="w-[64px] rounded-lg p-2 flex flex-col gap-2"
        style={{ background: "rgba(184,156,224,0.16)" }}
      >
        <div className="h-2.5 rounded" style={{ background: "linear-gradient(90deg,#e8547a,#b89ce0)" }} />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-2 rounded" style={{ background: BAR }} />
        ))}
      </div>
      <div className="flex-1">
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { n: "1", l: "Admins", c: "#e8547a" },
            { n: "3", l: "PMs", c: "#b89ce0" },
            { n: "7", l: "Interns", c: "#f5c842" },
            { n: "12", l: "Clients", c: "#ff8aab" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-lg p-2 text-center"
              style={{ background: "rgba(255,255,255,0.8)", border: `1px solid ${s.c}33` }}
            >
              <p className="font-black" style={{ fontSize: 16, color: s.c, lineHeight: 1 }}>
                {s.n}
              </p>
              <p className="text-[7px] tracking-[0.18em] uppercase mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {s.l}
              </p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="rounded-lg p-2.5"
              style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(232,84,122,0.16)" }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[7px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "rgba(76,175,108,0.18)", color: "#1f7a3c" }}>
                  ACTIVE
                </span>
              </div>
              <div className="h-2 rounded w-3/4 mb-1" style={{ background: "rgba(61,26,77,0.5)" }} />
              <div className="h-1.5 rounded w-1/2" style={{ background: BAR }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalendarMock() {
  const rows = [
    ["May 16", "Reel", "Brand", "in_production"],
    ["May 18", "Carousel", "Product", "ready"],
    ["May 20", "Reel", "Educational", "draft"],
  ];
  return (
    <div style={{ minHeight: 150 }}>
      <div className="flex items-center justify-between mb-2">
        <div className="h-2.5 w-24 rounded" style={{ background: "rgba(61,26,77,0.45)" }} />
        <span
          className="text-[7px] px-2 py-0.5 rounded-full font-bold"
          style={{ background: "rgba(245,200,66,0.2)", color: "#a07700" }}
        >
          SENT TO CLIENT
        </span>
      </div>
      <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(232,84,122,0.18)" }}>
        <div
          className="grid grid-cols-5 gap-1 px-2 py-1.5"
          style={{ background: "linear-gradient(90deg,rgba(232,84,122,0.12),rgba(184,156,224,0.12))" }}
        >
          {["Date", "Type", "Pillar", "Client", "Status"].map((h) => (
            <span key={h} className="text-[7px] tracking-[0.12em] uppercase font-bold" style={{ color: "var(--color-text-deep)" }}>
              {h}
            </span>
          ))}
        </div>
        {rows.map((r, i) => (
          <div
            key={i}
            className="grid grid-cols-5 gap-1 px-2 py-2 items-center"
            style={{ borderTop: "1px solid rgba(232,84,122,0.12)", background: i % 2 ? "rgba(255,255,255,0.5)" : "transparent" }}
          >
            <span className="text-[8px] font-semibold" style={{ color: "var(--color-text-deep)" }}>{r[0]}</span>
            <span className="text-[8px]" style={{ color: "var(--color-text-body)" }}>{r[1]}</span>
            <span className="text-[8px]" style={{ color: "var(--color-text-body)" }}>{r[2]}</span>
            <span className="h-2 rounded" style={{ background: "rgba(232,84,122,0.18)" }} />
            <span className="text-[7px] px-1.5 py-0.5 rounded-full font-bold text-center" style={{ background: "rgba(184,156,224,0.22)", color: "#5d3a8c" }}>
              {r[3]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClientMock() {
  return (
    <div style={{ minHeight: 150 }}>
      <p
        className="text-[13px] mb-1"
        style={{ fontFamily: "var(--font-script), cursive", fontWeight: 700, color: "var(--color-text-deep)" }}
      >
        Welcome, Priya ✦
      </p>
      <p className="text-[8px] mb-3" style={{ color: "var(--color-text-muted)" }}>
        Your calendar is ready for review
      </p>
      <div className="flex gap-2 mb-3">
        <div
          className="flex-1 text-center text-[8px] font-bold py-1.5 rounded-lg text-white"
          style={{ background: "linear-gradient(135deg,#e8547a,#b89ce0)" }}
        >
          ✦ Approve
        </div>
        <div
          className="flex-1 text-center text-[8px] font-bold py-1.5 rounded-lg"
          style={{ background: "rgba(255,255,255,0.8)", color: "#c23b68", border: "1px solid rgba(232,84,122,0.35)" }}
        >
          Request changes
        </div>
      </div>
      <div className="space-y-1.5">
        <div
          className="ml-auto w-3/4 rounded-xl rounded-br-sm px-2.5 py-1.5"
          style={{ background: "linear-gradient(135deg,#e8547a,#b89ce0)" }}
        >
          <div className="h-1.5 rounded w-full bg-white/70 mb-1" />
          <div className="h-1.5 rounded w-1/2 bg-white/50" />
        </div>
        <div
          className="w-2/3 rounded-xl rounded-bl-sm px-2.5 py-1.5"
          style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(232,84,122,0.18)" }}
        >
          <div className="h-1.5 rounded w-full mb-1" style={{ background: BAR }} />
          <div className="h-1.5 rounded w-2/3" style={{ background: BAR }} />
        </div>
      </div>
    </div>
  );
}

function TeamMock() {
  return (
    <div className="space-y-2" style={{ minHeight: 150 }}>
      {[
        { t: "Edit reel — Founder origin", b: "#e8547a", badge: "⏰ DUE SOON" },
        { t: "Carousel — Behind the lab", b: "#f5c842", badge: "" },
      ].map((task, i) => (
        <div
          key={i}
          className="rounded-lg p-2.5 relative overflow-hidden"
          style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(232,84,122,0.16)" }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: task.b }} />
          <div className="flex items-center gap-1.5 mb-1.5 pl-1.5 flex-wrap">
            <span className="text-[7px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${task.b}22`, color: task.b }}>
              HIGH
            </span>
            {task.badge && (
              <span className="text-[7px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "rgba(232,84,122,0.16)", color: "#c23b68" }}>
                {task.badge}
              </span>
            )}
          </div>
          <div className="h-2 rounded w-4/5 ml-1.5 mb-1" style={{ background: "rgba(61,26,77,0.5)" }} />
          <div className="h-1.5 rounded w-1/2 ml-1.5" style={{ background: BAR }} />
        </div>
      ))}
      <div
        className="text-center text-[8px] font-bold py-1.5 rounded-lg text-white"
        style={{ background: "linear-gradient(135deg,#e8547a,#b89ce0)" }}
      >
        Open &amp; Submit →
      </div>
    </div>
  );
}
