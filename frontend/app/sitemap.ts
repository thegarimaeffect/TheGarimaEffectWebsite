import type { MetadataRoute } from "next";

const SITE_URL = "https://thegarimaeffect.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    // Future content pages (placeholders for Phase 2)
    // {
    //   url: `${SITE_URL}/about`,
    //   lastModified: now,
    //   changeFrequency: "monthly",
    //   priority: 0.8,
    // },
    // {
    //   url: `${SITE_URL}/services`,
    //   lastModified: now,
    //   changeFrequency: "monthly",
    //   priority: 0.8,
    // },
    // {
    //   url: `${SITE_URL}/faq`,
    //   lastModified: now,
    //   changeFrequency: "monthly",
    //   priority: 0.7,
    // },
    // {
    //   url: `${SITE_URL}/contact`,
    //   lastModified: now,
    //   changeFrequency: "yearly",
    //   priority: 0.6,
    // },
  ];
}
