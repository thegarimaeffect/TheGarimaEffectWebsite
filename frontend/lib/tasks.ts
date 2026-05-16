import type {
  SubmissionStatus,
  Task,
  TaskStatus,
} from "./supabase/database.types";

/**
 * Pure helper functions for the task workflow.
 * All exported and unit-tested.
 */

export const SUBMISSION_LABEL: Record<SubmissionStatus, string> = {
  not_submitted: "Not Submitted",
  submitted: "Awaiting Review",
  approved: "Approved",
  rejected: "Revisions Requested",
};

export const SUBMISSION_TONE: Record<
  SubmissionStatus,
  { bg: string; fg: string; border: string }
> = {
  not_submitted: {
    bg: "rgba(157,126,157,0.12)",
    fg: "#5a3d5a",
    border: "rgba(90,61,90,0.3)",
  },
  submitted: {
    bg: "rgba(245,200,66,0.18)",
    fg: "#a07700",
    border: "rgba(245,200,66,0.5)",
  },
  approved: {
    bg: "rgba(76,175,108,0.18)",
    fg: "#1f7a3c",
    border: "rgba(76,175,108,0.5)",
  },
  rejected: {
    bg: "rgba(232,84,122,0.18)",
    fg: "#c23b68",
    border: "rgba(232,84,122,0.55)",
  },
};

/** Is this a valid HTTP(S) URL? Used for the Drive link field. */
export function isValidDriveLink(s: string | null | undefined): boolean {
  if (!s) return false;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** What action is currently expected of a given role for this task? */
export function nextActionFor(
  task: Pick<Task, "status" | "submission_status" | "drive_link" | "assigned_to">,
  role: "admin" | "product_manager" | "intern" | "client",
  userId: string | null
): { label: string; verb: "submit" | "resubmit" | "review" | "wait" | "start" } | null {
  // CLIENT: review submitted work
  if (role === "client") {
    if (task.submission_status === "submitted") return { label: "Review", verb: "review" };
    return null;
  }

  // INTERN: work, submit, resubmit
  if (role === "intern") {
    if (task.assigned_to !== userId) return null;
    if (task.submission_status === "rejected") return { label: "Resubmit", verb: "resubmit" };
    if (task.submission_status === "submitted") return { label: "Awaiting client", verb: "wait" };
    if (task.submission_status === "approved") return null;
    if (task.status === "todo") return { label: "Start", verb: "start" };
    if (task.status === "in_progress") {
      if (!task.drive_link) return { label: "Add Drive link", verb: "submit" };
      return { label: "Submit", verb: "submit" };
    }
    return null;
  }

  // PM / ADMIN: oversee + nudge
  if (task.submission_status === "submitted")
    return { label: "Awaiting client review", verb: "wait" };
  if (task.submission_status === "rejected")
    return { label: "Needs rework", verb: "wait" };
  return null;
}

/** Compose the SQL update payload for each user action. */
export function transitionPayload(
  verb: "submit" | "resubmit" | "review-approve" | "review-reject" | "start",
  extra?: { drive_link?: string | null; rejection_reason?: string }
): Partial<Task> {
  switch (verb) {
    case "start":
      return { status: "in_progress" };
    case "submit":
      return {
        status: "done",
        drive_link: extra?.drive_link ?? null,
        // submission_status flips to 'submitted' via trigger
      };
    case "resubmit":
      return {
        status: "done",
        drive_link: extra?.drive_link ?? null,
        submission_status: "submitted",
        // rejection_reason cleared via trigger
      };
    case "review-approve":
      return { submission_status: "approved" };
    case "review-reject":
      return {
        submission_status: "rejected",
        rejection_reason: extra?.rejection_reason ?? "",
      };
  }
}

/** Sort tasks for an intern queue: blocked/rejected first, then priority, then date. */
export function sortInternQueue<T extends Pick<Task, "status" | "submission_status" | "priority" | "due_date">>(
  tasks: T[]
): T[] {
  const rank = (t: T) => {
    // Submission state wins over internal status (an approved task is "done"
    // regardless of what its task_status column says).
    if (t.submission_status === "rejected") return 0; // top — needs rework
    if (t.submission_status === "approved") return 5; // bottom — done
    if (t.submission_status === "submitted") return 3;
    if (t.status === "in_progress") return 1;
    if (t.status === "todo") return 2;
    return 4;
  };
  return [...tasks].sort((a, b) => {
    const r = rank(a) - rank(b);
    if (r !== 0) return r;
    const p = (a.priority ?? 2) - (b.priority ?? 2);
    if (p !== 0) return p;
    return (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999");
  });
}

export function priorityLabel(p: number): "High" | "Normal" | "Low" {
  if (p === 1) return "High";
  if (p === 3) return "Low";
  return "Normal";
}

export function isOverdue(due_date: string | null, status: TaskStatus): boolean {
  if (!due_date) return false;
  if (status === "done") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Parse as LOCAL midnight (a bare "YYYY-MM-DD" parses as UTC, which makes
  // a task due *today* look overdue in negative-offset timezones).
  const due = new Date(`${due_date.slice(0, 10)}T00:00:00`);
  return due < today;
}

/**
 * Auto-urgency: a task that is still open and due within `days` days
 * (today or the next N) — but not already overdue. Mirrors the
 * task_due_soon scheduled alert (due_date = CURRENT_DATE + 2).
 */
export function isDueSoon(
  due_date: string | null,
  submission_status: SubmissionStatus,
  days = 2
): boolean {
  if (!due_date) return false;
  if (submission_status === "approved" || submission_status === "submitted")
    return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${due_date.slice(0, 10)}T00:00:00`); // local midnight
  if (due < today) return false; // overdue is its own state
  const limit = new Date(today);
  limit.setDate(limit.getDate() + days);
  return due <= limit;
}
