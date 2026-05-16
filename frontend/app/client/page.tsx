import { requireProfile } from "@/lib/supabase/session";
import ClientClient from "./ClientClient";
import type {
  BrandIntake,
  Calendar,
  Campaign,
  Task,
} from "@/lib/supabase/database.types";

export default async function ClientPortal() {
  const { supabase, profile } = await requireProfile(["client", "admin"]);

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("client_id", profile.id)
    .order("created_at", { ascending: false });

  const campaign = (campaigns ?? [])[0] as Campaign | undefined;

  let calendar: Calendar | null = null;
  let tasks: Task[] = [];

  if (campaign) {
    const [{ data: calRow }, { data: taskRows }] = await Promise.all([
      supabase
        .from("calendars")
        .select("*")
        .eq("campaign_id", campaign.id)
        .maybeSingle(),
      // RLS already filters to submission_status != not_submitted
      supabase
        .from("tasks")
        .select("*")
        .eq("campaign_id", campaign.id)
        .order("submitted_at", { ascending: false }),
    ]);
    calendar = (calRow as Calendar) ?? null;
    tasks = (taskRows ?? []) as Task[];
  }

  const { data: intakeRow } = await supabase
    .from("brand_intake")
    .select("*")
    .eq("client_id", profile.id)
    .maybeSingle();

  return (
    <ClientClient
      profile={profile}
      campaign={campaign ?? null}
      calendar={calendar}
      tasks={tasks}
      intake={(intakeRow as BrandIntake) ?? null}
    />
  );
}
