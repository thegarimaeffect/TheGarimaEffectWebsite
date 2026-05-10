"use client";

const SERVICE_LINKS = [
  "Instagram Growth",
  "Brand Storytelling",
  "Sales Funnels",
  "UGC & Reels",
];
const SITE_LINKS = ["About", "Testimonials", "Blog", "Contact"];

export default function Footer() {
  return (
    <footer
      className="relative z-10 px-6 md:px-12 pt-24 pb-10"
      style={{ background: "#0f0f2e" }}
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 pb-16 border-b border-white/10">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3
              className="script-logo text-white text-4xl"
              style={{ fontFamily: "var(--font-script), cursive" }}
            >
              The Garima Effect
            </h3>
            <p className="mt-4 text-white/60 text-[14px] leading-relaxed max-w-xs">
              From concept to content — turning brands into magnetic stories
              that sell.
            </p>
            <div className="mt-6 flex gap-3">
              <Social label="Instagram" href="https://instagram.com">
                <InstaIcon />
              </Social>
              <Social label="LinkedIn" href="https://linkedin.com">
                <LinkedinIcon />
              </Social>
              <Social label="YouTube" href="https://youtube.com">
                <YoutubeIcon />
              </Social>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[11px] tracking-[0.3em] uppercase text-white/50 mb-5">
              Services
            </h4>
            <ul className="space-y-3">
              {SERVICE_LINKS.map((s) => (
                <li key={s}>
                  <a
                    href="#services"
                    className="text-white/85 hover:text-accent-primary text-[14px] transition"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[11px] tracking-[0.3em] uppercase text-white/50 mb-5">
              Links
            </h4>
            <ul className="space-y-3">
              {SITE_LINKS.map((l) => (
                <li key={l}>
                  <a
                    href={`#${l.toLowerCase()}`}
                    className="text-white/85 hover:text-accent-primary text-[14px] transition"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Newsletter */}
          <div>
            <h4 className="text-[11px] tracking-[0.3em] uppercase text-white/50 mb-5">
              Stay Close
            </h4>
            <p className="text-white/70 text-[14px] mb-4">
              Drop into the inbox once a month. Strategy, scripts, and stories.
            </p>
            <a
              href="mailto:hello@garimaeffect.com"
              className="inline-flex items-center gap-2 text-white text-[13px] font-semibold tracking-[0.18em] uppercase border-b border-accent-primary pb-1 hover:text-accent-primary"
              style={{ borderColor: "#e8547a" }}
            >
              hello@garimaeffect.com →
            </a>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between gap-3 text-[12px] text-white/50">
          <p>© 2025 The Garima Effect. All Rights Reserved.</p>
          <p className="tracking-[0.3em] uppercase">
            Designed with ✦ — From Concept to Content
          </p>
        </div>
      </div>
    </footer>
  );
}

function Social({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="w-10 h-10 rounded-full border border-white/30 hover:border-accent-primary hover:bg-white/10 hover:text-accent-primary flex items-center justify-center transition text-white"
    >
      {children}
    </a>
  );
}

function InstaIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}
function LinkedinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.27 8h4.46v14H.27V8zm7.5 0h4.27v1.91h.06c.6-1.13 2.06-2.32 4.24-2.32 4.54 0 5.38 2.99 5.38 6.88V22h-4.46v-6.27c0-1.5-.03-3.43-2.09-3.43-2.09 0-2.41 1.63-2.41 3.32V22H7.77V8z" />
    </svg>
  );
}
function YoutubeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
    </svg>
  );
}
