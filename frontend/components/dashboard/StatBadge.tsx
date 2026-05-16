import type {
  CalendarState,
  CampaignStatus,
  LeadStatus,
  RowStatus,
  TaskStatus,
} from "@/lib/supabase/database.types";

const PALETTE: Record<string, { bg: string; fg: string; border: string }> = {
  draft:              { bg: "rgba(157,126,157,0.15)", fg: "#5a3d5a", border: "rgba(90,61,90,0.35)" },
  in_review:          { bg: "rgba(245,200,66,0.18)",  fg: "#a07700", border: "rgba(245,200,66,0.5)" },
  approved:           { bg: "rgba(76,175,108,0.18)",  fg: "#1f7a3c", border: "rgba(76,175,108,0.5)" },
  scheduled:          { bg: "rgba(232,84,122,0.15)",  fg: "#c23b68", border: "rgba(232,84,122,0.45)" },
  live:               { bg: "rgba(76,175,108,0.18)",  fg: "#1f7a3c", border: "rgba(76,175,108,0.5)" },
  complete:           { bg: "rgba(120,120,140,0.12)", fg: "#4a4a5a", border: "rgba(120,120,140,0.35)" },
  active:             { bg: "rgba(76,175,108,0.18)",  fg: "#1f7a3c", border: "rgba(76,175,108,0.5)" },
  paused:             { bg: "rgba(245,200,66,0.18)",  fg: "#a07700", border: "rgba(245,200,66,0.5)" },
  completed:          { bg: "rgba(120,120,140,0.12)", fg: "#4a4a5a", border: "rgba(120,120,140,0.35)" },
  archived:           { bg: "rgba(120,120,140,0.12)", fg: "#4a4a5a", border: "rgba(120,120,140,0.35)" },
  todo:               { bg: "rgba(157,126,157,0.15)", fg: "#5a3d5a", border: "rgba(90,61,90,0.35)" },
  in_progress:        { bg: "rgba(245,200,66,0.18)",  fg: "#a07700", border: "rgba(245,200,66,0.5)" },
  review:             { bg: "rgba(184,156,224,0.2)",  fg: "#5d3a8c", border: "rgba(184,156,224,0.55)" },
  done:               { bg: "rgba(76,175,108,0.18)",  fg: "#1f7a3c", border: "rgba(76,175,108,0.5)" },
  blocked:            { bg: "rgba(232,84,122,0.18)",  fg: "#c23b68", border: "rgba(232,84,122,0.55)" },
  // Calendar state machine
  building:           { bg: "rgba(157,126,157,0.15)", fg: "#5a3d5a", border: "rgba(90,61,90,0.35)" },
  sent_to_client:     { bg: "rgba(245,200,66,0.18)",  fg: "#a07700", border: "rgba(245,200,66,0.5)" },
  changes_requested:  { bg: "rgba(232,84,122,0.18)",  fg: "#c23b68", border: "rgba(232,84,122,0.55)" },
  // Calendar row status
  ready:              { bg: "rgba(184,156,224,0.2)",  fg: "#5d3a8c", border: "rgba(184,156,224,0.55)" },
  in_production:      { bg: "rgba(245,200,66,0.18)",  fg: "#a07700", border: "rgba(245,200,66,0.5)" },
  posted:            { bg: "rgba(76,175,108,0.18)",  fg: "#1f7a3c", border: "rgba(76,175,108,0.5)" },
  // Lead pipeline
  new:                { bg: "rgba(184,156,224,0.2)",  fg: "#5d3a8c", border: "rgba(184,156,224,0.55)" },
  contacted:          { bg: "rgba(245,200,66,0.18)",  fg: "#a07700", border: "rgba(245,200,66,0.5)" },
  qualified:          { bg: "rgba(232,84,122,0.15)",  fg: "#c23b68", border: "rgba(232,84,122,0.45)" },
  negotiating:        { bg: "rgba(255,138,171,0.2)",  fg: "#c23b68", border: "rgba(255,138,171,0.5)" },
  won:                { bg: "rgba(76,175,108,0.18)",  fg: "#1f7a3c", border: "rgba(76,175,108,0.5)" },
  lost:               { bg: "rgba(120,120,140,0.12)", fg: "#4a4a5a", border: "rgba(120,120,140,0.35)" },
};

const LABEL: Record<string, string> = {
  draft: "Draft",
  in_review: "In Review",
  approved: "Approved",
  scheduled: "Scheduled",
  live: "Live",
  complete: "Complete",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  archived: "Archived",
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
  blocked: "Blocked",
  building: "Building",
  sent_to_client: "Sent to Client",
  changes_requested: "Changes Requested",
  ready: "Ready",
  in_production: "In Production",
  posted: "Posted",
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  negotiating: "Negotiating",
  won: "Won",
  lost: "Lost",
};

export default function StatBadge({
  status,
}: {
  status:
    | CalendarState
    | CampaignStatus
    | TaskStatus
    | RowStatus
    | LeadStatus
    | string;
}) {
  const p = PALETTE[status] ?? PALETTE.draft;
  return (
    <span
      className="inline-flex items-center text-[10px] tracking-[0.22em] uppercase font-bold px-3 py-1 rounded-full"
      style={{ background: p.bg, color: p.fg, border: `1px solid ${p.border}` }}
    >
      {LABEL[status] ?? status}
    </span>
  );
}
