"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  BrandIntake,
  Calendar,
  Campaign,
  Profile,
  Task,
} from "@/lib/supabase/database.types";
import DashboardShell from "@/components/dashboard/DashboardShell";
import StatBadge from "@/components/dashboard/StatBadge";
import TaskCard from "@/components/tasks/TaskCard";
import ReviewModal from "@/components/tasks/ReviewModal";
import WelcomeModal from "@/components/client/WelcomeModal";
import IntakeModal from "@/components/client/IntakeModal";

export default function ClientClient({
  profile,
  campaign,
  calendar,
  tasks,
  intake,
}: {
  profile: Profile;
  campaign: Campaign | null;
  calendar: Calendar | null;
  tasks: Task[];
  intake: BrandIntake | null;
}) {
  const [reviewing, setReviewing] = useState<Task | null>(null);

  // Build phase = calendar not yet approved (or no calendar at all).
  // Welcome shows on every visit during the build phase.
  const buildPhase = !calendar || calendar.state !== "approved";
  const needsIntake = !intake?.submitted_at;

  const [showWelcome, setShowWelcome] = useState(buildPhase);
  const [showIntake, setShowIntake] = useState(false);

  function handleWelcomeDismiss() {
    setShowWelcome(false);
    if (needsIntake) setShowIntake(true);
  }

  const goals = Array.isArray(campaign?.goals) ? (campaign?.goals as string[]) : [];
  const submitted = tasks.filter((t) => t.submission_status === "submitted");
  const approved = tasks.filter((t) => t.submission_status === "approved");
  const rejected = tasks.filter((t) => t.submission_status === "rejected");

  const firstName = profile.full_name?.split(" ")[0] || "friend";

  return (
    <DashboardShell profile={profile}>
      <WelcomeModal
        firstName={firstName}
        open={showWelcome}
        onDismiss={handleWelcomeDismiss}
      />
      <IntakeModal
        open={showIntake}
        existing={intake}
        onClose={() => setShowIntake(false)}
      />

      {/* CINEMATIC HERO */}
      <section
        className="relative overflow-hidden rounded-[36px] p-8 md:p-12 mb-12"
        style={{
          background:
            "radial-gradient(ellipse at 18% 22%, rgba(255,200,220,0.95) 0%, transparent 55%)," +
            "radial-gradient(ellipse at 82% 78%, rgba(200,175,240,0.9) 0%, transparent 55%)," +
            "linear-gradient(135deg, #fff5f4 0%, #fbe5ee 50%, #ead8f5 100%)",
          border: "1px solid rgba(232,84,122,0.18)",
          boxShadow: "0 30px 80px rgba(155,127,199,0.22)",
        }}
      >
        <div
          aria-hidden
          className="absolute -top-32 -right-20 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "rgba(232,84,122,0.35)" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full blur-3xl"
          style={{ background: "rgba(184,156,224,0.35)" }}
        />

        <div className="relative">
          <p
            className="text-[11px] tracking-[0.5em] uppercase font-bold mb-4 flex items-center gap-3"
            style={{ color: "#e8547a" }}
          >
            ✦ Your Studio
          </p>
          <h1
            className="section-script mb-3"
            style={{ fontSize: "clamp(44px, 6vw, 88px)", lineHeight: 0.95 }}
          >
            Welcome, {firstName}
          </h1>
          <p
            className="text-[16px] italic max-w-2xl"
            style={{ color: "var(--color-text-body)" }}
          >
            Your brand story — crafted by hand, one cinematic moment at a time.
          </p>
        </div>
      </section>

      {!campaign && (
        <div
          className="rounded-[28px] p-14 text-center max-w-2xl mx-auto"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(232,84,122,0.2)",
          }}
        >
          <p
            className="text-4xl mb-3"
            style={{
              fontFamily: "var(--font-script), cursive",
              color: "var(--color-text-deep)",
              fontWeight: 700,
            }}
          >
            Almost ready ✦
          </p>
          <p className="text-[14px]" style={{ color: "var(--color-text-body)" }}>
            Your campaign is being crafted. We&apos;ll open this portal the moment
            it goes live.
          </p>
          {needsIntake && (
            <button
              onClick={() => setShowIntake(true)}
              className="cta-solid mx-auto mt-7"
              style={{ padding: "14px 30px", fontSize: 12 }}
            >
              Tell us about your brand <span>→</span>
            </button>
          )}
        </div>
      )}

      {campaign && (
        <>
          {/* CAMPAIGN CARD */}
          <section
            className="relative overflow-hidden rounded-[28px] p-8 md:p-10 mb-10"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,220,232,0.7) 100%)",
              border: "1px solid rgba(232,84,122,0.22)",
              boxShadow: "0 20px 60px rgba(155,127,199,0.18)",
            }}
          >
            <div
              aria-hidden
              className="absolute -top-16 -right-12 w-60 h-60 rounded-full blur-3xl opacity-50"
              style={{ background: "rgba(232,84,122,0.4)" }}
            />

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <p
                  className="text-[10px] tracking-[0.4em] uppercase font-bold mb-3"
                  style={{ color: "#e8547a" }}
                >
                  Your Campaign
                </p>
                <h2
                  className="font-black uppercase mb-3"
                  style={{
                    fontFamily: "var(--font-display), Impact, sans-serif",
                    fontSize: "clamp(28px, 3.6vw, 52px)",
                    lineHeight: 1,
                    color: "var(--color-text-deep)",
                  }}
                >
                  {campaign.name}
                </h2>
                {campaign.brief && (
                  <p
                    className="text-[14px] leading-relaxed max-w-2xl"
                    style={{ color: "var(--color-text-body)" }}
                  >
                    {campaign.brief}
                  </p>
                )}
                {goals.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {goals.map((g, i) => (
                      <span key={i} className="pill pink">
                        ✦ {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="md:col-span-1 grid grid-cols-3 md:grid-cols-1 gap-3">
                <MiniStat label="Awaiting You" value={submitted.length} accent="#f5c842" />
                <MiniStat label="Approved" value={approved.length} accent="#4caf6c" />
                <MiniStat label="In Rework" value={rejected.length} accent="#e8547a" />
              </div>
            </div>

            <div
              className="relative mt-6 pt-6 border-t flex items-center justify-between flex-wrap gap-3"
              style={{ borderColor: "rgba(232,84,122,0.18)" }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <StatBadge status={campaign.status} />
                {campaign.start_date && (
                  <span className="pill" style={{ color: "var(--color-text-deep)" }}>
                    Started {new Date(campaign.start_date).toLocaleDateString()}
                  </span>
                )}
              </div>
              {!needsIntake && (
                <button
                  onClick={() => setShowIntake(true)}
                  className="text-[10px] tracking-[0.3em] uppercase font-bold"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  ✎ Update brand details
                </button>
              )}
            </div>
          </section>

          {/* CALENDAR TEASER */}
          <section className="mb-12">
            <Link href="/client/calendar">
              <div
                className="relative overflow-hidden rounded-[28px] p-8 md:p-10 group cursor-pointer transition"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(220,200,245,0.6) 100%)",
                  border: "1px solid rgba(232,84,122,0.22)",
                  boxShadow: "0 16px 50px rgba(155,127,199,0.16)",
                }}
              >
                <div
                  aria-hidden
                  className="absolute -bottom-16 -right-12 w-60 h-60 rounded-full blur-3xl opacity-50"
                  style={{ background: "rgba(184,156,224,0.4)" }}
                />
                <div className="relative flex items-center justify-between flex-wrap gap-5">
                  <div>
                    <p
                      className="text-[10px] tracking-[0.45em] uppercase font-bold mb-2"
                      style={{ color: "#e8547a" }}
                    >
                      ✦ Your Content Calendar
                    </p>
                    <h3
                      className="section-script mb-2"
                      style={{ fontSize: "clamp(28px, 4vw, 48px)", lineHeight: 1 }}
                    >
                      {calendar?.state === "approved"
                        ? "Approved & in motion"
                        : calendar?.state === "sent_to_client"
                        ? "Ready for your review"
                        : calendar?.state === "changes_requested"
                        ? "We're on your changes"
                        : "Being crafted for you"}
                    </h3>
                    <p
                      className="text-[14px] italic max-w-lg"
                      style={{ color: "var(--color-text-body)" }}
                    >
                      {calendar?.state === "sent_to_client"
                        ? "Open the calendar to leave your inputs and approve."
                        : calendar?.state === "approved"
                        ? "Every post is locked in. Watch the magic unfold."
                        : "We'll notify you the moment it's ready for your eyes."}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {calendar && <StatBadge status={calendar.state} />}
                    <span
                      className="text-[24px] transition-transform group-hover:translate-x-1"
                      style={{ color: "#e8547a" }}
                    >
                      →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </section>

          {/* REVIEW QUEUE */}
          {submitted.length > 0 && (
            <section className="mb-12">
              <div
                className="rounded-[28px] p-1"
                style={{
                  background: "linear-gradient(135deg, #e8547a 0%, #b89ce0 100%)",
                  boxShadow: "0 20px 60px rgba(232,84,122,0.3)",
                }}
              >
                <div
                  className="rounded-[26px] p-7 md:p-9 relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,220,232,0.85) 100%)",
                  }}
                >
                  <p
                    className="text-[11px] tracking-[0.45em] uppercase font-bold mb-3"
                    style={{ color: "#c23b68" }}
                  >
                    ✦ Your Call
                  </p>
                  <h3
                    className="section-script mb-2"
                    style={{ fontSize: "clamp(30px, 4vw, 52px)", lineHeight: 1 }}
                  >
                    Awaiting your review
                  </h3>
                  <p
                    className="text-[14px] italic mb-6 max-w-xl"
                    style={{ color: "var(--color-text-body)" }}
                  >
                    {submitted.length === 1
                      ? "One piece is ready for you to approve."
                      : `${submitted.length} pieces are ready for your eyes.`}
                  </p>

                  <div className="space-y-3">
                    {submitted.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        role="client"
                        userId={profile.id}
                        onAction={(verb) => {
                          if (verb === "review") setReviewing(t);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* APPROVED HISTORY */}
          {approved.length > 0 && (
            <section className="mb-12">
              <div className="mb-5">
                <p
                  className="text-[10px] tracking-[0.4em] uppercase font-bold mb-1"
                  style={{ color: "#1f7a3c" }}
                >
                  ✦ Locked In
                </p>
                <h3
                  className="font-bold"
                  style={{
                    fontFamily: "var(--font-script), cursive",
                    fontSize: 32,
                    color: "var(--color-text-deep)",
                  }}
                >
                  Approved by you
                </h3>
              </div>
              <div className="space-y-3">
                {approved.map((t) => (
                  <TaskCard key={t.id} task={t} role="client" userId={profile.id} />
                ))}
              </div>
            </section>
          )}

          {/* REJECTED — being reworked */}
          {rejected.length > 0 && (
            <section className="mb-12">
              <div className="mb-5">
                <p
                  className="text-[10px] tracking-[0.4em] uppercase font-bold mb-1"
                  style={{ color: "#c23b68" }}
                >
                  ⚠ Being reworked
                </p>
                <h3
                  className="font-bold"
                  style={{
                    fontFamily: "var(--font-script), cursive",
                    fontSize: 32,
                    color: "var(--color-text-deep)",
                  }}
                >
                  Round two coming
                </h3>
              </div>
              <div className="space-y-3">
                {rejected.map((t) => (
                  <TaskCard key={t.id} task={t} role="client" userId={profile.id} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <ReviewModal task={reviewing} onClose={() => setReviewing(null)} />
    </DashboardShell>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 text-center md:text-left"
      style={{
        background: "rgba(255,255,255,0.7)",
        border: `1px solid ${accent}33`,
      }}
    >
      <p
        className="font-black"
        style={{
          fontSize: 30,
          lineHeight: 1,
          background: `linear-gradient(135deg, ${accent}, #b89ce0)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {value}
      </p>
      <p
        className="text-[9px] tracking-[0.32em] uppercase font-bold mt-1"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </p>
    </div>
  );
}
