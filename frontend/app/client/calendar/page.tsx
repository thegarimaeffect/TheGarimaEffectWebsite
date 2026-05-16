import { requireProfile } from "@/lib/supabase/session";
import { createServiceClient } from "@/lib/supabase/admin";
import ClientCalendarClient from "./ClientCalendarClient";
import type {
  Calendar,
  CalendarRow,
  Campaign,
  Thread,
} from "@/lib/supabase/database.types";

export interface ChatParticipant {
  id: string;
  name: string;
  role: string;
}

export default async function ClientCalendarPage() {
  const { supabase, profile } = await requireProfile(["client", "admin"]);

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("client_id", profile.id)
    .order("created_at", { ascending: false });

  const campaign = (campaigns ?? [])[0] as Campaign | undefined;

  let calendar: Calendar | null = null;
  let rows: CalendarRow[] = [];
  let thread: Thread | null = null;
  let participants: Record<string, { name: string; role: string }> = {};

  if (campaign) {
    const { data: calRow } = await supabase
      .from("calendars")
      .select("*")
      .eq("campaign_id", campaign.id)
      .maybeSingle();
    calendar = (calRow as Calendar) ?? null;

    if (calendar) {
      const { data: rowData } = await supabase
        .from("calendar_rows")
        .select("*")
        .eq("calendar_id", calendar.id)
        .order("row_order");
      rows = (rowData ?? []) as CalendarRow[];
    }

    // Chat thread + participant display names. We use the service client
    // (server-only) purely to resolve names of the people the client is
    // already chatting with (admins + the campaign PM + themselves) — RLS
    // would otherwise hide admin profiles from the client.
    const svc = createServiceClient();
    const { data: thr } = await svc
      .from("threads")
      .select("*")
      .eq("campaign_id", campaign.id)
      .maybeSingle();
    thread = (thr as Thread) ?? null;

    const { data: people } = await svc
      .from("profiles")
      .select("id, full_name, email, role")
      .or(`role.eq.admin,id.eq.${campaign.pm_id},id.eq.${profile.id}`);

    participants = Object.fromEntries(
      (people ?? []).map((p) => [
        p.id,
        { name: p.full_name || p.email, role: p.role },
      ])
    );
  }

  return (
    <ClientCalendarClient
      profile={profile}
      campaign={campaign ?? null}
      calendar={calendar}
      rows={rows}
      thread={thread}
      participants={participants}
    />
  );
}
