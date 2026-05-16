import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import type { CalendarState } from "@/lib/supabase/database.types";

type Action = "send" | "approve" | "request_changes";

/**
 * POST /api/calendar/state
 * Body: { calendar_id, action: 'send' | 'approve' | 'request_changes', notes? }
 *
 * Clients have no UPDATE policy on `calendars` (read-only by RLS), and PMs
 * shouldn't be able to self-approve. So we verify the caller's relationship
 * to the campaign here, then perform the transition with the service client.
 * The state change fires tg_calendars_notify for the right notifications.
 */
export async function POST(request: NextRequest) {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const calendarId = body.calendar_id;
  const action = body.action as Action;
  if (typeof calendarId !== "string" || !["send", "approve", "request_changes"].includes(action)) {
    return NextResponse.json({ error: "calendar_id and valid action required" }, { status: 400 });
  }

  const svc = createServiceClient();

  const { data: cal } = await svc
    .from("calendars")
    .select("id, state, campaign_id")
    .eq("id", calendarId)
    .single();
  if (!cal) {
    return NextResponse.json({ error: "calendar not found" }, { status: 404 });
  }

  const { data: campaign } = await svc
    .from("campaigns")
    .select("id, pm_id, client_id")
    .eq("id", cal.campaign_id)
    .single();
  if (!campaign) {
    return NextResponse.json({ error: "campaign not found" }, { status: 404 });
  }

  const { data: profile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = profile?.role;
  const isAdmin = role === "admin";
  const isPM = campaign.pm_id === user.id || isAdmin;
  const isClient = campaign.client_id === user.id;

  let nextState: CalendarState;
  const patch: Record<string, unknown> = {};

  if (action === "send") {
    if (!isPM) {
      return NextResponse.json({ error: "only the PM can send the calendar" }, { status: 403 });
    }
    if (!["building", "changes_requested"].includes(cal.state)) {
      return NextResponse.json(
        { error: `cannot send from state '${cal.state}'` },
        { status: 409 }
      );
    }
    nextState = "sent_to_client";
    patch.sent_at = new Date().toISOString();
  } else if (action === "approve") {
    if (!isClient && !isAdmin) {
      return NextResponse.json({ error: "only the client can approve" }, { status: 403 });
    }
    if (cal.state !== "sent_to_client") {
      return NextResponse.json(
        { error: `cannot approve from state '${cal.state}'` },
        { status: 409 }
      );
    }
    nextState = "approved";
    patch.approved_at = new Date().toISOString();
  } else {
    // request_changes
    if (!isClient && !isAdmin) {
      return NextResponse.json({ error: "only the client can request changes" }, { status: 403 });
    }
    if (cal.state !== "sent_to_client") {
      return NextResponse.json(
        { error: `cannot request changes from state '${cal.state}'` },
        { status: 409 }
      );
    }
    nextState = "changes_requested";
    if (typeof body.notes === "string" && body.notes.trim()) {
      patch.notes = body.notes.trim();
    }
  }

  patch.state = nextState;

  const { data: updated, error } = await svc
    .from("calendars")
    .update(patch)
    .eq("id", calendarId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ calendar: updated });
}
