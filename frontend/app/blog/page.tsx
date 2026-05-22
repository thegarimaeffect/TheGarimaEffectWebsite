import type { Metadata } from "next";
import Link from "next/link";
import SubpageShell, { JsonLd } from "@/components/SubpageShell";
import { BLOG_POSTS, SITE_URL } from "@/lib/seo-content";

export const metadata: Metadata = {
  title: "Blog — Notes on Content, Story & D2C Growth",
  description:
    "Field notes from Garima Rana and The Garima Effect on content strategy, Instagram growth, brand storytelling, and how D2C founders win attention.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "Blog — The Garima Effect",
    description: "Content strategy and brand storytelling notes for D2C founders.",
    url: `${SITE_URL}/blog`,
    images: ["/garima-studio.png"],
  },
};

const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  url: `${SITE_URL}/blog`,
  name: "The Garima Effect Blog",
  description:
    "Field notes on content strategy, Instagram growth, brand storytelling, and D2C content engines.",
  publisher: { "@id": `${SITE_URL}/#organization` },
  blogPost: BLOG_POSTS.map((p) => ({
    "@type": "BlogPosting",
    headline: p.title,
    description: p.excerpt,
    datePublished: p.date,
    url: `${SITE_URL}/blog/${p.slug}`,
    author: { "@id": `${SITE_URL}/#garima` },
  })),
};

export default function BlogIndex() {
  return (
    <>
      <JsonLd data={blogJsonLd} />
      <SubpageShell
        eyebrow="Field notes"
        title="Blog"
        subtitle="Long-form notes from inside the studio — what's actually working in content right now, and what isn't."
      >
        <div className="grid gap-5 mt-6">
          {BLOG_POSTS.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="block p-6 md:p-7 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(232,84,122,0.18)" }}
            >
              <p className="text-[10px] tracking-[0.32em] uppercase font-bold mb-2" style={{ color: "#9b7fa5" }}>
                {new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              <h2 className="font-bold mb-2" style={{ fontSize: "clamp(20px, 2.6vw, 26px)", color: "#3d1a4d", margin: 0 }}>
                {p.title}
              </h2>
              <p className="text-[15px] leading-relaxed" style={{ color: "#5a3a6e", margin: "8px 0 12px" }}>
                {p.excerpt}
              </p>
              <span className="text-[12px] font-semibold tracking-[0.15em] uppercase" style={{ color: "#e8547a" }}>
                Read post →
              </span>
            </Link>
          ))}
        </div>
      </SubpageShell>
    </>
  );
}
