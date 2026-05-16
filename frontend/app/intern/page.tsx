import { requireProfile } from "@/lib/supabase/session";
import InternClient from "./InternClient";
import type { Task } from "@/lib/supabase/database.types";

export default async function InternHome() {
  const { supabase, profile } = await requireProfile(["intern", "admin"]);

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, campaigns(name)")
    .eq("assigned_to", profile.id)
    .order("created_at", { ascending: false });

  type TaskWithCampaign = Task & { campaigns?: { name: string } | { name: string }[] | null };
  const raw: TaskWithCampaign[] = (tasks ?? []) as unknown as TaskWithCampaign[];
  // Supabase can return joined relation as array; normalize to single object
  const normalized = raw.map((t) => ({
    ...t,
    campaigns: Array.isArray(t.campaigns) ? t.campaigns[0] ?? null : t.campaigns ?? null,
  }));

  return <InternClient profile={profile} tasks={normalized} />;
}
