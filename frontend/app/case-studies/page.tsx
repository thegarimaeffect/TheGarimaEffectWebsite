import type { Metadata } from "next";
import Link from "next/link";
import SubpageShell, { JsonLd } from "@/components/SubpageShell";
import { CASE_STUDIES, SITE_URL } from "@/lib/seo-content";

export const metadata: Metadata = {
  title: "Case Studies — Work by The Garima Effect",
  description:
    "How The Garima Effect transformed real D2C brands. Read case studies on Lumen Skincare, Sage Wellness Studio, Eos Boutique Hotels and other founders we've partnered with.",
  alternates: { canonical: `${SITE_URL}/case-studies` },
  openGraph: {
    title: "Case Studies — The Garima Effect",
    description: "Real brands. Real numbers. Read the work.",
    url: `${SITE_URL}/case-studies`,
    images: ["/garima-studio.png"],
  },
};

const listJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  url: `${SITE_URL}/case-studies`,
  name: "Case Studies",
  hasPart: CASE_STUDIES.map((c) => ({
    "@type": "Article",
    headline: c.brand,
    description: c.oneLiner,
    url: `${SITE_URL}/case-studies/${c.slug}`,
  })),
};

export default function CaseStudiesPage() {
  return (
    <>
      <JsonLd data={listJsonLd} />
      <SubpageShell
        eyebrow="Selected work"
        title="Case Studies"
        subtitle="Three brands. Three different problems. One pattern: founder voice + measured rebuild."
      >
        <div className="grid gap-5 mt-6">
          {CASE_STUDIES.map((c) => (
            <Link
              key={c.slug}
              href={`/case-studies/${c.slug}`}
              className="block p-6 md:p-7 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(232,84,122,0.18)",
              }}
            >
              <p className="text-[10px] tracking-[0.32em] uppercase font-bold mb-2" style={{ color: "#e8547a" }}>
                {c.category}
              </p>
              <h2 className="font-bold mb-2" style={{ fontSize: "clamp(22px, 3vw, 28px)", color: "#3d1a4d", margin: 0 }}>
                {c.brand}
              </h2>
              <p className="text-[15px] leading-relaxed" style={{ color: "#5a3a6e", margin: "8px 0 14px" }}>
                {c.oneLiner}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {c.metrics.map((m, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-semibold px-3 py-1 rounded-full"
                    style={{ background: "rgba(232,84,122,0.12)", color: "#e8547a" }}
                  >
                    {m.label}: {m.value}
                  </span>
                ))}
              </div>
              <span className="text-[12px] font-semibold tracking-[0.15em] uppercase" style={{ color: "#e8547a" }}>
                Read full study →
              </span>
            </Link>
          ))}
        </div>
      </SubpageShell>
    </>
  );
}
