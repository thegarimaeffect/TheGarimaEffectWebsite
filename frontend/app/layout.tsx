import type { Metadata } from "next";
import { Dancing_Script, Outfit, Bebas_Neue } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-script",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
  display: "swap",
});

const SITE_URL = "https://thegarimaeffect.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "The Garima Effect — Content Strategy & Brand Storytelling Studio",
    template: "%s · The Garima Effect",
  },
  description:
    "Garima Rana is a content strategist and brand storyteller who has scaled 60+ brands across beauty, wellness, hospitality, fashion and food — driving 120M+ views and ₹3.4Cr+ in revenue. From concept to content, magnetic storytelling that sells.",
  keywords: [
    "Garima Rana",
    "The Garima Effect",
    "content strategist India",
    "Instagram growth strategist",
    "brand storytelling",
    "reels strategy",
    "UGC creator",
    "sales funnels D2C",
    "content marketing agency India",
    "founder branding",
    "beauty brand marketing",
    "wellness brand strategy",
  ],
  authors: [{ name: "Garima Rana", url: SITE_URL }],
  creator: "Garima Rana",
  publisher: "The Garima Effect",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "The Garima Effect",
    title: "The Garima Effect — Content Strategy & Brand Storytelling Studio",
    description:
      "Boutique content studio led by Garima Rana. 60+ brands transformed, 120M+ views, ₹3.4Cr+ revenue moved. Concept to content — story-led growth for founders.",
    images: [
      {
        url: "/garima-studio.png",
        width: 1200,
        height: 630,
        alt: "Garima Rana, founder of The Garima Effect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Garima Effect — Content Strategy & Brand Storytelling",
    description:
      "60+ brands. 120M+ views. ₹3.4Cr+ revenue moved. Garima Rana turns founder stories into magnetic content.",
    images: ["/garima-studio.png"],
    creator: "@garimaeffect",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "Business",
  other: {
    "geo.region": "IN",
    "geo.placename": "India",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "The Garima Effect",
      url: SITE_URL,
      logo: `${SITE_URL}/garima-studio.png`,
      image: `${SITE_URL}/garima-studio.png`,
      description:
        "Boutique content & brand storytelling studio helping founders turn noise into a brand people remember.",
      founder: { "@id": `${SITE_URL}/#garima` },
      foundingDate: "2020",
      areaServed: "IN",
      sameAs: [
        "https://www.instagram.com/garimaeffect",
        "https://www.linkedin.com/in/garimarana",
      ],
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#garima`,
      name: "Garima Rana",
      jobTitle: "Founder & Content Strategist",
      worksFor: { "@id": `${SITE_URL}/#organization` },
      image: `${SITE_URL}/garima-studio.png`,
      url: SITE_URL,
      description:
        "Content strategist and brand storyteller. Founder of The Garima Effect. Has scaled 60+ brands across beauty, wellness, hospitality, fashion and food with 120M+ views and ₹3.4Cr+ in revenue.",
      knowsAbout: [
        "Content Strategy",
        "Instagram Growth",
        "Brand Storytelling",
        "Reels Strategy",
        "Sales Funnels",
        "Founder Branding",
      ],
      sameAs: [
        "https://www.instagram.com/garimaeffect",
        "https://www.linkedin.com/in/garimarana",
      ],
    },
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#service`,
      name: "The Garima Effect — Content & Brand Studio",
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: { "@type": "Country", name: "India" },
      serviceType: [
        "Content Strategy",
        "Instagram Growth",
        "Brand Storytelling",
        "Reels Production",
        "Sales Funnel Design",
        "Founder Branding",
      ],
      url: SITE_URL,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "The Garima Effect",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-IN",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          id="ld-json-site"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${dancingScript.variable} ${outfit.variable} ${bebasNeue.variable} font-body`}
      >
        {children}
      </body>
    </html>
  );
}
