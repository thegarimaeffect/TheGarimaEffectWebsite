import type { MetadataRoute } from "next";
import { SERVICES, CASE_STUDIES, BLOG_POSTS, SITE_URL } from "@/lib/seo-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,                       lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/about`,            lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/services`,         lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/case-studies`,     lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/blog`,             lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE_URL}/faq`,              lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`,          lastModified: now, changeFrequency: "yearly",  priority: 0.7 },
  ];

  const servicePages: MetadataRoute.Sitemap = SERVICES.map((s) => ({
    url: `${SITE_URL}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const caseStudyPages: MetadataRoute.Sitemap = CASE_STUDIES.map((c) => ({
    url: `${SITE_URL}/case-studies/${c.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...servicePages, ...caseStudyPages, ...blogPages];
}
