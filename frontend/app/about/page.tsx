import type { Metadata } from "next";
import Image from "next/image";
import SubpageShell, { JsonLd } from "@/components/SubpageShell";
import { SITE_URL } from "@/lib/seo-content";

export const metadata: Metadata = {
  title: "About Garima Rana — Founder & Content Strategist",
  description:
    "Garima Rana is the founder of The Garima Effect, a content strategy and brand storytelling studio working with 60+ D2C brands across beauty, wellness, hospitality, fashion and food. Read her story, philosophy and approach.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About Garima Rana",
    description:
      "Founder of The Garima Effect. 60+ brands. 120M+ views. ₹3.4Cr+ revenue moved. Read the founding story.",
    url: `${SITE_URL}/about`,
    images: ["/garima-studio.png"],
  },
};

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  url: `${SITE_URL}/about`,
  mainEntity: { "@id": `${SITE_URL}/#garima` },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "About", item: `${SITE_URL}/about` },
    ],
  },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutJsonLd} />
      <SubpageShell
        eyebrow="About the founder"
        title="Meet Garima Rana"
        subtitle="Content strategist, brand storyteller, and the creative engine behind The Garima Effect — a boutique studio helping founders turn a feed full of noise into a brand people remember."
      >
        <div className="my-10 rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #fde8f0, #f0dcf5)", padding: 24 }}>
          <div className="relative w-full" style={{ aspectRatio: "16/10", maxHeight: 400 }}>
            <Image
              src="/garima-studio.png"
              alt="Garima Rana — founder of The Garima Effect"
              fill
              style={{ objectFit: "contain", objectPosition: "center" }}
              priority
            />
          </div>
        </div>

        <h2>The short story</h2>
        <p>
          Garima Rana founded The Garima Effect in 2020 with one idea: that
          founders, not logos, are the most magnetic asset a small brand has.
          Since then she has shaped the voice, scripts, funnels and feed of{" "}
          <strong>60+ brands</strong> across beauty, wellness, hospitality,
          fashion and food — moving over <strong>120 million combined
          views</strong> and translating attention into{" "}
          <strong>₹3.4 crore+ in client revenue</strong>.
        </p>

        <h2>The longer story</h2>
        <p>
          The studio began as a side practice when Garima was running content
          for a single beauty brand and noticed something unusual: her best-
          performing posts were the ones where the founder spoke first-person.
          Not the polished campaign shots. Not the product montages. The
          founder, on camera, talking about why the brand existed.
        </p>
        <p>
          That observation became a thesis: the work most agencies do — making
          brands look bigger — was the opposite of what actually grows brands.
          What grows brands is making them sound{" "}
          <em>more like a specific person</em>. The Garima Effect was built
          around that idea.
        </p>
        <p>
          Today the studio is small by design — Garima leads strategy on every
          engagement personally. Most clients hear from her directly within 24
          hours. The point isn't to scale headcount; the point is to keep the
          studio close enough to founders that the voice never gets diluted.
        </p>

        <h2>Approach</h2>
        <p>
          Three principles run through every engagement:
        </p>
        <ul>
          <li>
            <strong>Voice first.</strong> Every brand has a sound. We find yours
            before writing a single reel.
          </li>
          <li>
            <strong>Story over template.</strong> Templates work for one quarter
            and die. Story compounds across years.
          </li>
          <li>
            <strong>Numbers next to taste.</strong> Every reel, caption and
            funnel is measured. If it doesn't earn its place, it gets cut.
          </li>
        </ul>

        <h2>Recognition</h2>
        <ul>
          <li>60+ D2C brands transformed across 5 verticals</li>
          <li>120M+ combined views attributed to studio-led content</li>
          <li>₹3.4Cr+ in client revenue moved</li>
          <li>Active since 2020 — boutique by choice, not scale</li>
        </ul>

        <h2>What Garima believes</h2>
        <p style={{ fontFamily: "var(--font-script), cursive", fontSize: "26px", color: "#3d1a4d", borderLeft: "3px solid #e8547a", paddingLeft: "18px", margin: "30px 0", fontStyle: "italic" }}>
          &ldquo;I don&rsquo;t sell content. I sell the way a brand makes someone
          feel the second they see it.&rdquo;
        </p>
        <p>
          That sentence is the studio&rsquo;s entire operating system. Every
          reel, every caption, every funnel is built around the feeling it
          should leave behind. Views are an input; feeling is the outcome.
        </p>
      </SubpageShell>
    </>
  );
}
