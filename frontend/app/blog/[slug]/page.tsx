import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SubpageShell, { JsonLd } from "@/components/SubpageShell";
import { BLOG_POSTS, SITE_URL } from "@/lib/seo-content";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = BLOG_POSTS.find((x) => x.slug === params.slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.excerpt,
    alternates: { canonical: `${SITE_URL}/blog/${p.slug}` },
    openGraph: {
      title: p.title,
      description: p.excerpt,
      url: `${SITE_URL}/blog/${p.slug}`,
      type: "article",
      publishedTime: p.date,
      authors: ["Garima Rana"],
      images: ["/garima-studio.png"],
    },
  };
}

function renderBody(text: string, key: number) {
  // simple **bold** parser for paragraphs
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p key={key}>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          part
        )
      )}
    </p>
  );
}

export default function BlogPostPage({ params }: Props) {
  const p = BLOG_POSTS.find((x) => x.slug === params.slug);
  if (!p) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.excerpt,
    datePublished: p.date,
    dateModified: p.date,
    author: { "@id": `${SITE_URL}/#garima` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    image: `${SITE_URL}/garima-studio.png`,
    url: `${SITE_URL}/blog/${p.slug}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${p.slug}` },
    keywords: p.keyword,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: p.title, item: `${SITE_URL}/blog/${p.slug}` },
    ],
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <SubpageShell
        eyebrow={new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        title={p.title}
        subtitle={p.excerpt}
      >
        {p.body.map((para, i) => renderBody(para, i))}
        <p className="mt-12 pt-6 text-[12px]" style={{ borderTop: "1px solid rgba(232,84,122,0.2)", color: "#9b7fa5" }}>
          Written by <strong style={{ color: "#3d1a4d" }}>Garima Rana</strong> · founder, The Garima Effect.
        </p>
      </SubpageShell>
    </>
  );
}
