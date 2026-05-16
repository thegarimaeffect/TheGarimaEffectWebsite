import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/supabase/session";
import { createServiceClient } from "@/lib/supabase/admin";
import BrandDetailClient from "./BrandDetailClient";
import type {
  BrandIntake,
  Calendar,
  CalendarRow,
  Campaign,
  Document,
  Profile,
  Thread,
} from "@/lib/supabase/database.types";

export default async function BrandDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { profile } = await requireProfile(["admin"]);
  const sb = createServiceClient();

  const { data: client } = await sb
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .eq("role", "client")
    .single();
  if (!client) return notFound();

  const { data: campaignRows } = await sb
    .from("campaigns")
    .select("*")
    .eq("client_id", params.id)
    .order("created_at", { ascending: false });
  const campaigns = (campaignRows ?? []) as Campaign[];
  const campaign = campaigns[0] ?? null;

  let calendar: Calendar | null = null;
  let rows: CalendarRow[] = [];
  let thread: Thread | null = null;
  let pm: Pick<Profile, "id" | "full_name" | "email" | "role"> | null = null;

  if (campaign) {
    const [{ data: calRow }, { data: thr }, { data: pmRow }] = await Promise.all([
      sb.from("calendars").select("*").eq("campaign_id", campaign.id).maybeSingle(),
      sb.from("threads").select("*").eq("campaign_id", campaign.id).maybeSingle(),
      sb
        .from("profiles")
        .select("id, full_name, email, role")
        .eq("id", campaign.pm_id)
        .maybeSingle(),
    ]);
    calendar = (calRow as Calendar) ?? null;
    thread = (thr as Thread) ?? null;
    pm = (pmRow as typeof pm) ?? null;
    if (calendar) {
      const { data: rowData } = await sb
        .from("calendar_rows")
        .select("*")
        .eq("calendar_id", calendar.id)
        .order("row_order");
      rows = (rowData ?? []) as CalendarRow[];
    }
  }

  const [{ data: intakeRow }, { data: docRows }] = await Promise.all([
    sb.from("brand_intake").select("*").eq("client_id", params.id).maybeSingle(),
    sb
      .from("documents")
      .select("*")
      .eq("brand_id", params.id)
      .order("created_at", { ascending: false }),
  ]);

  const documents = (docRows ?? []) as Document[];

  return (
    <BrandDetailClient
      adminProfile={profile}
      client={client as Profile}
      campaign={campaign}
      calendar={calendar}
      rows={rows}
      intake={(intakeRow as BrandIntake) ?? null}
      documents={documents}
      thread={thread}
      pm={pm}
    />
  );
}
