"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/**
 * Public signup is intentionally disabled — accounts are created by Admins
 * via /admin/people. This page exists to gracefully redirect anyone who
 * lands here, e.g. from an old bookmark.
 */
export default function SignupClosedPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 22% 18%, rgba(184,156,224,0.65) 0%, transparent 55%)," +
          "radial-gradient(ellipse at 78% 82%, rgba(255,200,220,0.85) 0%, transparent 55%)," +
          "linear-gradient(135deg, #fff5f4 0%, #ead8f5 45%, #fadff2 75%, #fde0ed 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-lg"
      >
        <div
          className="p-10 md:p-12 relative text-center"
          style={{
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(12px) saturate(130%)",
            border: "1px solid rgba(232,84,122,0.22)",
            borderRadius: 28,
            boxShadow: "0 30px 80px rgba(155,127,199,0.22)",
          }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-8 text-[12px] font-bold tracking-[0.18em] uppercase"
            style={{ color: "var(--color-text-deep)" }}
          >
            <span style={{ color: "#e8547a" }}>✦</span>
            Garima Effect
          </Link>

          <p
            className="text-[11px] tracking-[0.5em] uppercase font-bold mb-4"
            style={{ color: "#e8547a" }}
          >
            ✦ By Invitation Only
          </p>

          <h1
            className="section-script mb-4"
            style={{ fontSize: "clamp(38px, 5vw, 60px)" }}
          >
            We onboard you
          </h1>

          <p
            className="text-[15px] leading-relaxed mb-8 max-w-md mx-auto"
            style={{ color: "var(--color-text-body)" }}
          >
            The Garima Effect is a curated studio. Accounts are created for you
            by our team — once a campaign is briefed, we&apos;ll send your
            login over email.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:hello@garimaeffect.com?subject=I'd%20like%20to%20work%20together"
              className="cta-solid justify-center"
              style={{ padding: "14px 28px", fontSize: 12 }}
            >
              Get in touch <span>→</span>
            </a>
            <Link
              href="/login"
              className="cta-outline justify-center"
              style={{ padding: "14px 28px", fontSize: 12 }}
            >
              I have an account
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
