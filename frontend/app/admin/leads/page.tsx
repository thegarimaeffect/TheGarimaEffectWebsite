import { requireProfile } from "@/lib/supabase/session";
import { createServiceClient } from "@/lib/supabase/admin";
import LeadsClient from "./LeadsClient";
import type { Lead } from "@/lib/supabase/database.types";

export default async function LeadsPage() {
  const { profile } = await requireProfile(["admin"]);
  const sb = createServiceClient();

  const { data } = await sb
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return <LeadsClient profile={profile} leads={(data ?? []) as Lead[]} />;
}
