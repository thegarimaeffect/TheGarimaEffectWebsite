import { requireProfile } from "@/lib/supabase/session";
import { createServiceClient } from "@/lib/supabase/admin";
import BrandsClient from "./BrandsClient";
import type {
  Calendar,
  CalendarState,
  Campaign,
  Profile,
} from "@/lib/supabase/database.types";

export interface BrandSummary {
  client: Profile;
  campaigns: Campaign[];
  calendarStates: CalendarState[];
}

export default async function BrandsPage() {
  const { profile } = await requireProfile(["admin"]);
  const sb = createServiceClient();

  const [{ data: clientRows }, { data: campaignRows }, { data: calRows }] =
    await Promise.all([
      sb
        .from("profiles")
        .select("*")
        .eq("role", "client")
        .order("created_at", { ascending: false }),
      sb.from("campaigns").select("*").order("created_at", { ascending: false }),
      sb.from("calendars").select("campaign_id, state"),
    ]);

  const clients = (clientRows ?? []) as Profile[];
  const campaigns = (campaignRows ?? []) as Campaign[];
  const calByCampaign = new Map(
    ((calRows ?? []) as Pick<Calendar, "campaign_id" | "state">[]).map((c) => [
      c.campaign_id,
      c.state,
    ])
  );

  const brands: BrandSummary[] = clients.map((client) => {
    const cs = campaigns.filter((c) => c.client_id === client.id);
    return {
      client,
      campaigns: cs,
      calendarStates: cs
        .map((c) => calByCampaign.get(c.id))
        .filter((s): s is CalendarState => !!s),
    };
  });

  return <BrandsClient profile={profile} brands={brands} />;
}
