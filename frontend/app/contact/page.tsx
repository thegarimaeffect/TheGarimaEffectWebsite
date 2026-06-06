import type { Metadata } from "next";
import SubpageShell, { JsonLd } from "@/components/SubpageShell";
import CalendlyInline from "@/components/CalendlyInline";
import { SITE_URL } from "@/lib/seo-content";

export const metadata: Metadata = {
  title: "Contact The Garima Effect — Book a Discovery Call",
  description:
    "Book a 30-minute discovery call with Garima Rana. Talk directly with the founder about your brand. Free, no pitch deck, India and international clients welcome.",
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: "Contact The Garima Effect",
    description: "Book a discovery call with Garima Rana.",
    url: `${SITE_URL}/contact`,
    images: ["/garima-studio.png"],
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#localbusiness`,
  name: "The Garima Effect",
  description:
    "Content strategy and brand storytelling studio for D2C founders.",
  url: SITE_URL,
  image: `${SITE_URL}/garima-studio.png`,
  logo: `${SITE_URL}/garima-studio.png`,
  founder: { "@id": `${SITE_URL}/#garima` },
  priceRange: "₹₹₹",
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
  },
  areaServed: [
    { "@type": "Country", name: "India" },
    { "@type": "Country", name: "United States" },
    { "@type": "Country", name: "United Kingdom" },
    { "@type": "Country", name: "United Arab Emirates" },
    { "@type": "Country", name: "Singapore" },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Sales",
    url: SITE_URL,
    availableLanguage: ["English", "Hindi"],
  },
  sameAs: [
    "https://www.instagram.com/garimaeffect",
    "https://www.linkedin.com/in/garimarana",
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Contact", item: `${SITE_URL}/contact` },
  ],
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={localBusinessJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <SubpageShell
        eyebrow="Get in touch"
        title="Let's talk"
        subtitle="Book a 30-minute discovery call. Free, direct with Garima, no pitch deck. By the end you'll know whether we're a fit — and if not, we'll point you to someone better."
      >
        {/* Live Calendly booking calendar */}
        <div className="my-8">
          <CalendlyInline />
        </div>

        <div className="grid md:grid-cols-2 gap-6 my-8">
          <a
            href="https://www.instagram.com/garimaeffect"
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-2xl block"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(232,84,122,0.18)" }}
          >
            <p className="font-bold mb-2" style={{ color: "#3d1a4d", fontSize: 18 }}>Instagram DM</p>
            <p className="text-[14px]" style={{ color: "#5a3a6e" }}>
              @garimaeffect — the fastest way to reach us. Usually replied within 4 hours during India work hours.
            </p>
          </a>
          <a
            href="https://www.linkedin.com/in/garimarana"
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-2xl block"
            style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(232,84,122,0.18)" }}
          >
            <p className="font-bold mb-2" style={{ color: "#3d1a4d", fontSize: 18 }}>LinkedIn</p>
            <p className="text-[14px]" style={{ color: "#5a3a6e" }}>
              Connect with Garima on LinkedIn for partnership, podcast or speaking inquiries.
            </p>
          </a>
        </div>

        <h2>What to expect on the call</h2>
        <ul>
          <li>5 min — your brand, where you are now, what's not working</li>
          <li>10 min — what we'd do differently and why</li>
          <li>10 min — honest scope, timeline, pricing band</li>
          <li>5 min — Q&amp;A and next steps (or polite no-fit)</li>
        </ul>

        <h2>Who we work with</h2>
        <p>
          D2C founders, service-business founders, and personal brands in
          beauty, wellness, hospitality, fashion and food. Most engagements
          are with India-based founders, though we work with brands in the
          US, UK, UAE and Singapore too.
        </p>

        <h2>Who we don&rsquo;t work with</h2>
        <p>
          Large brands wanting a vendor. Agencies looking to white-label our
          work. Anyone who measures success only in views. We&rsquo;d rather
          do five engagements a year that change the brand than fifty that
          fill a calendar.
        </p>
      </SubpageShell>
    </>
  );
}
