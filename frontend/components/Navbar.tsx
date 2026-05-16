"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "HOME", href: "#hero" },
  { label: "ABOUT", href: "#about" },
  { label: "SERVICES", href: "#services" },
  { label: "WORK", href: "#work" },
  { label: "FEEDBACK", href: "#feedback" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
      className="fixed top-0 left-0 right-0 z-40 px-6 md:px-10 py-4 transition-all"
      style={{
        background: scrolled
          ? "rgba(255,244,245,0.78)"
          : "rgba(255,244,245,0)",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(232,84,122,0.18)"
          : "1px solid transparent",
      }}
    >
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">
        {/* LOGO */}
        <a
          href="#hero"
          className="flex items-center gap-2 font-bold tracking-[0.18em] text-sm uppercase"
          style={{ color: "var(--color-text-deep)" }}
        >
          <span style={{ color: "#e8547a" }}>✦</span>
          <span>Garima Effect</span>
        </a>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((l, i) => (
            <a
              key={l.label}
              href={l.href}
              className="relative text-[12px] font-semibold tracking-[0.22em] hover:text-[#e8547a] transition-colors"
              style={{ color: "var(--color-text-deep)" }}
            >
              {l.label}
              {i < NAV_LINKS.length - 1 && (
                <span className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-30">
                  ·
                </span>
              )}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="hidden md:inline-flex items-center text-[11px] font-semibold tracking-[0.22em] uppercase px-4 py-2 rounded-full border transition hover:bg-[#e8547a] hover:text-white"
            style={{
              borderColor: "rgba(232,84,122,0.5)",
              color: "var(--color-text-deep)",
            }}
          >
            Work With Us
          </a>
          <a
            href="/login"
            className="hidden md:inline-flex items-center text-[11px] font-semibold tracking-[0.22em] uppercase px-4 py-2 rounded-full text-white transition hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #e8547a 0%, #b89ce0 100%)",
              boxShadow: "0 6px 20px rgba(232,84,122,0.35)",
            }}
          >
            Sign In
          </a>
          <IconButton
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden"
          >
            <MenuIcon />
          </IconButton>
        </div>
      </div>

      {open && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden mt-4 mx-auto max-w-md glass p-6 flex flex-col gap-4"
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-[13px] font-semibold tracking-[0.22em]"
              style={{ color: "var(--color-text-deep)" }}
            >
              {l.label}
            </a>
          ))}
          <div className="pt-3 mt-1 flex gap-2 border-t" style={{ borderColor: "rgba(232,84,122,0.18)" }}>
            <a
              href="#contact"
              className="flex-1 text-center text-[11px] font-semibold tracking-[0.22em] uppercase px-3 py-2 rounded-full border"
              style={{ borderColor: "rgba(232,84,122,0.5)", color: "var(--color-text-deep)" }}
            >
              Work With Us
            </a>
            <a
              href="/login"
              className="flex-1 text-center text-[11px] font-semibold tracking-[0.22em] uppercase px-3 py-2 rounded-full text-white"
              style={{ background: "linear-gradient(135deg, #e8547a 0%, #b89ce0 100%)" }}
            >
              Sign In
            </a>
          </div>
        </motion.nav>
      )}
    </motion.header>
  );
}

function IconButton({
  children,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={`w-9 h-9 rounded-full border border-[#e8547a]/30 hover:border-[#e8547a] hover:bg-[#e8547a]/10 flex items-center justify-center transition ${className}`}
      style={{ color: "var(--color-text-deep)" }}
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeLinecap="round" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="7" x2="21" y2="7" strokeLinecap="round" />
      <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
      <line x1="3" y1="17" x2="21" y2="17" strokeLinecap="round" />
    </svg>
  );
}
