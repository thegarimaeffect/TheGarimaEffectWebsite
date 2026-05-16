/**
 * Admin user-management integration tests.
 * Requires:
 *   - Supabase running locally (npm run start in backend/)
 *   - Frontend container running on http://localhost:3000
 *
 * Each test uses the preview_role=admin cookie to authenticate as admin
 * against /api/admin/users. The created user is then verified to log in
 * via Supabase Auth directly.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const FRONTEND = "http://localhost:3000";
const SUPABASE = "http://localhost:54321";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const SERVICE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const ADMIN_COOKIE = "preview_role=admin";

const CREATED_EMAILS: string[] = [];

afterAll(async () => {
  // Cleanup any users we created during the test run
  const sb = createClient(SUPABASE, SERVICE, { auth: { persistSession: false } });
  for (const email of CREATED_EMAILS) {
    const { data } = await sb.from("profiles").select("id").eq("email", email).maybeSingle();
    if (data?.id) {
      await sb.auth.admin.deleteUser(data.id);
    }
  }
});

describe("Admin user management — API", () => {
  it("rejects unauthorized POST /api/admin/users", async () => {
    const res = await fetch(`${FRONTEND}/api/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "x@x.com",
        password: "12345678",
        full_name: "X",
        role: "intern",
      }),
    });
    expect(res.status).toBe(401);
  });

  it("admin creates an INTERN account", async () => {
    const email = `intern.${Date.now()}@test.garima.local`;
    CREATED_EMAILS.push(email);
    const res = await fetch(`${FRONTEND}/api/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        email,
        password: "Garima@Test25",
        full_name: "Test Intern",
        role: "intern",
      }),
    });
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.user.email).toBe(email);
    expect(json.user.role).toBe("intern");
  });

  it("the created intern can sign in via Supabase Auth", async () => {
    const email = `intern.signin.${Date.now()}@test.garima.local`;
    CREATED_EMAILS.push(email);
    await fetch(`${FRONTEND}/api/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        email,
        password: "Garima@Test25",
        full_name: "Login Test Intern",
        role: "intern",
      }),
    });

    const sb = createClient(SUPABASE, ANON, { auth: { persistSession: false } });
    const { data, error } = await sb.auth.signInWithPassword({
      email,
      password: "Garima@Test25",
    });
    expect(error).toBeNull();
    expect(data.session).toBeTruthy();
    expect(data.user?.email).toBe(email);
    expect(data.user?.app_metadata?.role).toBe("intern");
  });

  it("admin creates a CLIENT account with company_name", async () => {
    const email = `client.${Date.now()}@test.garima.local`;
    CREATED_EMAILS.push(email);
    const res = await fetch(`${FRONTEND}/api/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        email,
        password: "Garima@Test25",
        full_name: "Test Client",
        role: "client",
        company_name: "Bloom Test Co.",
      }),
    });
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.user.company_name).toBe("Bloom Test Co.");
  });

  it("validates email format", async () => {
    const res = await fetch(`${FRONTEND}/api/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        email: "not-an-email",
        password: "Garima@Test25",
        full_name: "Test",
        role: "intern",
      }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/email/);
  });

  it("validates password length", async () => {
    const res = await fetch(`${FRONTEND}/api/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        email: `weak.${Date.now()}@test.garima.local`,
        password: "weak",
        full_name: "Test",
        role: "intern",
      }),
    });
    expect(res.status).toBe(400);
  });

  it("validates role", async () => {
    const res = await fetch(`${FRONTEND}/api/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        email: `r.${Date.now()}@test.garima.local`,
        password: "Garima@Test25",
        full_name: "Test",
        role: "superuser",
      }),
    });
    expect(res.status).toBe(400);
  });

  it("admin can list users", async () => {
    const res = await fetch(`${FRONTEND}/api/admin/users`, {
      headers: { Cookie: ADMIN_COOKIE },
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.users)).toBe(true);
    expect(json.users.length).toBeGreaterThanOrEqual(4); // at least the seed users
    expect(json.users.some((u: { email: string }) => u.email === "admin@garimaeffect.local")).toBe(true);
  });

  it("admin can change a user's role", async () => {
    // Create an intern
    const email = `role-change.${Date.now()}@test.garima.local`;
    CREATED_EMAILS.push(email);
    const createRes = await fetch(`${FRONTEND}/api/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        email,
        password: "Garima@Test25",
        full_name: "Role Change",
        role: "intern",
      }),
    });
    const created = await createRes.json();
    const id = created.user.id;

    // Promote to PM
    const patchRes = await fetch(`${FRONTEND}/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({ role: "product_manager" }),
    });
    expect(patchRes.status).toBe(200);

    // Verify via service-role
    const sb = createClient(SUPABASE, SERVICE, { auth: { persistSession: false } });
    const { data } = await sb.from("profiles").select("role").eq("id", id).single();
    expect(data?.role).toBe("product_manager");
  });

  it("admin can delete a non-admin user", async () => {
    const email = `to-delete.${Date.now()}@test.garima.local`;
    const createRes = await fetch(`${FRONTEND}/api/admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: ADMIN_COOKIE },
      body: JSON.stringify({
        email,
        password: "Garima@Test25",
        full_name: "Delete Me",
        role: "client",
      }),
    });
    const created = await createRes.json();
    const id = created.user.id;

    const delRes = await fetch(`${FRONTEND}/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { Cookie: ADMIN_COOKIE },
    });
    expect(delRes.status).toBe(200);

    const sb = createClient(SUPABASE, SERVICE, { auth: { persistSession: false } });
    const { data } = await sb.from("profiles").select("id").eq("id", id).maybeSingle();
    expect(data).toBeNull();
  });

  it("refuses to delete an admin", async () => {
    const sb = createClient(SUPABASE, SERVICE, { auth: { persistSession: false } });
    const { data: admin } = await sb.from("profiles").select("id").eq("role", "admin").limit(1).single();
    const res = await fetch(`${FRONTEND}/api/admin/users/${admin!.id}`, {
      method: "DELETE",
      headers: { Cookie: ADMIN_COOKIE },
    });
    expect(res.status).toBe(400);
  });
});
