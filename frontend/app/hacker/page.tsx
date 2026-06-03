import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HackerConsole from "./HackerConsole";

export const metadata = {
  title: "Hacker Console",
  robots: { index: false, follow: false },
};

const DAYS_BACK = 21; // 3 weeks of history visible

export default async function HackerPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/hacker");
  const role = (user.app_metadata?.role as string) || "";
  if (role !== "hacker") redirect("/login");

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - DAYS_BACK);
  const cutoffIso = cutoff.toISOString().slice(0, 10);

  const [goals, entries, totals] = await Promise.all([
    supabase
      .from("hacker_goals")
      .select("*")
      .is("archived_at", null)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("hacker_entries")
      .select("*")
      .gte("entry_date", cutoffIso),
    supabase
      .from("hacker_daily_totals")
      .select("*")
      .gte("entry_date", cutoffIso),
  ]);

  return (
    <HackerConsole
      userEmail={user.email ?? "hacker"}
      initialGoals={goals.data ?? []}
      initialEntries={entries.data ?? []}
      initialTotals={totals.data ?? []}
      daysBack={DAYS_BACK}
    />
  );
}
