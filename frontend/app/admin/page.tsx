import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PageHero from "@/components/dashboard/PageHero";
import StatTile from "@/components/dashboard/StatTile";
import StatBadge from "@/components/dashboard/StatBadge";
import { requireProfile } from "@/lib/supabase/session";

export default async function AdminHome() {
  const { supabase, profile } = await requireProfile(["admin"]);

  const [{ data: peopleRows }, { data: campaigns }] = await Promise.all([
    supabase.from("profiles").select("id, email, role, full_name, company_name, created_at").order("created_at", { ascending: false }),
    supabase.from("campaigns").select("id, name, status, client_id, pm_id, start_date, created_at").order("created_at", { ascending: false }),
  ]);

  const people = peopleRows ?? [];
  const counts = {
    admin: people.filter((p) => p.role === "admin").length,
    product_manager: people.filter((p) => p.role === "product_manager").length,
    intern: people.filter((p) => p.role === "intern").length,
    client: people.filter((p) => p.role === "client").length,
  };

  return (
    <DashboardShell profile={profile}>
      <PageHero
        eyebrow="Admin · Command Center"
        title={`Hi, ${profile.full_name?.split(" ")[0] || "Garima"}`}
        subtitle="The whole consultancy — at a glance. People, campaigns, and the pulse of every story in flight."
        right={
          <Link
            href="/admin/people"
            className="cta-solid"
            style={{ padding: "14px 28px", fontSize: 12 }}
          >
            + Manage People <span>✦</span>
          </Link>
        }
      />

      {/* Stat strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <StatTile label="Admins" value={counts.admin} accent="#e8547a" icon="✦" index={0} />
        <StatTile label="Product Managers" value={counts.product_manager} accent="#b89ce0" icon="◆" index={1} />
        <StatTile label="Interns" value={counts.intern} accent="#f5c842" icon="✿" index={2} />
        <StatTile label="Clients" value={counts.client} accent="#ff8aab" icon="✧" index={3} />
      </section>

      {/* Two-column: campaign tiles + people stream */}
      <div className="mt-14 grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* CAMPAIGNS */}
        <section className="xl:col-span-2">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p
                className="text-[10px] tracking-[0.4em] uppercase font-bold mb-1"
                style={{ color: "#e8547a" }}
              >
                ✦ In Flight
              </p>
              <h2
                className="font-bold"
                style={{
                  fontFamily: "var(--font-script), cursive",
                  fontSize: 36,
                  color: "var(--color-text-deep)",
                }}
              >
                Every Campaign
              </h2>
            </div>
            <span
              className="text-[11px] tracking-[0.3em] uppercase font-bold"
              style={{ color: "var(--color-text-muted)" }}
            >
              {campaigns?.length ?? 0} total
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(campaigns ?? []).map((c) => (
              <div
                key={c.id}
                className="glass p-6 relative overflow-hidden group"
              >
                <div
                  aria-hidden
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-50"
                  style={{ background: "rgba(232,84,122,0.4)" }}
                />
                <div className="flex items-start justify-between mb-3 relative">
                  <StatBadge status={c.status} />
                  <span
                    className="text-[10px] tracking-[0.3em] uppercase"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {c.start_date
                      ? new Date(c.start_date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : "Not scheduled"}
                  </span>
                </div>
                <h3
                  className="font-bold text-[18px] leading-tight relative"
                  style={{ color: "var(--color-text-deep)" }}
                >
                  {c.name}
                </h3>
                <p
                  className="text-[11px] tracking-[0.18em] uppercase mt-2 relative"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Created {new Date(c.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
            {(campaigns?.length ?? 0) === 0 && (
              <div className="md:col-span-2 glass p-12 text-center">
                <p className="text-[15px]" style={{ color: "var(--color-text-body)" }}>
                  No campaigns yet.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* PEOPLE STREAM */}
        <section className="xl:col-span-1">
          <div className="mb-5">
            <p
              className="text-[10px] tracking-[0.4em] uppercase font-bold mb-1"
              style={{ color: "#e8547a" }}
            >
              ✦ Recent
            </p>
            <h2
              className="font-bold"
              style={{
                fontFamily: "var(--font-script), cursive",
                fontSize: 32,
                color: "var(--color-text-deep)",
              }}
            >
              People
            </h2>
          </div>

          <div className="glass p-2">
            <div className="space-y-1">
              {people.slice(0, 8).map((p) => {
                const initials = (p.full_name || p.email)
                  .split(/[\s@.]+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((s: string) => s[0]?.toUpperCase() ?? "")
                  .join("");
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/40 transition"
                  >
                    <div
                      className="w-9 h-9 rounded-full p-[1.5px] flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #e8547a, #b89ce0)" }}
                    >
                      <div
                        className="w-full h-full rounded-full flex items-center justify-center text-[11px] font-bold bg-white"
                        style={{ color: "var(--color-text-deep)" }}
                      >
                        {initials || "✦"}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-[13px] font-semibold truncate"
                        style={{ color: "var(--color-text-deep)" }}
                      >
                        {p.full_name || p.email.split("@")[0]}
                      </p>
                      <p
                        className="text-[10px] tracking-[0.18em] uppercase truncate"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {p.role.replace("_", " ")} · {p.company_name || p.email.split("@")[1]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
