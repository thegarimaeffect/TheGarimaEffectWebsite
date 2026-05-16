/**
 * Whole-site E2E smoke.
 * Requires the app running on http://localhost:3000 (npm run dev) with
 * ALLOW_PREVIEW=1, and Supabase up with the seed applied.
 *
 *  - Public landing renders all sections incl. the new "Inside the Studio"
 *    showcase, the founder photo is unchanged, the new image is only in the
 *    showcase, and every role dashboard responds 200 in preview mode.
 */

import { describe, it, expect } from "vitest";

const FRONTEND = "http://localhost:3000";
const SEED_CLIENT = "44444444-4444-4444-4444-444444444444";
const SEED_CAMPAIGN = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

async function getText(path: string, cookie?: string) {
  const res = await fetch(`${FRONTEND}${path}`, {
    headers: cookie ? { Cookie: cookie } : undefined,
    redirect: "follow",
  });
  return { status: res.status, body: await res.text() };
}

describe("Landing page", () => {
  it("renders the hero + every section", async () => {
    const { status, body } = await getText("/");
    expect(status).toBe(200);
    expect(body).toContain("GARIMA");
    expect(body).toContain("Meet Garima Rana"); // About
    expect(body).toContain("What Founders Say"); // Testimonials
    expect(body).toContain("Ready to Feel"); // Final CTA
  });

  it("includes the new 'Inside the Studio' showcase with all four screens", async () => {
    const { body } = await getText("/");
    expect(body).toContain("Inside The Studio");
    expect(body).toContain("Not just content.");
    expect(body).toContain("Admin · Command center");
    expect(body).toContain("Calendar · Build together");
    expect(body).toContain("Client · Cared for");
    expect(body).toContain("Team · Always on");
  });

  it("keeps the original founder photo and uses the new image only in the showcase", async () => {
    const { body } = await getText("/");
    // /garima.png is Next/Image-optimized — assert via the encoded _next/image src
    expect(body).toContain("garima.png");
    expect(body).toContain("garima-studio.png");
  });

  it("serves the new showcase image asset", async () => {
    const res = await fetch(`${FRONTEND}/garima-studio.png`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image");
  });
});

describe("Public auth pages", () => {
  it("login + signup respond", async () => {
    expect((await getText("/login")).status).toBe(200);
    expect((await getText("/signup")).status).toBe(200);
  });
});

describe("Role dashboards (preview mode)", () => {
  const cases: [string, string][] = [
    ["/admin", "admin"],
    ["/admin/leads", "admin"],
    ["/admin/brands", "admin"],
    [`/admin/brands/${SEED_CLIENT}`, "admin"],
    ["/pm", "product_manager"],
    [`/pm/campaigns/${SEED_CAMPAIGN}`, "product_manager"],
    ["/client", "client"],
    ["/client/calendar", "client"],
    ["/intern", "intern"],
    ["/notifications", "admin"],
  ];

  for (const [path, role] of cases) {
    it(`${path} → 200 as ${role}`, async () => {
      const { status } = await getText(path, `preview_role=${role}`);
      expect(status).toBe(200);
    });
  }
});
