"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  function fillTest(role: "admin" | "pm" | "intern" | "client") {
    const creds = {
      admin: ["admin@garimaeffect.local", "Garima@Admin25"],
      pm: ["pm@garimaeffect.local", "Garima@PM2025"],
      intern: ["intern@garimaeffect.local", "Garima@Intern25"],
      client: ["client@garimaeffect.local", "Garima@Client25"],
    } as const;
    setEmail(creds[role][0]);
    setPassword(creds[role][1]);
  }

  return (
    <main
      className="min-h-screen flex relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 18% 22%, rgba(255,200,220,0.85) 0%, transparent 55%)," +
          "radial-gradient(ellipse at 82% 78%, rgba(200,175,240,0.8) 0%, transparent 55%)," +
          "linear-gradient(135deg, #fff0f5 0%, #fadff2 35%, #ead8f5 70%, #fde8e8 100%)",
      }}
    >
      <FloatBlob top="10%" left="6%" size={300} color="rgba(232,84,122,0.22)" delay={0} />
      <FloatBlob top="64%" left="78%" size={340} color="rgba(184,156,224,0.22)" delay={2} />
      <FloatBlob top="80%" left="6%" size={220} color="rgba(245,200,66,0.16)" delay={4} />
      <Sparkles />

      {/* LEFT — BRAND SHOWCASE */}
      <aside className="hidden lg:flex w-[52%] xl:w-[55%] relative items-center justify-center p-16 z-10">
        <div className="relative max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <p
              className="text-[11px] tracking-[0.5em] uppercase font-bold mb-5 flex items-center gap-3"
              style={{ color: "#e8547a" }}
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                style={{ display: "inline-block" }}
              >
                ✦
              </motion.span>
              The Garima Effect
            </p>

            <h1
              className="section-script mb-6"
              style={{ fontSize: "clamp(56px, 6vw, 92px)", lineHeight: 0.95 }}
            >
              Welcome to
              <br />
              your studio.
            </h1>

            <p
              className="text-[16px] leading-relaxed max-w-md"
              style={{ color: "var(--color-text-body)" }}
            >
              Sign in to step back into your space — your campaigns, your
              calendar, your story.
            </p>
          </motion.div>

          {/* Quote card */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ delay: 0.4, duration: 0.9, ease: "easeOut" }}
            className="mt-12 p-8 relative"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(20px) saturate(140%)",
              border: "1px solid rgba(232,84,122,0.25)",
              borderRadius: 28,
              boxShadow: "0 30px 80px rgba(155,127,199,0.25)",
            }}
          >
            <div
              aria-hidden
              className="absolute -top-4 left-8 text-7xl leading-none"
              style={{ color: "#f5c842", fontFamily: "Georgia, serif" }}
            >
              &ldquo;
            </div>
            <p
              className="italic text-[20px] leading-snug mt-4"
              style={{
                fontFamily: "var(--font-script), cursive",
                color: "var(--color-text-deep)",
              }}
            >
              From concept to content — every brand is a story waiting for
              its voice.
            </p>
            <p
              className="mt-4 text-[10px] tracking-[0.4em] uppercase font-bold"
              style={{ color: "var(--color-accent-rose)" }}
            >
              — Garima Rana, Founder
            </p>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            className="mt-8 grid grid-cols-3 gap-4"
          >
            {[
              { n: "60+", l: "Brands" },
              { n: "120M+", l: "Views moved" },
              { n: "14", l: "Day arc" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p
                  className="font-black"
                  style={{
                    fontSize: 28,
                    background: "linear-gradient(135deg, #e8547a, #b89ce0)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {s.n}
                </p>
                <p
                  className="text-[10px] tracking-[0.3em] uppercase mt-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {s.l}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </aside>

      {/* RIGHT — FORM */}
      <section className="flex-1 flex items-center justify-center px-6 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div
            className="p-8 md:p-10 relative"
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
              className="lg:hidden flex items-center gap-2 mb-6 text-[12px] font-bold tracking-[0.18em] uppercase"
              style={{ color: "var(--color-text-deep)" }}
            >
              <span style={{ color: "#e8547a" }}>✦</span>
              Garima Effect
            </Link>

            <p
              className="text-[11px] tracking-[0.4em] uppercase font-bold mb-2"
              style={{ color: "#e8547a" }}
            >
              ✦ Sign In
            </p>
            <h2
              className="section-script"
              style={{ fontSize: "clamp(34px, 4vw, 48px)", marginBottom: 4 }}
            >
              Welcome back
            </h2>
            <p className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>
              Step back into your space.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <Field label="Email">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="auth-input"
                />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-input"
                />
              </Field>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[12px] px-4 py-3 rounded-xl flex items-start gap-2"
                  style={{
                    background: "rgba(232,84,122,0.1)",
                    color: "#c23b68",
                    border: "1px solid rgba(232,84,122,0.3)",
                  }}
                >
                  <span>⚠</span>
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="cta-solid w-full justify-center"
                style={{ padding: "16px 32px" }}
              >
                {loading ? "Signing in…" : "Sign In"}
                {!loading && <span>→</span>}
              </button>
            </form>

            <p
              className="mt-6 text-center text-[12px] italic"
              style={{ color: "var(--color-text-muted)" }}
            >
              By invitation only.{" "}
              <Link
                href="/signup"
                className="font-semibold not-italic"
                style={{ color: "#e8547a" }}
              >
                Get in touch →
              </Link>
            </p>

            {/* Dev quick-login */}
            <div
              className="mt-8 pt-6 border-t"
              style={{ borderColor: "rgba(232,84,122,0.18)" }}
            >
              <p
                className="text-[10px] tracking-[0.35em] uppercase mb-3 text-center font-bold"
                style={{ color: "var(--color-text-muted)" }}
              >
                Dev · quick login
              </p>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    { r: "admin", label: "Admin" },
                    { r: "pm", label: "PM" },
                    { r: "intern", label: "Intern" },
                    { r: "client", label: "Client" },
                  ] as const
                ).map((b) => (
                  <button
                    key={b.r}
                    type="button"
                    onClick={() => fillTest(b.r)}
                    className="text-[10px] tracking-[0.18em] uppercase font-bold py-2 rounded-lg transition hover:scale-105"
                    style={{
                      background: "rgba(232,84,122,0.08)",
                      border: "1px solid rgba(232,84,122,0.25)",
                      color: "#c23b68",
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <style jsx>{`
        :global(.auth-input) {
          width: 100%;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1.5px solid rgba(61, 26, 77, 0.16);
          background: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          color: var(--color-text-deep);
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        :global(.auth-input:focus) {
          outline: none;
          border-color: #e8547a;
          background: white;
          box-shadow: 0 0 0 4px rgba(232, 84, 122, 0.14);
        }
      `}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span
        className="block text-[11px] tracking-[0.22em] uppercase font-bold mb-2"
        style={{ color: "var(--color-text-deep)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function FloatBlob({
  size,
  top,
  left,
  color,
  delay,
}: {
  size: number;
  top: string;
  left: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      aria-hidden
      animate={{ y: [0, -22, 0], x: [0, 12, 0], scale: [1, 1.06, 1] }}
      transition={{ duration: 9 + delay, delay, repeat: Infinity, ease: "easeInOut" }}
      className="absolute rounded-full pointer-events-none blur-3xl"
      style={{ width: size, height: size, top, left, background: color }}
    />
  );
}

function Sparkles() {
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none">
      {Array.from({ length: 18 }).map((_, i) => {
        const t = (i * 47 + 11) % 100;
        const l = (i * 31 + 17) % 100;
        const c = i % 3 === 0 ? "#f5c842" : i % 3 === 1 ? "#e8547a" : "#b89ce0";
        return (
          <span
            key={i}
            className="shimmer-dot"
            style={
              {
                top: `${t}%`,
                left: `${l}%`,
                width: 3,
                height: 3,
                background: c,
                boxShadow: `0 0 10px ${c}88`,
                ["--shimmer-dur" as string]: `${3 + (i % 4)}s`,
                ["--shimmer-delay" as string]: `${(i * 0.4) % 5}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
