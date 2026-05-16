import type { LeadStatus, UserRole } from "./supabase/database.types";

const ROLES: UserRole[] = ["admin", "product_manager", "intern", "client"];

const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "negotiating",
  "won",
  "lost",
];

export interface LeadInput {
  full_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  status: LeadStatus;
  follow_up_date: string | null;
  source: string | null;
}

export function validateLead(
  body: unknown
): { ok: true; data: LeadInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "missing body" };
  const b = body as Record<string, unknown>;
  if (typeof b.full_name !== "string" || b.full_name.trim().length < 2)
    return { ok: false, error: "full_name required (2+ chars)" };

  const status: LeadStatus =
    typeof b.status === "string" && (LEAD_STATUSES as string[]).includes(b.status)
      ? (b.status as LeadStatus)
      : "new";

  const str = (v: unknown): string | null =>
    typeof v === "string" && v.trim() ? v.trim() : null;

  let followUp: string | null = null;
  if (typeof b.follow_up_date === "string" && b.follow_up_date.trim()) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.follow_up_date.trim()))
      return { ok: false, error: "follow_up_date must be YYYY-MM-DD" };
    followUp = b.follow_up_date.trim();
  }

  return {
    ok: true,
    data: {
      full_name: b.full_name.trim(),
      email: str(b.email),
      phone: str(b.phone),
      notes: str(b.notes),
      status,
      follow_up_date: followUp,
      source: str(b.source),
    },
  };
}

export function isValidEmail(s: unknown): s is string {
  if (typeof s !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export function isValidPassword(s: unknown): s is string {
  if (typeof s !== "string") return false;
  if (s.length < 8) return false;
  return true;
}

export function isValidRole(s: unknown): s is UserRole {
  return typeof s === "string" && (ROLES as string[]).includes(s);
}

export interface CreateUserInput {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  company_name?: string;
  phone?: string;
}

export function validateCreateUser(body: unknown): { ok: true; data: CreateUserInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "missing body" };
  const b = body as Record<string, unknown>;
  if (!isValidEmail(b.email)) return { ok: false, error: "invalid email" };
  if (!isValidPassword(b.password))
    return { ok: false, error: "password must be at least 8 characters" };
  if (typeof b.full_name !== "string" || b.full_name.trim().length < 2)
    return { ok: false, error: "full_name required (2+ chars)" };
  if (!isValidRole(b.role)) return { ok: false, error: "invalid role" };
  return {
    ok: true,
    data: {
      email: b.email.trim().toLowerCase(),
      password: b.password,
      full_name: b.full_name.trim(),
      role: b.role,
      company_name:
        typeof b.company_name === "string" && b.company_name.trim()
          ? b.company_name.trim()
          : undefined,
      phone:
        typeof b.phone === "string" && b.phone.trim() ? b.phone.trim() : undefined,
    },
  };
}
