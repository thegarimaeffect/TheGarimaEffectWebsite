import { requireProfile } from "@/lib/supabase/session";
import { createServiceClient } from "@/lib/supabase/admin";
import PeopleClient from "./PeopleClient";
import type { Profile } from "@/lib/supabase/database.types";

export default async function PeoplePage() {
  const { profile } = await requireProfile(["admin"]);

  // Use service role to fetch every profile regardless of RLS
  const sb = createServiceClient();
  const { data } = await sb
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return <PeopleClient profile={profile} users={(data ?? []) as Profile[]} />;
}
