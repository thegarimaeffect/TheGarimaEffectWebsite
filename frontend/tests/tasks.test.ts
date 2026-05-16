import { describe, it, expect } from "vitest";
import {
  isValidDriveLink,
  nextActionFor,
  transitionPayload,
  sortInternQueue,
  priorityLabel,
  isOverdue,
} from "@/lib/tasks";
import type { Task } from "@/lib/supabase/database.types";

/** Convenience factory — minimal task with overrides */
const t = (overrides: Partial<Task> = {}): Task => ({
  id: "t-" + Math.random(),
  campaign_id: "c-1",
  calendar_row_id: null,
  title: "Test task",
  description: null,
  assigned_to: "intern-1",
  status: "todo",
  due_date: null,
  priority: 2,
  drive_link: null,
  brand_name: "Test Brand",
  submission_status: "not_submitted",
  rejection_reason: null,
  submitted_at: null,
  reviewed_at: null,
  reviewed_by: null,
  created_by: "pm-1",
  created_at: "2026-05-10T00:00:00Z",
  updated_at: "2026-05-10T00:00:00Z",
  ...overrides,
});

// ============================================================================
// isValidDriveLink
// ============================================================================
describe("isValidDriveLink", () => {
  it("accepts https Google Drive URL", () => {
    expect(isValidDriveLink("https://drive.google.com/file/d/abc/view")).toBe(true);
  });
  it("accepts any https URL", () => {
    expect(isValidDriveLink("https://dropbox.com/abc")).toBe(true);
  });
  it("accepts http URL", () => {
    expect(isValidDriveLink("http://example.com")).toBe(true);
  });
  it("rejects null and empty", () => {
    expect(isValidDriveLink(null)).toBe(false);
    expect(isValidDriveLink("")).toBe(false);
    expect(isValidDriveLink(undefined)).toBe(false);
  });
  it("rejects non-URL strings", () => {
    expect(isValidDriveLink("not a url")).toBe(false);
    expect(isValidDriveLink("drive.google.com/file")).toBe(false);
  });
  it("rejects ftp / non-web protocols", () => {
    expect(isValidDriveLink("ftp://example.com")).toBe(false);
    expect(isValidDriveLink("javascript:alert(1)")).toBe(false);
  });
});

// ============================================================================
// nextActionFor
// ============================================================================
describe("nextActionFor", () => {
  // CLIENT
  it("client sees Review on submitted tasks", () => {
    expect(nextActionFor(t({ submission_status: "submitted" }), "client", "u")).toEqual({
      label: "Review",
      verb: "review",
    });
  });
  it("client sees nothing on not_submitted tasks", () => {
    expect(nextActionFor(t({ submission_status: "not_submitted" }), "client", "u")).toBeNull();
  });
  it("client sees nothing on already-decided tasks", () => {
    expect(nextActionFor(t({ submission_status: "approved" }), "client", "u")).toBeNull();
    expect(nextActionFor(t({ submission_status: "rejected" }), "client", "u")).toBeNull();
  });

  // INTERN
  it("intern can Start a todo task", () => {
    expect(nextActionFor(t({ status: "todo" }), "intern", "intern-1")).toEqual({
      label: "Start",
      verb: "start",
    });
  });
  it("intern with no drive link sees 'Add Drive link'", () => {
    expect(
      nextActionFor(t({ status: "in_progress", drive_link: null }), "intern", "intern-1")
    ).toEqual({ label: "Add Drive link", verb: "submit" });
  });
  it("intern with drive link sees Submit", () => {
    expect(
      nextActionFor(
        t({ status: "in_progress", drive_link: "https://drive.google.com/x" }),
        "intern",
        "intern-1"
      )
    ).toEqual({ label: "Submit", verb: "submit" });
  });
  it("intern sees Awaiting client when submitted", () => {
    expect(
      nextActionFor(t({ submission_status: "submitted" }), "intern", "intern-1")
    ).toEqual({ label: "Awaiting client", verb: "wait" });
  });
  it("intern sees Resubmit when rejected (priority over status)", () => {
    expect(
      nextActionFor(
        t({ status: "done", submission_status: "rejected" }),
        "intern",
        "intern-1"
      )
    ).toEqual({ label: "Resubmit", verb: "resubmit" });
  });
  it("intern sees null on approved", () => {
    expect(
      nextActionFor(t({ submission_status: "approved" }), "intern", "intern-1")
    ).toBeNull();
  });
  it("intern sees null on tasks not assigned to them", () => {
    expect(
      nextActionFor(
        t({ assigned_to: "other-intern", status: "todo" }),
        "intern",
        "intern-1"
      )
    ).toBeNull();
  });

  // PM / ADMIN
  it("PM sees Awaiting client review on submitted", () => {
    expect(
      nextActionFor(t({ submission_status: "submitted" }), "product_manager", "pm-1")
    ).toEqual({ label: "Awaiting client review", verb: "wait" });
  });
  it("PM sees Needs rework on rejected", () => {
    expect(
      nextActionFor(t({ submission_status: "rejected" }), "product_manager", "pm-1")
    ).toEqual({ label: "Needs rework", verb: "wait" });
  });
  it("PM sees null on a fresh todo (it belongs to intern to start)", () => {
    expect(nextActionFor(t({ status: "todo" }), "product_manager", "pm-1")).toBeNull();
  });
});

