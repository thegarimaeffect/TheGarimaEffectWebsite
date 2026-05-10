"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const NAV_LINKS = [
  { label: "HOME", href: "#hero" },
  { label: "SERVICES", href: "#services" },
  { label: "TESTIMONIALS", href: "#testimonials" },
  { label: "ABOUT", href: "#about" },
  { label: "BLOG", href: "#blog" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
      className="absolute top-0 left-0 right-0 z-30 px-6 md:px-10 py-6"
    >
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">
        {/* LOGO */}
        <a
          href="#hero"
          className="flex items-center gap-2 text-white font-bold tracking-[0.18em] text-sm uppercase"
        >
          <span style={{ color: "#f5c842" }}>✦</span>
          <span>Garima Effect</span>
        </a>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex items-center gap-9">
          {NAV_LINKS.map((l, i) => (
            <a
              key={l.label}
              href={l.href}
              className="relative text-[12px] font-semibold tracking-[0.22em] text-white/85 hover:text-white transition-colors"
            >
              {l.label}
              {i < NAV_LINKS.length - 1 && (
                <span className="absolute -right-5 top-1/2 -translate-y-1/2 text-white/30">
                  ·
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-5">
          <IconButton aria-label="Search">
            <SearchIcon />
          </IconButton>
          <IconButton aria-label="Profile">
            <UserIcon />
          </IconButton>
          <IconButton
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden"
          >
            <MenuIcon />
          </IconButton>
        </div>
      </div>

      {/* MOBILE PANEL */}
      {open && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden mt-6 mx-auto max-w-md glass p-6 flex flex-col gap-4"
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-[13px] font-semibold tracking-[0.22em] text-white/90"
            >
              {l.label}
            </a>
          ))}
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
      className={`w-9 h-9 rounded-full border border-white/30 hover:border-white hover:bg-white/10 flex items-center justify-center transition ${className}`}
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
