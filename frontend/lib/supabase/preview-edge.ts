import type { NextRequest } from "next/server";
import type { UserRole } from "./database.types";

/**
 * Edge-runtime-safe preview role check.
 * Only reads the cookie from the incoming Request — no next/headers import.
 */
const VALID_ROLES: UserRole[] = ["admin", "product_manager", "intern", "client"];

export function previewRoleFromRequest(request: NextRequest): UserRole | null {
  if (process.env.ALLOW_PREVIEW !== "1") return null;
  const v = request.cookies.get("preview_role")?.value;
  return v && (VALID_ROLES as string[]).includes(v) ? (v as UserRole) : null;
}
