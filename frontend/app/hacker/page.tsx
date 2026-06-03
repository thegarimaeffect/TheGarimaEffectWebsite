import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HackerConsole from "./HackerConsole";

export const metadata = { title: "Hacker Console", robots: { index: false, follow: false } };

export default async function HackerPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/hacker");
  const role = (user.app_metadata?.role as string) || "";
  if (role !== "hacker") redirect("/login");

  // Initial data fetch (server-side)
  const [tasks, daily, today] = await Promise.all([
    supabase.from("hacker_tasks").select("*").order("position", { ascending: true }).order("created_at", { ascending: false }),
    supabase.from("hacker_daily_hours").select("*").gte("log_date", new Date(Date.now() - 13 * 86400e3).toISOString().slice(0, 10)),
    supabase.from("hacker_today").select("*").single(),
  ]);

  return (
    <HackerConsole
      userEmail={user.email ?? "hacker"}
      initialTasks={tasks.data ?? []}
      initialDaily={daily.data ?? []}
      initialToday={today.data ?? { done_today: 0, open_count: 0, hours_today: 0 }}
    />
  );
}
