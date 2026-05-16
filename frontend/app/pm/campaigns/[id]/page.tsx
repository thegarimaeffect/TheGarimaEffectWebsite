import { notFound } from "next/navigation";
import PMCampaignClient from "./PMCampaignClient";
import { requireProfile } from "@/lib/supabase/session";
import { createServiceClient } from "@/lib/supabase/admin";
import type {
  Calendar,
  CalendarRow,
  Task,
  Thread,
} from "@/lib/supabase/database.types";

export default async function CampaignDetail({
  params,
}: {
  params: { id: string };
}) {
  const { supabase, profile } = await requireProfile([
    "product_manager",
    "admin",
  ]);

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!campaign) return notFound();

  const { data: calendar } = await supabase
    .from("calendars")
    .select("*")
    .eq("campaign_id", params.id)
    .maybeSingle();

  const [{ data: rowData }, { data: tasksData }, { data: clientData }, { data: memberRows }] =
    await Promise.all([
      calendar
        ? supabase
            .from("calendar_rows")
            .select("*")
            .eq("calendar_id", calendar.id)
            .order("row_order")
        : Promise.resolve({ data: [] as CalendarRow[] }),
      supabase
        .from("tasks")
        .select("*")
        .eq("campaign_id", params.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("full_name, email, company_name")
        .eq("id", campaign.client_id)
        .single(),
      supabase
        .from("campaign_members")
        .select(
          "user_id, is_content_writer, profiles!campaign_members_user_id_fkey(id, full_name, email, role)"
        )
        .eq("campaign_id", params.id),
    ]);

  const rows = (rowData ?? []) as CalendarRow[];
  const tasks = (tasksData ?? []) as Task[];

  // Chat thread + participant names (admin + this PM + the client). Service
  // client (server-only) resolves names RLS would otherwise hide from the PM.
  const svc = createServiceClient();
  const [{ data: thr }, { data: chatPeople }] = await Promise.all([
    svc.from("threads").select("*").eq("campaign_id", params.id).maybeSingle(),
    svc
      .from("profiles")
      .select("id, full_name, email, role")
      .or(
        `role.eq.admin,id.eq.${campaign.pm_id},id.eq.${campaign.client_id}`
      ),
  ]);
  const thread = (thr as Thread) ?? null;
  const participants: Record<string, { name: string; role: string }> =
    Object.fromEntries(
      (chatPeople ?? []).map((p) => [
        p.id,
        { name: p.full_name || p.email, role: p.role },
      ])
    );

  type MemberRow = {
    user_id: string;
    is_content_writer: boolean;
    profiles:
      | { id: string; full_name: string | null; email: string; role: string }
      | { id: string; full_name: string | null; email: string; role: string }[]
      | null;
  };
  const interns = ((memberRows ?? []) as unknown as MemberRow[])
    .map((m) => {
      const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
      return p && p.role === "intern"
        ? {
            id: p.id,
            full_name: p.full_name,
            email: p.email,
            is_content_writer: m.is_content_writer,
          }
        : null;
    })
    .filter(
      (p): p is { id: string; full_name: string | null; email: string; is_content_writer: boolean } =>
        !!p
    );

  return (
    <PMCampaignClient
      profile={profile}
      campaign={campaign}
      client={clientData ?? null}
      calendar={(calendar as Calendar) ?? null}
      rows={rows}
      tasks={tasks}
      interns={interns}
      thread={thread}
      participants={participants}
    />
  );
}
