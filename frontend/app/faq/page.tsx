import type { Metadata } from "next";
import SubpageShell, { JsonLd } from "@/components/SubpageShell";
import { FAQS, SITE_URL } from "@/lib/seo-content";

export const metadata: Metadata = {
  title: "FAQ — Working with The Garima Effect",
  description:
    "Answers to the most common questions about working with Garima Rana and The Garima Effect — pricing, process, industries, results, and how engagements actually run.",
  alternates: { canonical: `${SITE_URL}/faq` },
  openGraph: {
    title: "FAQ — The Garima Effect",
    description: "How we work, what we charge, who we work with, what to expect.",
    url: `${SITE_URL}/faq`,
    images: ["/garima-studio.png"],
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FAQPage() {
  return (
    <>
      <JsonLd data={faqJsonLd} />
      <SubpageShell
        eyebrow="Frequently asked"
        title="FAQ"
        subtitle="The honest answers to what people actually ask before booking a call."
      >
        <div className="mt-6 flex flex-col gap-3">
          {FAQS.map((f, i) => (
            <details
              key={i}
              className="rounded-2xl p-6 group"
              style={{
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(232,84,122,0.18)",
              }}
            >
              <summary
                className="cursor-pointer font-semibold list-none flex justify-between items-start gap-4"
                style={{ color: "#3d1a4d", fontSize: "16px", lineHeight: 1.5 }}
              >
                <span>{f.q}</span>
                <span className="shrink-0 text-[20px] leading-none group-open:rotate-45 transition-transform" style={{ color: "#e8547a" }}>+</span>
              </summary>
              <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "#4a2e5f", margin: "16px 0 0" }}>
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </SubpageShell>
    </>
  );
}