// ============================================================================
// transitionPayload
// ============================================================================
describe("transitionPayload", () => {
  it("start → status in_progress", () => {
    expect(transitionPayload("start")).toEqual({ status: "in_progress" });
  });
  it("submit sets status=done and drive_link", () => {
    expect(transitionPayload("submit", { drive_link: "https://x" })).toEqual({
      status: "done",
      drive_link: "https://x",
    });
  });
  it("resubmit also flips submission_status back to submitted", () => {
    const p = transitionPayload("resubmit", { drive_link: "https://x" });
    expect(p.status).toBe("done");
    expect(p.submission_status).toBe("submitted");
    expect(p.drive_link).toBe("https://x");
  });
  it("review-approve only changes submission_status", () => {
    expect(transitionPayload("review-approve")).toEqual({ submission_status: "approved" });
  });
  it("review-reject carries reason", () => {
    expect(transitionPayload("review-reject", { rejection_reason: "Too fast" })).toEqual({
      submission_status: "rejected",
      rejection_reason: "Too fast",
    });
  });
  it("review-reject defaults to empty reason if not provided", () => {
    expect(transitionPayload("review-reject")).toEqual({
      submission_status: "rejected",
      rejection_reason: "",
    });
  });
});

// ============================================================================
// sortInternQueue
// ============================================================================
describe("sortInternQueue", () => {
  it("rejected tasks come first", () => {
    const list = [
      t({ id: "a", status: "todo", submission_status: "not_submitted", priority: 1 }),
      t({ id: "b", status: "done", submission_status: "rejected", priority: 2 }),
    ];
    const sorted = sortInternQueue(list);
    expect(sorted[0].id).toBe("b");
  });

  it("in_progress before todo", () => {
    const list = [
      t({ id: "a", status: "todo", priority: 2 }),
      t({ id: "b", status: "in_progress", priority: 2 }),
    ];
    expect(sortInternQueue(list)[0].id).toBe("b");
  });

  it("approved tasks sink to the bottom", () => {
    const list = [
      t({ id: "approved", submission_status: "approved", priority: 1 }),
      t({ id: "todo", status: "todo", priority: 3 }),
    ];
    const sorted = sortInternQueue(list);
    expect(sorted[sorted.length - 1].id).toBe("approved");
  });

  it("within same status, higher priority wins", () => {
    const list = [
      t({ id: "low", status: "in_progress", priority: 3 }),
      t({ id: "high", status: "in_progress", priority: 1 }),
    ];
    expect(sortInternQueue(list)[0].id).toBe("high");
  });

  it("within same status+priority, earlier due_date wins", () => {
    const list = [
      t({ id: "later", status: "in_progress", priority: 2, due_date: "2026-12-01" }),
      t({ id: "soon",  status: "in_progress", priority: 2, due_date: "2026-05-15" }),
    ];
    expect(sortInternQueue(list)[0].id).toBe("soon");
  });

  it("doesn't mutate input", () => {
    const list = [t({ id: "a" }), t({ id: "b" })];
    const ref = list[0];
    sortInternQueue(list);
    expect(list[0]).toBe(ref);
  });
});

// ============================================================================
// priorityLabel
// ============================================================================
describe("priorityLabel", () => {
  it.each([
    [1, "High"],
    [2, "Normal"],
    [3, "Low"],
  ])("priority %i = %s", (p, label) => {
    expect(priorityLabel(p)).toBe(label);
  });
  it("unknown values default to Normal", () => {
    expect(priorityLabel(0)).toBe("Normal");
    expect(priorityLabel(99)).toBe("Normal");
  });
});

// ============================================================================
// isOverdue
// ============================================================================
describe("isOverdue", () => {
  it("returns false when due_date is null", () => {
    expect(isOverdue(null, "todo")).toBe(false);
  });
  it("returns false when task is done", () => {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    expect(isOverdue(yesterday, "done")).toBe(false);
  });
  it("returns true when due_date is in the past and not done", () => {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    expect(isOverdue(yesterday, "in_progress")).toBe(true);
  });
  it("returns false when due_date is today (the day-of)", () => {
    // Local calendar date — isOverdue compares against local midnight, so a
    // UTC-derived date would be off-by-one shortly after local midnight.
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
    expect(isOverdue(today, "todo")).toBe(false);
  });
  it("returns false when due_date is future", () => {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    expect(isOverdue(tomorrow, "todo")).toBe(false);
  });
});
