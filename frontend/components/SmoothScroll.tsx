"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Buttery-smooth scroll for the LANDING PAGE ONLY.
 * Mounted by app/page.tsx — NOT by layout.tsx (we don't want Lenis
 * adding latency on auth and dashboard pages).
 * Lenis updates window.scrollY natively, so framer-motion useScroll,
 * IntersectionObserver, and CSS `position: sticky` keep working.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.75,                                           // snappier, less laggy
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.4,
      syncTouch: true,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}
