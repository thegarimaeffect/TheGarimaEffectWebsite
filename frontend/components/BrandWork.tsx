"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const PROJECTS = [
  {
    n: "01",
    client: "Lumen Skincare",
    cat: "Brand · Reels · Funnel",
    headline: "From 8K to 142K in 90 days",
    body: "Repositioned a clean-beauty label, scripted a 12-part founder series, and built the launch funnel that drove their best-ever quarter.",
    tone: "rose",
    art: "phone",
    palette: ["#ff6b9d", "#ffb3cc", "#fff4f6"],
  },
  {
    n: "02",
    client: "NorthLane Studio",
    cat: "Strategy · Scripts",
    headline: "A studio voice that closes deals",
    body: "Built a brand pillar system, weekly content cadence, and DM-to-call funnel. Inquiries 6×'d. Waitlist now 3 months out.",
    tone: "violet",
    art: "post",
    palette: ["#b89ce0", "#ddc8f0", "#fff4f9"],
  },
  {
    n: "03",
    client: "Bloom &amp; Co.",
    cat: "UGC · Reels",
    headline: "2.3M views. 14K saves. One reel.",
    body: "Wrote, shot, edited and shipped a six-reel arc that turned a single product into the brand's signature moment.",
    tone: "gold",
    art: "metric",
    palette: ["#f5c842", "#ffe6a0", "#fffaf0"],
  },
  {
    n: "04",
    client: "Tide & Tonic",
    cat: "Storytelling",
    headline: "A founder's voice — finally on the page",
    body: "Translated a chaotic founder vision into a brand book, signature posts, and a launch story that finally sounded like them.",
    tone: "rose",
    art: "post",
    palette: ["#e8547a", "#ffd0dc", "#fff4f5"],
  },
  {
    n: "05",
    client: "Wildflower",
    cat: "Growth · Funnels",
    headline: "+89% engagement, +210% qualified leads",
    body: "Rebuilt the lead-magnet flow, scripted weekly carousels, designed a saves-driven content engine for a wellness brand.",
    tone: "violet",
    art: "metric",
    palette: ["#9b7fc7", "#d4c0ee", "#f8f3ff"],
  },
];

