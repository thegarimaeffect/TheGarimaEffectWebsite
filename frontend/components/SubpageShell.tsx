import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shared layout for SEO subpages (/about, /services, /faq, etc).
 * Lightweight, content-first design — distinct from the animated landing page.
 * Same brand palette (rose / lavender) for consistency.
 */
export default function SubpageShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #fff5f4 0%, #fde0ed 40%, #ead8f5 100%)",
        color: "#3d1a4d",
      }}
    >
      <SubpageHeader />

      <main className="max-w-[860px] mx-auto px-6 md:px-10 pt-32 pb-16">
        {eyebrow && (
          <p
            className="text-[11px] tracking-[0.4em] uppercase font-bold mb-4"
            style={{ color: "#e8547a" }}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className="font-bold leading-[1.05] mb-4"
          style={{
            fontSize: "clamp(38px, 6vw, 64px)",
            color: "#3d1a4d",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-[17px] md:text-[19px] leading-relaxed mb-10"
            style={{ color: "#5a3a6e" }}
          >
            {subtitle}
          </p>
        )}
        <div className="prose-content">{children}</div>
      </main>

      <SubpageFooter />
    </div>
  );
}

function SubpageHeader() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 px-6 md:px-10 py-4"
      style={{
        background: "rgba(255,244,245,0.85)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(232,84,122,0.18)",
      }}
    >
      <div className="flex items-center justify-between max-w-[1400px] mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold tracking-[0.18em] text-sm uppercase"
          style={{ color: "#3d1a4d" }}
        >
          <span style={{ color: "#e8547a" }}>✦</span>
          <span>Garima Effect</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          <Link href="/about" className="subpage-nav-link">About</Link>
          <Link href="/services" className="subpage-nav-link">Services</Link>
          <Link href="/case-studies" className="subpage-nav-link">Work</Link>
          <Link href="/blog" className="subpage-nav-link">Blog</Link>
          <Link href="/faq" className="subpage-nav-link">FAQ</Link>
          <Link href="/contact" className="subpage-nav-link">Contact</Link>
        </nav>

        <Link
          href="/contact"
          className="inline-flex items-center text-[11px] font-semibold tracking-[0.22em] uppercase px-4 py-2 rounded-full text-white"
          style={{
            background: "linear-gradient(135deg, #e8547a 0%, #b89ce0 100%)",
            boxShadow: "0 6px 20px rgba(232,84,122,0.35)",
          }}
        >
          Book a Call
        </Link>
      </div>
    </header>
  );
}

function SubpageFooter() {
  return (
    <footer
      className="px-6 md:px-10 py-10"
      style={{
        borderTop: "1px solid rgba(232,84,122,0.2)",
        background: "rgba(255,255,255,0.4)",
      }}
    >
      <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 text-[13px]">
        <div>
          <p className="font-bold uppercase tracking-[0.2em] text-[11px] mb-3" style={{ color: "#e8547a" }}>
            The Garima Effect
          </p>
          <p style={{ color: "#5a3a6e" }} className="leading-relaxed">
            Content & brand storytelling studio. Founded 2020, India.
          </p>
        </div>
        <FooterCol heading="Studio">
          <Link href="/about" className="footer-link">About</Link>
          <Link href="/case-studies" className="footer-link">Case studies</Link>
          <Link href="/contact" className="footer-link">Contact</Link>
        </FooterCol>
        <FooterCol heading="Services">
          <Link href="/services/content-strategy" className="footer-link">Content Strategy</Link>
          <Link href="/services/instagram-growth" className="footer-link">Instagram Growth</Link>
          <Link href="/services/founder-branding" className="footer-link">Founder Branding</Link>
        </FooterCol>
        <FooterCol heading="Read">
          <Link href="/blog" className="footer-link">Blog</Link>
          <Link href="/faq" className="footer-link">FAQ</Link>
        </FooterCol>
        <FooterCol heading="Connect">
          <a href="https://www.instagram.com/garimaeffect" className="footer-link" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.linkedin.com/in/garimarana" className="footer-link" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </FooterCol>
      </div>
      <p className="mt-10 text-center text-[11px] tracking-[0.3em] uppercase" style={{ color: "#9b7fa5" }}>
        © {new Date().getFullYear()} The Garima Effect · Made with care in India
      </p>
    </footer>
  );
}

function FooterCol({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-bold uppercase tracking-[0.2em] text-[11px] mb-3" style={{ color: "#3d1a4d" }}>
        {heading}
      </p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
