"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import IntroAnimation from "@/components/IntroAnimation";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import FounderSpeaks from "@/components/FounderSpeaks";
import Services from "@/components/Services";
import BrandWork from "@/components/BrandWork";
import Testimonials from "@/components/Testimonials";
import Studio from "@/components/Studio";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import CalendlyDrawer from "@/components/CalendlyDrawer";
import SmoothScroll from "@/components/SmoothScroll";

export default function HomePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openCalendly = () => setDrawerOpen(true);
  const closeCalendly = () => setDrawerOpen(false);

  return (
    <>
      <SmoothScroll />
      <IntroAnimation />

      <main className="relative">
        <Navbar />

        {/* STACKED CARD SCROLL — each section sticks to top:0,
            next slides up over previous as you scroll */}
        <div className="stack-deck">
          <Hero />
          <About />
          <FounderSpeaks />
          <Services />
          <BrandWork />
          <Testimonials />
          <Studio />
          <FinalCTA onBookCall={openCalendly} />
          <Footer />
        </div>

        {/* THE ONE CTA — sticky vertical sliding "Book a Call" on the right edge */}
        <motion.button
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 5.4, duration: 0.7, ease: "easeOut" }}
          onClick={openCalendly}
          aria-label="Book a call"
          className="sticky-cta"
          style={{
            position: "fixed",
            right: "-4px",
            top: "50%",
            transform: "translateY(-50%) rotate(-90deg)",
            transformOrigin: "right center",
            background: "linear-gradient(135deg, #e8547a 0%, #b89ce0 100%)",
            color: "white",
            fontWeight: 700,
            letterSpacing: "0.32em",
            fontSize: "11px",
            textTransform: "uppercase",
            padding: "14px 28px",
            borderRadius: "999px 999px 0 0",
            zIndex: 50,
            whiteSpace: "nowrap",
            border: "1px solid rgba(255,255,255,0.35)",
          }}
        >
          ✦ Book a Call
        </motion.button>
      </main>

      <CalendlyDrawer open={drawerOpen} onClose={closeCalendly} />
    </>
  );
}
