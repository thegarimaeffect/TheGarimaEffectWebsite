import type { Metadata } from "next";
import { Dancing_Script, Outfit, Bebas_Neue } from "next/font/google";
import "./globals.css";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-script",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-body",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Garima Effect — From Concept to Content",
  description:
    "Garima Rana — Content strategist, Instagram growth expert, and brand storyteller. From concept to content, she transforms brands into magnetic stories that sell.",
  keywords: [
    "Garima Rana",
    "Content Strategy",
    "Instagram Growth",
    "Brand Storytelling",
    "Sales Funnels",
    "Reels",
    "UGC",
  ],
  openGraph: {
    title: "The Garima Effect",
    description: "From concept to content — magnetic brand storytelling.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${dancingScript.variable} ${outfit.variable} ${bebasNeue.variable} font-body`}
      >
        {children}
      </body>
    </html>
  );
}
