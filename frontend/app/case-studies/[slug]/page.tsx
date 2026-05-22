import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SubpageShell, { JsonLd } from "@/components/SubpageShell";
import { CASE_STUDIES, SITE_URL } from "@/lib/seo-content";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = CASE_STUDIES.find((x) => x.slug === params.slug);
  if (!c) return {};
  return {
    title: `${c.brand} — Case Study`,
    description: c.oneLiner,
    alternates: { canonical: `${SITE_URL}/case-studies/${c.slug}` },
    openGraph: {
      title: `${c.brand} — The Garima Effect`,
      description: c.oneLiner,
      url: `${SITE_URL}/case-studies/${c.slug}`,
      type: "article",
      images: ["/garima-studio.png"],
    },
  };
}

export default function CaseStudyDetail({ params }: Props) {
  const c = CASE_STUDIES.find((x) => x.slug === params.slug);
  if (!c) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${c.brand} — Case Study`,
    description: c.oneLiner,
    author: { "@id": `${SITE_URL}/#garima` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    url: `${SITE_URL}/case-studies/${c.slug}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/case-studies/${c.slug}` },
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <SubpageShell eyebrow={`${c.category} · case study`} title={c.brand} subtitle={c.oneLiner}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-8">
          {c.metrics.map((m, i) => (
            <div key={i} className="p-5 rounded-2xl text-center" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(232,84,122,0.18)" }}>
              <p className="font-bold mb-1" style={{ fontSize: "22px", color: "#e8547a" }}>{m.value}</p>
              <p className="text-[11px] tracking-[0.2em] uppercase" style={{ color: "#5a3a6e" }}>{m.label}</p>
            </div>
          ))}
        </div>

        <h2>The challenge</h2>
        <p>{c.challenge}</p>

        <h2>Our approach</h2>
        <p>{c.approach}</p>

        <h2>The outcome</h2>
        <p>{c.result}</p>
      </SubpageShell>
    </>
  );
}
