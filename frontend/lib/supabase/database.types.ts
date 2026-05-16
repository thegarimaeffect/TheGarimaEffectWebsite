/**
 * Hand-crafted database types. We keep these in sync with /backend migrations.
 * (Run `supabase gen types typescript --local` later to autogenerate from the live DB.)
 */

export type UserRole = "admin" | "product_manager" | "intern" | "client";
export type CampaignStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "archived";

export type TaskStatus =
  | "todo"
  | "in_progress"
  | "review"
  | "done"
  | "blocked";

export type SubmissionStatus =
  | "not_submitted"
  | "submitted"
  | "approved"
  | "rejected";

export type CalendarState =
  | "building"
  | "sent_to_client"
  | "changes_requested"
  | "approved";

export type RowStatus =
  | "draft"
  | "ready"
  | "in_production"
  | "posted";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "negotiating"
  | "won"
  | "lost";

export type NotificationType =
  | "task_assigned"
  | "task_submitted"
  | "task_approved"
  | "task_rejected"
  | "task_resubmitted"
  | "campaign_started"
  | "calendar_submitted"
  | "calendar_approved"
  | "calendar_changes_requested"
  | "task_due_soon"
  | "lead_followup"
  | "credentials_requested"
  | "message_received";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  company_name: string | null;
  phone: string | null;
  metadata: Record<string, unknown>;
  welcome_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  client_id: string;
  pm_id: string;
  status: CampaignStatus;
  start_date: string | null;
  brief: string | null;
  goals: string[];
  created_at: string;
  updated_at: string;
}

export interface Calendar {
  id: string;
  campaign_id: string;
  state: CalendarState;
  sent_at: string | null;
  approved_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarRow {
  id: string;
  calendar_id: string;
  row_order: number;
  post_date: string | null;
  post_time: string | null;
  post_type: string | null;
  pillar: string | null;
  ideation: string | null;
  reference: string | null;
  caption: string | null;
  client_inputs: string | null;
  edited_reel_url: string | null;
  drive_link: string | null;
  collaborators: string[];
  status: RowStatus;
  client_approved_at: string | null;
  client_approved_by: string | null;
  posted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  campaign_id: string;
  calendar_row_id: string | null;
  title: string;
  description: string | null;
  assigned_to: string | null;
  status: TaskStatus;
  due_date: string | null;
  priority: number;
  drive_link: string | null;
  brand_name: string | null;
  submission_status: SubmissionStatus;
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandIntake {
  id: string;
  client_id: string;
  instagram_handle: string | null;
  other_platforms: Record<string, string>;
  brand_voice: string | null;
  target_audience: string | null;
  competitors: string | null;
  goals_text: string | null;
  credentials: Record<string, string>;
  additional_notes: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export type DocumentKind = "onboarding" | "signed";

export interface Document {
  id: string;
  brand_id: string;
  campaign_id: string | null;
  kind: DocumentKind;
  name: string;
  storage_path: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface Thread {
  id: string;
  campaign_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface MessageWithAuthor extends Message {
  author: Pick<Profile, "id" | "full_name" | "email" | "role" | "avatar_url"> | null;
}

export interface Lead {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  status: LeadStatus;
  follow_up_date: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  task_id: string | null;
  campaign_id: string | null;
  read_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CampaignMember {
  campaign_id: string;
  user_id: string;
  member_role: "intern" | "co_pm" | "observer";
  is_content_writer: boolean;
  added_by: string | null;
  added_at: string;
}
