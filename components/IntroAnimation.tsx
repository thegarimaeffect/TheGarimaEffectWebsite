"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Butterfly from "./Butterfly";

const TITLE = "THE GARIMA EFFECT";

/**
 * Cinematic intro that plays on every page load:
 *   1. Black screen
 *   2. A thin horizontal line draws across the center of the screen
 *   3. A butterfly enters from the LEFT, fluttering along an organic
 *      slightly-erratic path that always stays ABOVE the line
 *   4. As it crosses the center, the brand name "THE GARIMA EFFECT"
 *      reveals letter-by-letter along the line
 *   5. Butterfly exits to the right
 *   6. Title holds ~1.2s, then the entire panel slides UP off the
 *      screen, revealing the homepage underneath
 *
 * No sessionStorage gate — this plays every load by design.
 */
export default function IntroAnimation() {
  const [show, setShow] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setShow(false), 5800);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          initial={{ y: 0 }}
          exit={{ y: "-100vh" }}
          transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 overflow-hidden"
          style={{ zIndex: 9999, background: "#000" }}
        >
          {/* Subtle vignette */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(60,30,60,0.35) 0%, rgba(0,0,0,1) 75%)",
            }}
          />

          {/* HORIZONTAL LINE across the middle of the screen */}
          <motion.div
            className="absolute left-0 right-0"
            style={{
              top: "50%",
              height: "1px",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(232,84,122,0.6) 12%, rgba(255,255,255,0.85) 50%, rgba(232,84,122,0.6) 88%, transparent 100%)",
              transformOrigin: "left center",
              boxShadow: "0 0 18px rgba(232,84,122,0.45)",
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.25, duration: 0.7, ease: "easeOut" }}
          />

          {/* BUTTERFLY — flies L→R along an erratic organic path,
              always staying ABOVE the center line (top < 50%) */}
          <motion.div
            className="absolute"
            initial={{ left: "-10%", top: "30%", rotate: -5, scale: 0.9, opacity: 0 }}
            animate={{
              left: ["-10%", "12%", "24%", "36%", "48%", "62%", "78%", "94%", "110%"],
              top:  ["30%",  "18%", "36%", "22%", "40%", "20%", "32%", "26%",  "30%"],
              rotate: [-5,    -14,    8,   -12,    7,   -10,    6,    -4,     0],
              scale:  [0.9,    1.0,  0.95, 1.05,  1.0,  0.95,   0.9,  0.85,  0.8],
              opacity: [0, 1, 1, 1, 1, 1, 1, 1, 0],
            }}
            transition={{
              duration: 4.2,
              delay: 0.5,
              ease: "easeInOut",
              times: [0, 0.12, 0.24, 0.36, 0.48, 0.62, 0.76, 0.9, 1],
            }}
            style={{ transform: "translate(-50%, -50%)", zIndex: 4 }}
          >
            <Butterfly size={84} color="#ff5e87" />
          </motion.div>

          {/* BRAND NAME — revealed letter by letter along the line */}
          <div
            className="absolute left-0 right-0 flex items-center justify-center px-4"
            style={{ top: "50%", transform: "translateY(-50%)", zIndex: 3 }}
          >
            <h1
              className="flex flex-wrap items-center justify-center"
              style={{
                fontFamily: "var(--font-display), Impact, sans-serif",
                fontSize: "clamp(36px, 7.2vw, 110px)",
                color: "#ffffff",
                letterSpacing: "0.06em",
                lineHeight: 1,
                textShadow: "0 4px 60px rgba(232,84,122,0.45)",
              }}
            >
              {TITLE.split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{
                    opacity: 0,
                    y: 28,
                    rotateX: 60,
                    filter: "blur(6px)",
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    filter: "blur(0px)",
                  }}
                  transition={{
                    delay: 1.7 + i * 0.07,
                    duration: 0.55,
                    ease: [0.2, 0.8, 0.2, 1],
                  }}
                  style={{
                    display: "inline-block",
                    whiteSpace: "pre",
                    transformOrigin: "50% 100%",
                  }}
                >
                  {char === " " ? "  " : char}
                </motion.span>
              ))}
            </h1>
          </div>

          {/* Tagline that fades in after title */}
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 0.85, letterSpacing: "0.55em" }}
            transition={{ delay: 3.6, duration: 0.9 }}
            className="absolute left-0 right-0 text-center"
            style={{
              top: "calc(50% + clamp(50px, 7vw, 100px))",
              color: "rgba(255,255,255,0.65)",
              fontSize: "clamp(9px, 1vw, 12px)",
              fontWeight: 600,
              textTransform: "uppercase",
              paddingLeft: "0.55em",
              zIndex: 3,
            }}
          >
            From Concept to Content
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
