import type { Metadata } from "next";
import Link from "next/link";
import SubpageShell, { JsonLd } from "@/components/SubpageShell";
import { SERVICES, SITE_URL } from "@/lib/seo-content";

export const metadata: Metadata = {
  title: "Services — Content, Story, Funnels, Founder Branding",
  description:
    "Six services from The Garima Effect: content strategy, Instagram growth, brand storytelling, reels production, sales funnel design, and founder branding. Built for D2C founders.",
  alternates: { canonical: `${SITE_URL}/services` },
  openGraph: {
    title: "Services — The Garima Effect",
    description:
      "Content strategy, Instagram growth, brand storytelling and founder branding for D2C brands.",
    url: `${SITE_URL}/services`,
    images: ["/garima-studio.png"],
  },
};

const servicesJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: SERVICES.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Service",
      name: s.title,
      description: s.short,
      url: `${SITE_URL}/services/${s.slug}`,
      provider: { "@id": `${SITE_URL}/#organization` },
    },
  })),
};

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={servicesJsonLd} />
      <SubpageShell
        eyebrow="What we do"
        title="Services"
        subtitle="Six ways The Garima Effect partners with founders. Pick the one that maps to where your brand actually is."
      >
        <div className="grid gap-5 mt-6">
          {SERVICES.map((s) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="block p-6 md:p-7 rounded-2xl transition-all hover:scale-[1.01]"
              style={{
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(232,84,122,0.18)",
                boxShadow: "0 6px 20px rgba(155,127,199,0.12)",
              }}
            >
              <p className="text-[10px] tracking-[0.32em] uppercase font-bold mb-2" style={{ color: "#e8547a" }}>
                {s.engagement}
              </p>
              <h2 className="font-bold mb-2" style={{ fontSize: "clamp(22px, 3vw, 28px)", color: "#3d1a4d", margin: 0 }}>
                {s.title}
              </h2>
              <p className="text-[15px] leading-relaxed" style={{ color: "#5a3a6e", margin: "8px 0 12px" }}>
                {s.short}
              </p>
              <span className="text-[12px] font-semibold tracking-[0.15em] uppercase" style={{ color: "#e8547a" }}>
                Read more →
              </span>
            </Link>
          ))}
        </div>
      </SubpageShell>
    </>
  );
}
