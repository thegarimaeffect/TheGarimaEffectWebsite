"use client";

import Link from "next/link";
import { useState } from "react";
import type {
  BrandIntake,
  Calendar,
  CalendarRow,
  Campaign,
  Document,
  Profile,
  Thread,
} from "@/lib/supabase/database.types";
import DashboardShell from "@/components/dashboard/DashboardShell";
import StatBadge from "@/components/dashboard/StatBadge";
import DocumentsPanel from "@/components/documents/DocumentsPanel";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import ChatPanel from "@/components/chat/ChatPanel";

type Tab =
  | "overview"
  | "onboarding"
  | "signed"
  | "intake"
  | "calendar"
  | "chat";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "onboarding", label: "Onboarding Docs" },
  { id: "signed", label: "Signed Docs" },
  { id: "intake", label: "Intake & Credentials" },
  { id: "calendar", label: "Calendar" },
  { id: "chat", label: "Chat" },
];

export default function BrandDetailClient({
  adminProfile,
  client,
  campaign,
  calendar,
  rows,
  intake,
  documents,
  thread,
  pm,
}: {
  adminProfile: Profile;
  client: Profile;
  campaign: Campaign | null;
  calendar: Calendar | null;
  rows: CalendarRow[];
  intake: BrandIntake | null;
  documents: Document[];
  thread: Thread | null;
  pm: Pick<Profile, "id" | "full_name" | "email" | "role"> | null;
}) {
  const [tab, setTab] = useState<Tab>("overview");

  const onboardingDocs = documents.filter((d) => d.kind === "onboarding");
  const signedDocs = documents.filter((d) => d.kind === "signed");

  const participants: Record<string, { name: string; role: string }> = {
    [adminProfile.id]: {
      name: adminProfile.full_name || adminProfile.email,
      role: "admin",
    },
    [client.id]: {
      name: client.full_name || client.email,
      role: "client",
    },
  };
  if (pm) {
    participants[pm.id] = {
      name: pm.full_name || pm.email,
      role: "product_manager",
    };
  }

  return (
    <DashboardShell profile={adminProfile}>
      <Link
        href="/admin/brands"
        className="text-[11px] tracking-[0.3em] uppercase font-bold mb-6 inline-flex items-center gap-2 hover:opacity-70 transition"
        style={{ color: "var(--color-text-muted)" }}
      >
        ← All brands
      </Link>

      {/* HERO */}
      <section
        className="relative overflow-hidden rounded-[32px] p-8 md:p-10 mb-8"
        style={{
          background:
            "radial-gradient(ellipse at 18% 22%, rgba(255,200,220,0.9) 0%, transparent 55%)," +
            "linear-gradient(135deg, #fff5f4 0%, #fbe5ee 50%, #ead8f5 100%)",
          border: "1px solid rgba(232,84,122,0.18)",
          boxShadow: "0 24px 70px rgba(155,127,199,0.2)",
        }}
      >
        <p
          className="text-[11px] tracking-[0.45em] uppercase font-bold mb-3"
          style={{ color: "#e8547a" }}
        >
          ✦ Brand
        </p>
        <h1
          className="font-black uppercase mb-3"
          style={{
            fontFamily: "var(--font-display), Impact, sans-serif",
            fontSize: "clamp(32px, 5vw, 64px)",
            lineHeight: 0.95,
            color: "var(--color-text-deep)",
          }}
        >
          {client.company_name || client.full_name || client.email}
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="pill" style={{ color: "var(--color-text-deep)" }}>
            {client.full_name || "—"}
          </span>
          <span className="pill" style={{ color: "var(--color-text-deep)" }}>
            {client.email}
          </span>
          {campaign && <StatBadge status={campaign.status} />}
          {calendar && <StatBadge status={calendar.state} />}
        </div>
      </section>

      {/* TABS */}
      <div className="flex items-center gap-2 flex-wrap mb-8">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="text-[11px] tracking-[0.18em] uppercase font-bold py-2.5 px-5 rounded-full transition"
            style={{
              background:
                tab === t.id
                  ? "linear-gradient(135deg, #e8547a, #b89ce0)"
                  : "rgba(255,255,255,0.55)",
              color: tab === t.id ? "white" : "var(--color-text-deep)",
              border:
                tab === t.id
                  ? "1px solid rgba(255,255,255,0.5)"
                  : "1px solid rgba(232,84,122,0.25)",
              boxShadow:
                tab === t.id ? "0 8px 24px rgba(232,84,122,0.3)" : "none",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* PANELS */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InfoCard title="The client">
            <Row label="Name" value={client.full_name || "—"} />
            <Row label="Email" value={client.email} />
            <Row label="Company" value={client.company_name || "—"} />
            <Row label="Phone" value={client.phone || "—"} />
            <Row
              label="Joined"
              value={new Date(client.created_at).toLocaleDateString()}
            />
            <Row
              label="Welcomed"
              value={
                client.welcome_seen_at
                  ? new Date(client.welcome_seen_at).toLocaleDateString()
                  : "Not yet"
              }
            />
          </InfoCard>
          <InfoCard title="The campaign">
            {campaign ? (
              <>
                <Row label="Name" value={campaign.name} />
                <Row label="Status" value={campaign.status} />
                <Row
                  label="Calendar"
                  value={calendar?.state.replace("_", " ") || "—"}
                />
                <Row
                  label="Started"
                  value={
                    campaign.start_date
                      ? new Date(campaign.start_date).toLocaleDateString()
                      : "—"
                  }
                />
                {campaign.brief && (
                  <p
                    className="text-[13px] italic mt-3 leading-relaxed"
                    style={{ color: "var(--color-text-body)" }}
                  >
                    {campaign.brief}
                  </p>
                )}
              </>
            ) : (
              <p
                className="text-[13px] italic"
                style={{ color: "var(--color-text-muted)" }}
              >
                No campaign yet.
              </p>
            )}
          </InfoCard>
        </div>
      )}

      {tab === "onboarding" && (
        <DocumentsPanel
          title="Onboarding documents"
          hint="Contracts & briefs you share with the client."
          kind="onboarding"
          brandId={client.id}
          campaignId={campaign?.id}
          documents={onboardingDocs}
          canUpload
        />
      )}

      {tab === "signed" && (
        <DocumentsPanel
          title="Signed documents"
          hint="Countersigned agreements — uploaded by you or the client."
          kind="signed"
          brandId={client.id}
          campaignId={campaign?.id}
          documents={signedDocs}
          canUpload
        />
      )}

      {tab === "intake" && (
        <div className="glass p-7">
          {intake ? (
            <>
              <div
                className="rounded-2xl p-4 mb-6 flex items-start gap-3"
                style={{
                  background: "rgba(232,84,122,0.08)",
                  border: "1px solid rgba(232,84,122,0.25)",
                }}
              >
                <span className="text-[16px]">🔒</span>
                <p
                  className="text-[12px] leading-relaxed"
                  style={{ color: "var(--color-text-body)" }}
                >
                  Visible to <strong>admins only</strong>. PMs and interns can
                  never query this data.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Instagram" value={intake.instagram_handle} />
                <Field label="Brand voice" value={intake.brand_voice} />
                <Field label="Target audience" value={intake.target_audience} />
                <Field label="Competitors" value={intake.competitors} />
                <Field label="Goals" value={intake.goals_text} />
                <Field label="Notes" value={intake.additional_notes} />
              </div>

              <h4
                className="text-[11px] tracking-[0.3em] uppercase font-bold mt-8 mb-3"
                style={{ color: "#c23b68" }}
              >
                ✦ Credentials
              </h4>
              <div
                className="rounded-xl p-5 font-mono text-[13px] space-y-2"
                style={{
                  background: "white",
                  border: "1px solid rgba(232,84,122,0.25)",
                  color: "var(--color-text-deep)",
                }}
              >
                {Object.keys(intake.credentials || {}).length === 0 && (
                  <p style={{ color: "var(--color-text-muted)" }}>
                    No credentials submitted.
                  </p>
                )}
                {Object.entries(intake.credentials || {}).map(([k, v]) => (
                  <div key={k}>
                    <span style={{ color: "var(--color-text-muted)" }}>
                      {k}:{" "}
                    </span>
                    {String(v)}
                  </div>
                ))}
              </div>
              {Object.keys(intake.other_platforms || {}).length > 0 && (
                <p
                  className="text-[13px] mt-4"
                  style={{ color: "var(--color-text-body)" }}
                >
                  <strong>Other platforms:</strong>{" "}
                  {Object.values(intake.other_platforms).join(" · ")}
                </p>
              )}
              {intake.submitted_at && (
                <p
                  className="text-[11px] tracking-[0.2em] uppercase mt-5"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Submitted{" "}
                  {new Date(intake.submitted_at).toLocaleDateString()}
                </p>
              )}
            </>
          ) : (
            <p
              className="text-[14px] italic py-10 text-center"
              style={{ color: "var(--color-text-muted)" }}
            >
              The client hasn&apos;t completed their brand intake yet.
            </p>
          )}
        </div>
      )}

      {tab === "calendar" && (
        <div>
          {calendar ? (
            <>
              <div className="flex items-center gap-3 mb-5">
                <StatBadge status={calendar.state} />
                <span
                  className="text-[12px] italic"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Read-only here — edits happen in the PM workspace.
                </span>
              </div>
              <CalendarGrid
                rows={rows}
                calendarId={calendar.id}
                mode="pm"
                editable={false}
              />
            </>
          ) : (
            <div className="glass p-12 text-center">
              <p
                className="text-[14px]"
                style={{ color: "var(--color-text-body)" }}
              >
                No calendar yet.
              </p>
            </div>
          )}
        </div>
      )}

      {tab === "chat" &&
        (thread ? (
          <ChatPanel
            threadId={thread.id}
            currentUserId={adminProfile.id}
            participants={participants}
          />
        ) : (
          <div className="glass p-12 text-center">
            <p
              className="text-[14px]"
              style={{ color: "var(--color-text-body)" }}
            >
              Chat opens once a campaign exists for this brand.
            </p>
          </div>
        ))}
    </DashboardShell>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass p-7">
      <h3
        className="font-bold mb-5"
        style={{
          fontFamily: "var(--font-script), cursive",
          fontSize: 26,
          color: "var(--color-text-deep)",
        }}
      >
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-center justify-between gap-3 pb-2 border-b"
      style={{ borderColor: "rgba(232,84,122,0.14)" }}
    >
      <span
        className="text-[10px] tracking-[0.28em] uppercase font-bold"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </span>
      <span
        className="text-[13px] font-semibold text-right"
        style={{ color: "var(--color-text-deep)" }}
      >
        {value}
      </span>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p
        className="text-[10px] tracking-[0.28em] uppercase font-bold mb-1"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </p>
      <p
        className="text-[14px] leading-relaxed"
        style={{ color: "var(--color-text-deep)" }}
      >
        {value || "—"}
      </p>
    </div>
  );
}