export default function BrandWork() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Map vertical scroll to horizontal translate.
  // We move the track from 0 to -(N-1) * 100vw / N - so 5 cards move 4/5 of the way.
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ["0vw", `-${(PROJECTS.length - 1) * 86}vw`]
  );

  return (
    <section id="work" className="stack-card relative">
      {/* Outer wrapper — vertical height controls how much horizontal scroll happens */}
      <div
        ref={ref}
        style={{ height: `${PROJECTS.length * 90}vh` }}
        className="relative"
      >
        {/* Pinned viewport */}
        <div
          className="sticky top-0 h-screen w-screen overflow-hidden flex flex-col"
          style={{
            background:
              "radial-gradient(ellipse at 70% 20%, rgba(255,200,220,0.6), transparent 55%)," +
              "radial-gradient(ellipse at 20% 80%, rgba(200,170,240,0.55), transparent 55%)," +
              "linear-gradient(135deg, #fff0f5 0%, #f5dff0 50%, #ead8f5 100%)",
          }}
        >
          {/* Section header */}
          <div className="relative z-20 px-6 md:px-12 pt-24 md:pt-28 max-w-[1500px] mx-auto w-full">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <p className="section-eyebrow-rose mb-3">
                  ✦ The Brand Work
                </p>
                <h2
                  className="section-script"
                  style={{ fontSize: "clamp(44px, 6.5vw, 92px)" }}
                >
                  Selected Projects
                </h2>
              </div>
              <div className="text-right">
                <p
                  className="text-[11px] tracking-[0.4em] uppercase mb-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Scroll → to explore
                </p>
                <p
                  className="text-[12px] tracking-[0.18em] font-bold"
                  style={{ color: "var(--color-text-deep)" }}
                >
                  {PROJECTS.length} Case Studies
                </p>
              </div>
            </div>
            {/* Progress rail */}
            <div
              className="mt-8 h-[3px] w-full rounded-full overflow-hidden"
              style={{ background: "rgba(232,84,122,0.15)" }}
            >
              <motion.div
                style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
                className="h-full"
              >
                <div
                  className="h-full"
                  style={{
                    background:
                      "linear-gradient(90deg, #e8547a 0%, #b89ce0 100%)",
                  }}
                />
              </motion.div>
            </div>
          </div>

          {/* Horizontal track */}
          <motion.div
            style={{ x }}
            className="flex items-center gap-6 md:gap-10 mt-12 md:mt-16 pl-6 md:pl-12 flex-1"
          >
            {PROJECTS.map((p, i) => (
              <ProjectCard key={p.n} project={p} index={i} />
            ))}

            {/* End slate */}
            <div className="flex-shrink-0 w-[80vw] md:w-[60vw] flex items-center justify-center pr-12">
              <div className="text-center max-w-md">
                <p
                  className="text-[10px] tracking-[0.5em] uppercase mb-4"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  ✦ End of Reel
                </p>
                <h3
                  className="section-script"
                  style={{ fontSize: "clamp(40px, 5vw, 70px)" }}
                >
                  Ready to be next?
                </h3>
                <p
                  className="mt-4 text-[14px]"
                  style={{ color: "var(--color-text-body)" }}
                >
                  60+ brands and counting. The bench has room for one more.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ====================================================================

function ProjectCard({
  project: p,
  index,
}: {
  project: (typeof PROJECTS)[0];
  index: number;
}) {
  return (
    <article
      className="flex-shrink-0 w-[80vw] md:w-[58vw] lg:w-[52vw] h-[64vh] md:h-[68vh] grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 rounded-[36px] p-6 md:p-10 relative overflow-hidden"
      style={{
        background: `linear-gradient(140deg, ${p.palette[2]} 0%, ${p.palette[1]} 60%, ${p.palette[0]}40 100%)`,
        border: "1px solid rgba(232,84,122,0.18)",
        boxShadow: "0 30px 80px rgba(155,127,199,0.22)",
      }}
    >
      {/* Number watermark */}
      <span
        aria-hidden
        className="absolute -top-6 -right-2 font-black"
        style={{
          fontFamily: "var(--font-display), Impact, sans-serif",
          fontSize: "clamp(160px, 22vw, 320px)",
          color: p.palette[0],
          opacity: 0.18,
          lineHeight: 1,
        }}
      >
        {p.n}
      </span>

      {/* LEFT: visual mock */}
      <div className="md:col-span-2 relative flex items-center justify-center">
        <ProjectArt variant={p.art as "phone" | "post" | "metric"} palette={p.palette} />
      </div>

      {/* RIGHT: copy */}
      <div className="md:col-span-3 flex flex-col justify-between relative">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span
              className="text-xs tracking-[0.4em] uppercase font-bold"
              style={{ color: p.palette[0] }}
            >
              Case · {p.n}
            </span>
            <span
              className="h-px flex-1"
              style={{ background: `${p.palette[0]}55` }}
            />
          </div>
          <h3
            className="font-black uppercase mb-2 leading-[1.05]"
            style={{
              fontFamily: "var(--font-display), Impact, sans-serif",
              fontSize: "clamp(28px, 3.4vw, 56px)",
              color: "var(--color-text-deep)",
            }}
          >
            {p.client}
          </h3>
          <p
            className="text-[11px] tracking-[0.3em] uppercase mb-6"
            style={{ color: "var(--color-text-muted)" }}
          >
            {p.cat}
          </p>
          <p
            className="text-[18px] md:text-[22px] leading-tight font-bold mb-4"
            style={{ color: p.palette[0] }}
            dangerouslySetInnerHTML={{ __html: p.headline }}
          />
          <p
            className="text-[14px] md:text-[15px] leading-relaxed max-w-md"
            style={{ color: "var(--color-text-body)" }}
          >
            {p.body}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <span
            className="text-[10px] tracking-[0.5em] uppercase font-bold"
            style={{ color: "var(--color-text-deep)" }}
          >
            0{index + 1} / 0{PROJECTS.length}
          </span>
          <button
            className="text-[12px] tracking-[0.3em] uppercase font-bold flex items-center gap-2 group"
            style={{ color: p.palette[0] }}
          >
            View story
            <span className="group-hover:translate-x-1 transition">→</span>
          </button>
        </div>
      </div>
    </article>
  );
}

// ====================================================================

function ProjectArt({
  variant,
  palette,
}: {
  variant: "phone" | "post" | "metric";
  palette: string[];
}) {
  if (variant === "phone") {
    return (
      <div
        className="w-[200px] h-[400px] md:w-[230px] md:h-[460px] rounded-[42px] p-[10px] relative"
        style={{
          background: `linear-gradient(160deg, ${palette[0]} 0%, ${palette[2]} 100%)`,
          boxShadow: `0 30px 70px ${palette[0]}66, 0 0 0 1px rgba(255,255,255,0.4)`,
        }}
      >
        <div
          className="w-full h-full rounded-[33px] relative overflow-hidden"
          style={{
            background: `linear-gradient(180deg, ${palette[1]}, ${palette[2]})`,
          }}
        >
          {/* notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/70 rounded-full" />
          {/* mock content */}
          <div className="absolute inset-x-4 top-12 space-y-3">
            {[0.9, 0.7, 0.5].map((w, i) => (
              <div
                key={i}
                className="h-2 rounded-full"
                style={{
                  width: `${w * 100}%`,
                  background: `${palette[0]}66`,
                }}
              />
            ))}
          </div>
          <div className="absolute inset-x-4 bottom-12 space-y-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-12 rounded-2xl flex items-center px-3 gap-2"
                style={{ background: "rgba(255,255,255,0.85)" }}
              >
                <div
                  className="w-7 h-7 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`,
                  }}
                />
                <div className="flex-1 space-y-1">
                  <div
                    className="h-1.5 rounded-full w-3/4"
                    style={{ background: `${palette[0]}88` }}
                  />
                  <div
                    className="h-1 rounded-full w-1/2"
                    style={{ background: "rgba(0,0,0,0.15)" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div
            className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-xl text-[10px] font-bold tracking-[0.2em] text-center uppercase"
            style={{ background: palette[0], color: "white" }}
          >
            ✦ Live now
          </div>
        </div>
      </div>
    );
  }

  if (variant === "post") {
    return (
      <div
        className="w-[260px] md:w-[300px] rounded-[26px] p-5 relative"
        style={{
          background: "rgba(255,255,255,0.95)",
          boxShadow: `0 30px 70px ${palette[0]}55`,
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-full p-[2px]"
            style={{
              background: `linear-gradient(135deg, ${palette[0]}, ${palette[2]})`,
            }}
          >
            <div className="w-full h-full rounded-full bg-white p-[2px]">
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`,
                }}
              />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-black">garima.effect</p>
            <p className="text-[9px] text-gray-500">Sponsored</p>
          </div>
          <span className="text-gray-400 text-lg">⋯</span>
        </div>
        <div
          className="aspect-square rounded-2xl relative overflow-hidden flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]}, ${palette[2]})`,
          }}
        >
          <p
            className="text-white text-center font-bold leading-tight px-3"
            style={{
              fontFamily: "var(--font-script), cursive",
              fontSize: 26,
              textShadow: "0 2px 12px rgba(0,0,0,0.3)",
            }}
          >
            from concept
            <br />
            to content
          </p>
        </div>
        <div className="flex items-center justify-between text-black mt-3">
          <div className="flex gap-2 text-lg">
            <span>♥</span>
            <span>💬</span>
            <span>↗</span>
          </div>
          <span className="text-lg">🔖</span>
        </div>
        <p className="text-[10px] font-bold mt-1 text-black">14,392 likes</p>
      </div>
    );
  }

  // metric
  return (
    <div
      className="w-[260px] h-[320px] rounded-[28px] p-7 flex flex-col justify-between relative overflow-hidden"
      style={{
        background: `linear-gradient(140deg, ${palette[2]}, ${palette[1]})`,
        border: `2px solid ${palette[0]}55`,
        boxShadow: `0 30px 70px ${palette[0]}55`,
      }}
    >
      <div
        aria-hidden
        className="absolute -top-16 -right-8 w-44 h-44 rounded-full blur-2xl"
        style={{ background: `${palette[0]}66` }}
      />
      <div className="relative">
        <p
          className="text-[10px] tracking-[0.4em] uppercase"
          style={{ color: "var(--color-text-deep)" }}
        >
          90-day result
        </p>
        <span className="text-2xl mt-2 inline-block">📈</span>
      </div>
      <div className="relative">
        <p
          className="font-black leading-none"
          style={{
            fontSize: 64,
            color: palette[0],
            textShadow: `0 4px 24px ${palette[0]}88`,
          }}
        >
          +340%
        </p>
        <p
          className="text-[13px] mt-2 leading-tight"
          style={{ color: "var(--color-text-body)" }}
        >
          Engagement growth across reels &amp; posts
        </p>
      </div>
      <div
        className="relative flex items-center justify-between text-[10px] tracking-[0.25em] uppercase font-bold"
        style={{ color: "var(--color-text-deep)" }}
      >
        <span>Lumen Skincare</span>
        <span style={{ color: palette[0] }}>✦</span>
      </div>
    </div>
  );
}
