"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PageHero from "@/components/dashboard/PageHero";
import AddPersonDrawer from "@/components/admin/AddPersonDrawer";
import type { Profile, UserRole } from "@/lib/supabase/database.types";

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  product_manager: "Product Manager",
  intern: "Intern",
  client: "Client",
};

const ROLE_ACCENT: Record<UserRole, string> = {
  admin: "#e8547a",
  product_manager: "#b89ce0",
  intern: "#f5c842",
  client: "#ff8aab",
};

export default function PeopleClient({
  profile,
  users,
}: {
  profile: Profile;
  users: Profile[];
}) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | UserRole>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const visible = filter === "all" ? users : users.filter((u) => u.role === filter);

  const counts: Record<UserRole | "all", number> = {
    all: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    product_manager: users.filter((u) => u.role === "product_manager").length,
    intern: users.filter((u) => u.role === "intern").length,
    client: users.filter((u) => u.role === "client").length,
  };

  async function deleteUser(id: string, name: string) {
    if (!confirm(`Delete ${name}? This removes their account permanently.`)) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "delete failed");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function changeRole(id: string, role: UserRole) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "update failed");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <DashboardShell profile={profile}>
      <PageHero
        eyebrow="Admin · People"
        title="Onboard the team"
        subtitle="Spin up accounts for clients, interns, PMs. They sign in with the credentials you set."
        right={
          <button
            onClick={() => setDrawerOpen(true)}
            className="cta-solid"
            style={{ padding: "14px 28px", fontSize: 12 }}
          >
            + Add Person <span>✦</span>
          </button>
        }
      />

      {/* FILTER PILLS */}
      <div className="flex items-center gap-2 flex-wrap mb-8">
        {(["all", "admin", "product_manager", "intern", "client"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className="text-[11px] tracking-[0.22em] uppercase font-bold py-2 px-4 rounded-full transition"
            style={{
              background:
                filter === k
                  ? "linear-gradient(135deg, #e8547a, #b89ce0)"
                  : "rgba(255,255,255,0.55)",
              color: filter === k ? "white" : "var(--color-text-deep)",
              border:
                filter === k
                  ? "1px solid rgba(255,255,255,0.5)"
                  : "1px solid rgba(232,84,122,0.25)",
              boxShadow: filter === k ? "0 8px 24px rgba(232,84,122,0.3)" : "none",
            }}
          >
            {k === "all" ? "All" : ROLE_LABEL[k]}
            <span className="ml-2 opacity-80">{counts[k]}</span>
          </button>
        ))}
      </div>

      {error && (
        <div
          className="mb-6 px-4 py-3 rounded-xl text-[13px]"
          style={{
            background: "rgba(232,84,122,0.1)",
            color: "#c23b68",
            border: "1px solid rgba(232,84,122,0.3)",
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* USER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {visible.map((u, i) => {
          const initials = (u.full_name || u.email)
            .split(/[\s@.]+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((s: string) => s[0]?.toUpperCase() ?? "")
            .join("");
          const accent = ROLE_ACCENT[u.role];
          return (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass p-6 relative overflow-hidden"
            >
              <div
                aria-hidden
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-50"
                style={{ background: `${accent}66` }}
              />

              <div className="flex items-start gap-4 relative">
                <div
                  className="w-14 h-14 rounded-full p-[2px] flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${accent}, #b89ce0)` }}
                >
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center text-[15px] font-bold bg-white"
                    style={{ color: "var(--color-text-deep)" }}
                  >
                    {initials || "✦"}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="font-bold text-[16px] truncate"
                    style={{ color: "var(--color-text-deep)" }}
                  >
                    {u.full_name || u.email.split("@")[0]}
                  </p>
                  <p
                    className="text-[12px] truncate"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {u.email}
                  </p>
                  {u.company_name && (
                    <p
                      className="text-[11px] tracking-[0.18em] uppercase font-bold mt-1"
                      style={{ color: accent }}
                    >
                      {u.company_name}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 relative flex items-center gap-2 flex-wrap">
                {/* Role select */}
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value as UserRole)}
                  disabled={busyId === u.id || u.id === profile.id}
                  className="text-[11px] tracking-[0.2em] uppercase font-bold py-1.5 px-3 rounded-full"
                  style={{
                    background: `${accent}22`,
                    color: accent,
                    border: `1px solid ${accent}55`,
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="product_manager">PM</option>
                  <option value="intern">Intern</option>
                  <option value="client">Client</option>
                </select>

                <span
                  className="text-[10px] tracking-[0.2em] uppercase ml-auto"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {new Date(u.created_at).toLocaleDateString()}
                </span>
              </div>

              {u.id !== profile.id && u.role !== "admin" && (
                <button
                  onClick={() => deleteUser(u.id, u.full_name || u.email)}
                  disabled={busyId === u.id}
                  className="mt-3 text-[10px] tracking-[0.22em] uppercase font-bold opacity-70 hover:opacity-100"
                  style={{ color: "#c23b68" }}
                >
                  {busyId === u.id ? "…" : "Delete"}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="glass p-14 text-center">
          <p
            className="text-3xl mb-2"
            style={{
              fontFamily: "var(--font-script), cursive",
              color: "var(--color-text-deep)",
              fontWeight: 700,
            }}
          >
            No one here yet ✦
          </p>
          <p className="text-[14px] mb-5" style={{ color: "var(--color-text-body)" }}>
            Add your first {filter === "all" ? "team member" : ROLE_LABEL[filter as UserRole].toLowerCase()}.
          </p>
          <button onClick={() => setDrawerOpen(true)} className="cta-solid" style={{ padding: "14px 28px", fontSize: 12 }}>
            + Add Person
          </button>
        </div>
      )}

      <AddPersonDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </DashboardShell>
  );
}
