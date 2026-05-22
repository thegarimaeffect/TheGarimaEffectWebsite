import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SubpageShell, { JsonLd } from "@/components/SubpageShell";
import { SERVICES, SITE_URL } from "@/lib/seo-content";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = SERVICES.find((x) => x.slug === params.slug);
  if (!s) return {};
  return {
    title: `${s.title} for D2C Founders`,
    description: s.short,
    alternates: { canonical: `${SITE_URL}/services/${s.slug}` },
    openGraph: {
      title: `${s.title} — The Garima Effect`,
      description: s.short,
      url: `${SITE_URL}/services/${s.slug}`,
      images: ["/garima-studio.png"],
    },
  };
}

export default function ServiceDetail({ params }: Props) {
  const s = SERVICES.find((x) => x.slug === params.slug);
  if (!s) notFound();

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.title,
    description: s.intro,
    provider: { "@id": `${SITE_URL}/#organization` },
    serviceType: s.title,
    areaServed: "IN",
    url: `${SITE_URL}/services/${s.slug}`,
    offers: {
      "@type": "Offer",
      description: s.engagement,
      availability: "https://schema.org/InStock",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` },
      { "@type": "ListItem", position: 3, name: s.title, item: `${SITE_URL}/services/${s.slug}` },
    ],
  };

  return (
    <>
      <JsonLd data={serviceJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <SubpageShell eyebrow={s.engagement} title={s.title} subtitle={s.intro}>
        {s.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}

        <h2>What you get</h2>
        <ul>
          {s.deliverables.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>

        <h2>Ideal for</h2>
        <ul>
          {s.idealFor.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>

        <h2>Engagement</h2>
        <p>{s.engagement}.</p>

        <div className="mt-10 p-6 rounded-2xl text-center" style={{ background: "linear-gradient(135deg, #e8547a, #b89ce0)", color: "white" }}>
          <p className="text-[13px] tracking-[0.3em] uppercase font-bold mb-2 opacity-90">Ready to start?</p>
          <h3 className="text-2xl font-bold mb-3" style={{ color: "white", margin: 0 }}>
            Book a 30-minute discovery call
          </h3>
          <p className="opacity-90 mb-5 text-[14px]">Free. No pitch deck. Talk directly with Garima.</p>
          <Link
            href="/contact"
            className="inline-block px-7 py-3 rounded-full font-bold text-[12px] tracking-[0.22em] uppercase"
            style={{ background: "white", color: "#e8547a" }}
          >
            Book a call →
          </Link>
        </div>
      </SubpageShell>
    </>
  );
}
