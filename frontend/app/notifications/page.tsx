import { requireProfile } from "@/lib/supabase/session";
import NotificationsClient from "./NotificationsClient";
import type { Notification } from "@/lib/supabase/database.types";

export default async function NotificationsPage() {
  const { supabase, profile } = await requireProfile();

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return <NotificationsClient profile={profile} initial={(data ?? []) as Notification[]} />;
}
