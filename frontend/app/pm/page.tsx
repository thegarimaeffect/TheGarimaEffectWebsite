import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PageHero from "@/components/dashboard/PageHero";
import StatTile from "@/components/dashboard/StatTile";
import StatBadge from "@/components/dashboard/StatBadge";
import { requireProfile } from "@/lib/supabase/session";

export default async function PMHome() {
  const { supabase, profile } = await requireProfile(["product_manager", "admin"]);

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, name, status, start_date, brief, client_id, created_at, updated_at")
    .eq("pm_id", profile.id)
    .order("created_at", { ascending: false });

  const list = campaigns ?? [];
  const active = list.filter((c) => c.status === "active").length;
  const draft = list.filter((c) => c.status === "draft").length;

  // pull total calendar rows + tasks across PM's campaigns
  const campIds = list.map((c) => c.id);
  let totalRows = 0;
  let totalTasks = 0;
  if (campIds.length > 0) {
    const [{ data: cals }, { count: tC }] = await Promise.all([
      supabase.from("calendars").select("id").in("campaign_id", campIds),
      supabase.from("tasks").select("id", { count: "exact", head: true }).in("campaign_id", campIds),
    ]);
    totalTasks = tC ?? 0;
    const calIds = (cals ?? []).map((c) => c.id);
    if (calIds.length > 0) {
      const { count: rC } = await supabase
        .from("calendar_rows")
        .select("id", { count: "exact", head: true })
        .in("calendar_id", calIds);
      totalRows = rC ?? 0;
    }
  }

  return (
    <DashboardShell profile={profile}>
      <PageHero
        eyebrow="Product Manager · Workspace"
        title={`Hi, ${profile.full_name?.split(" ")[0] || "there"}`}
        subtitle="Your campaigns, your interns, your stories — all curated here."
      />

      {/* Stat strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <StatTile label="Campaigns" value={list.length} accent="#e8547a" icon="✿" index={0} />
        <StatTile label="Active" value={active} accent="#b89ce0" icon="✦" index={1} />
        <StatTile label="In Draft" value={draft} accent="#f5c842" icon="◆" index={2} />
        <StatTile label="Rows Mapped" value={totalRows} accent="#ff8aab" icon="✧" index={3} trend={{ delta: `${totalTasks} tasks live`, positive: true }} />
      </section>

      {/* Campaigns */}
      <section className="mt-14">
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
              Your Campaigns
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {list.map((c, i) => (
            <Link
              key={c.id}
              href={`/pm/campaigns/${c.id}`}
              className="glass p-7 group relative overflow-hidden block"
            >
              <div
                aria-hidden
                className="absolute -top-20 -right-16 w-52 h-52 rounded-full blur-3xl opacity-50"
                style={{
                  background:
                    i % 2 === 0 ? "rgba(232,84,122,0.4)" : "rgba(184,156,224,0.4)",
                }}
              />
              <div
                aria-hidden
                className="absolute -bottom-20 -left-12 w-40 h-40 rounded-full blur-3xl opacity-35"
                style={{ background: "rgba(245,200,66,0.35)" }}
              />

              <div className="flex items-start justify-between mb-4 relative">
                <StatBadge status={c.status} />
                <span
                  className="text-[10px] tracking-[0.3em] uppercase font-bold"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {c.start_date
                    ? new Date(c.start_date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })
                    : "Unscheduled"}
                </span>
              </div>

              <h3
                className="font-black uppercase relative mb-2"
                style={{
                  fontFamily: "var(--font-display), Impact, sans-serif",
                  fontSize: 28,
                  lineHeight: 1.05,
                  color: "var(--color-text-deep)",
                }}
              >
                {c.name}
              </h3>

              <p
                className="text-[13px] leading-relaxed line-clamp-2 relative"
                style={{ color: "var(--color-text-body)" }}
              >
                {c.brief || "Brief coming soon."}
              </p>

              <div
                className="mt-6 pt-5 border-t flex items-center justify-between relative"
                style={{ borderColor: "rgba(232,84,122,0.18)" }}
              >
                <span
                  className="text-[10px] tracking-[0.3em] uppercase"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Updated {new Date(c.updated_at).toLocaleDateString()}
                </span>
                <span
                  className="font-bold text-[12px] tracking-[0.18em] uppercase group-hover:translate-x-1 transition flex items-center gap-1"
                  style={{ color: "#e8547a" }}
                >
                  Open
                  <span>→</span>
                </span>
              </div>
            </Link>
          ))}
          {list.length === 0 && (
            <div className="md:col-span-2 glass p-14 text-center">
              <p
                className="text-3xl mb-3"
                style={{
                  fontFamily: "var(--font-script), cursive",
                  color: "var(--color-text-deep)",
                  fontWeight: 700,
                }}
              >
                A blank canvas ✦
              </p>
              <p className="text-[14px]" style={{ color: "var(--color-text-body)" }}>
                Once a campaign is created, its content calendar assembles itself here.
              </p>
            </div>
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
