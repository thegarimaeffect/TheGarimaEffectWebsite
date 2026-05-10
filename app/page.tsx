"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import IntroAnimation from "@/components/IntroAnimation";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import CalendlyDrawer from "@/components/CalendlyDrawer";

export default function HomePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openCalendly = () => setDrawerOpen(true);
  const closeCalendly = () => setDrawerOpen(false);

  return (
    <>
      {/* Splash / butterfly intro */}
      <IntroAnimation />

      {/* Main page content */}
      <main className="relative">
        <Navbar />

        <Hero />
        <Services />
        <Testimonials />
        <FinalCTA onBookCall={openCalendly} />
        <Footer />

        {/* STICKY VERTICAL "BOOK A CALL" BUTTON (right edge) */}
        <motion.button
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 4.6, duration: 0.6, ease: "easeOut" }}
          onClick={openCalendly}
          aria-label="Book a call"
          className="sticky-cta hidden md:flex"
          style={{
            position: "fixed",
            right: "-4px",
            top: "50%",
            transform: "translateY(-50%) rotate(-90deg)",
            transformOrigin: "right center",
            background: "linear-gradient(135deg, #e8547a 0%, #9b7fc7 100%)",
            color: "white",
            fontWeight: 700,
            letterSpacing: "0.32em",
            fontSize: "11px",
            textTransform: "uppercase",
            padding: "14px 28px",
            borderRadius: "999px 999px 0 0",
            zIndex: 50,
            whiteSpace: "nowrap",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          ✦ Book a Call
        </motion.button>

        {/* Mobile floating action button */}
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.6, duration: 0.6 }}
          onClick={openCalendly}
          aria-label="Book a call"
          className="md:hidden sticky-cta"
          style={{
            position: "fixed",
            right: "20px",
            bottom: "20px",
            background: "linear-gradient(135deg, #e8547a 0%, #9b7fc7 100%)",
            color: "white",
            fontWeight: 700,
            fontSize: "11px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            padding: "14px 22px",
            borderRadius: "999px",
            zIndex: 50,
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          ✦ Book a Call
        </motion.button>
      </main>

      {/* Calendly slide-in drawer */}
      <CalendlyDrawer open={drawerOpen} onClose={closeCalendly} />
    </>
  );
}
