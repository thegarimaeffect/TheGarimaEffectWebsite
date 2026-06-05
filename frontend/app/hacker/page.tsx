import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HackerConsole from "./HackerConsole";

export const metadata = {
  title: "Hacker Console",
  robots: { index: false, follow: false },
};

// History is permanent — we fetch ALL entries the user has ever logged.
// Past days are locked at the database level (see migration 000004).
const DEFAULT_VISIBLE_DAYS = 30; // how many day-rows to render by default;
// older history exists in the DB and the user can scroll/load more.

export default async function HackerPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/hacker");
  const role = (user.app_metadata?.role as string) || "";
  if (role !== "hacker") redirect("/login");

  // Fetch ALL history — no date cutoff. Data is kept forever.
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
      .order("entry_date", { ascending: false }),
    supabase
      .from("hacker_daily_totals")
      .select("*")
      .order("entry_date", { ascending: false }),
  ]);

  return (
    <HackerConsole
      userEmail={user.email ?? "hacker"}
      initialGoals={goals.data ?? []}
      initialEntries={entries.data ?? []}
      initialTotals={totals.data ?? []}
      daysBack={DEFAULT_VISIBLE_DAYS}
    />
  );
}
