"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/supabase/database.types";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ROLE_OPTIONS: { value: UserRole; label: string; hint: string }[] = [
  { value: "client", label: "Client", hint: "Brand owner — reviews the content calendar & deliverables" },
  { value: "intern", label: "Intern", hint: "Executes deliverables, updates Drive links + status" },
  { value: "product_manager", label: "Product Manager", hint: "Owns campaigns, builds strategy, oversees interns" },
  { value: "admin", label: "Admin", hint: "Full oversight, user management, every campaign" },
];

export default function AddPersonDrawer({ open, onClose }: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("client");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    if (open) {
      setFullName("");
      setEmail("");
      setPassword("");
      setCompanyName("");
      setPhone("");
      setRole("client");
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    if (open) {
      window.addEventListener("keydown", h);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", h);
        document.body.style.overflow = prev;
      };
    }
  }, [open, loading, onClose]);

  function randomPassword(): string {
    // Memorable + 12 chars
    const adj = ["Lumen", "Rose", "Bloom", "Tide", "Wild", "Soft", "Bold"];
    const noun = ["Garima", "Effect", "Studio", "Brand", "Story"];
    return (
      adj[Math.floor(Math.random() * adj.length)] +
      "@" +
      noun[Math.floor(Math.random() * noun.length)] +
      (Math.floor(Math.random() * 90) + 10)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          role,
          company_name: companyName || undefined,
          phone: phone || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "failed to create user");
        setLoading(false);
        return;
      }
      setSuccess({ email: json.user.email, password });
      setLoading(false);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !loading && onClose()}
            className="fixed inset-0"
            style={{
              zIndex: 100,
              background: "rgba(61,26,77,0.5)",
              backdropFilter: "blur(12px)",
            }}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 240, damping: 32 }}
            className="fixed top-0 right-0 h-full flex flex-col"
            style={{
              zIndex: 101,
              width: "min(540px, 100vw)",
              background:
                "linear-gradient(180deg, #fff5f4 0%, #fbe5ee 50%, #ead8f5 100%)",
              borderLeft: "1px solid rgba(232,84,122,0.25)",
              boxShadow: "-30px 0 80px rgba(155,127,199,0.25)",
            }}
          >
            <header
              className="flex items-start justify-between px-6 py-5"
              style={{ borderBottom: "1px solid rgba(232,84,122,0.18)" }}
            >
              <div>
                <p
                  className="text-[10px] tracking-[0.4em] uppercase font-bold mb-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  ✦ New Account
                </p>
                <h3 className="section-script" style={{ fontSize: 30 }}>
                  Onboard a person
                </h3>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="w-9 h-9 rounded-full border flex items-center justify-center transition hover:bg-[#e8547a]/10"
                style={{ borderColor: "rgba(232,84,122,0.4)", color: "var(--color-text-deep)" }}
              >
                ✕
              </button>
            </header>

            {success ? (
              <div className="flex-1 overflow-y-auto px-6 py-8">
                <div
                  className="p-6 rounded-2xl"
                  style={{
                    background: "rgba(76,175,108,0.12)",
                    border: "1px solid rgba(76,175,108,0.4)",
                  }}
                >
                  <p
                    className="text-[10px] tracking-[0.4em] uppercase font-bold mb-2"
                    style={{ color: "#1f7a3c" }}
                  >
                    ✓ Account Created
                  </p>
                  <h4
                    className="font-bold text-lg mb-4"
                    style={{ color: "var(--color-text-deep)" }}
                  >
                    Share these credentials with them
                  </h4>
                  <div
                    className="rounded-xl p-4 font-mono text-[13px] space-y-1"
                    style={{
                      background: "white",
                      border: "1px solid rgba(232,84,122,0.2)",
                      color: "var(--color-text-deep)",
                    }}
                  >
                    <div>
                      <span style={{ color: "var(--color-text-muted)" }}>Email:    </span>
                      {success.email}
                    </div>
                    <div>
                      <span style={{ color: "var(--color-text-muted)" }}>Password: </span>
                      {success.password}
                    </div>
                  </div>
                  <p
                    className="text-[12px] italic mt-4"
                    style={{ color: "var(--color-text-body)" }}
                  >
                    They can sign in at <span style={{ color: "#e8547a" }}>/login</span> with these.
                  </p>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setSuccess(null)}
                    className="cta-outline flex-1 justify-center"
                    style={{ padding: "12px 20px", fontSize: 11 }}
                  >
                    + Add Another
                  </button>
                  <button
                    onClick={onClose}
                    className="cta-solid flex-1 justify-center"
                    style={{ padding: "12px 20px", fontSize: 11 }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto px-6 py-6 space-y-5"
              >
                <Field label="Full name" required>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Priya Singh"
                    className="add-input"
                  />
                </Field>

                <Field label="Email" required>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya@lumenskincare.com"
                    className="add-input"
                  />
                </Field>

                <Field label="Temporary password" required>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="add-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => setPassword(randomPassword())}
                      className="px-4 py-3 rounded-xl font-bold text-[11px] tracking-[0.2em] uppercase whitespace-nowrap"
                      style={{
                        background: "rgba(232,84,122,0.1)",
                        color: "#e8547a",
                        border: "1px solid rgba(232,84,122,0.3)",
                      }}
                    >
                      Generate
                    </button>
                  </div>
                </Field>

                <Field label="Role" required>
                  <div className="space-y-2">
                    {ROLE_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition"
                        style={{
                          background:
                            role === opt.value
                              ? "linear-gradient(135deg, rgba(232,84,122,0.12), rgba(184,156,224,0.12))"
                              : "rgba(255,255,255,0.55)",
                          border:
                            role === opt.value
                              ? "1.5px solid rgba(232,84,122,0.5)"
                              : "1.5px solid rgba(61,26,77,0.1)",
                        }}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={opt.value}
                          checked={role === opt.value}
                          onChange={() => setRole(opt.value)}
                          className="mt-1 accent-[#e8547a]"
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className="font-bold text-[14px]"
                            style={{ color: "var(--color-text-deep)" }}
                          >
                            {opt.label}
                          </p>
                          <p
                            className="text-[12px] mt-0.5"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {opt.hint}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </Field>

                {role === "client" && (
                  <Field label="Company / brand name">
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Lumen Skincare"
                      className="add-input"
                    />
                  </Field>
                )}

                <Field label="Phone (optional)">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 ..."
                    className="add-input"
                  />
                </Field>

                {error && (
                  <p
                    className="text-[12px] px-3 py-2 rounded-xl flex items-start gap-2"
                    style={{
                      background: "rgba(232,84,122,0.1)",
                      color: "#c23b68",
                      border: "1px solid rgba(232,84,122,0.3)",
                    }}
                  >
                    <span>⚠</span> {error}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="text-[12px] tracking-[0.22em] uppercase font-bold py-3 px-5 rounded-xl flex-1"
                    style={{
                      background: "rgba(255,255,255,0.55)",
                      color: "var(--color-text-deep)",
                      border: "1px solid rgba(232,84,122,0.25)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="cta-solid flex-1 justify-center"
                    style={{ padding: "14px 22px", fontSize: 12 }}
                  >
                    {loading ? "Creating…" : "Create Account"}
                    {!loading && <span>✦</span>}
                  </button>
                </div>
              </form>
            )}

            <style jsx>{`
              :global(.add-input) {
                width: 100%;
                padding: 12px 14px;
                border-radius: 12px;
                border: 1.5px solid rgba(61, 26, 77, 0.16);
                background: rgba(255, 255, 255, 0.75);
                font-size: 14px;
                color: var(--color-text-deep);
                font-family: inherit;
                transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
              }
              :global(.add-input:focus) {
                outline: none;
                border-color: #e8547a;
                background: white;
                box-shadow: 0 0 0 4px rgba(232, 84, 122, 0.14);
              }
            `}</style>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span
        className="block text-[11px] tracking-[0.22em] uppercase font-bold mb-2"
        style={{ color: "var(--color-text-deep)" }}
      >
        {label}
        {required && (
          <span className="ml-1" style={{ color: "#e8547a" }}>
            *
          </span>
        )}
      </span>
      {children}
    </label>
  );
}
