import type { Metadata } from "next";
import { Barlow, DM_Sans } from "next/font/google";
import "./globals.css";
import { company } from "@/lib/content";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${company.name} | Mission-Critical Software`,
    template: `%s | ${company.shortName}`,
  },
  description: company.mission,
  keywords: [
    "public safety software",
    "fleet tracking",
    "document management",
    "custom software development",
    "Hogback Ops",
    "Hogback Geo",
    "Hogback Docs",
    "Hogback Forge",
    "Columbia River Gorge",
    "Oregon technology",
  ],
  authors: [{ name: company.name }],
  creator: company.name,
  metadataBase: new URL(`https://${company.domain}`),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `https://${company.domain}`,
    siteName: company.name,
    title: `${company.name} | ${company.tagline}`,
    description: company.mission,
    images: [{ url: "/brand/hero-ridge.png", width: 1200, height: 630, alt: company.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: company.name,
    description: company.mission,
  },
  robots: { index: true, follow: true },
  icons: { icon: "/brand/logo-mark.png", apple: "/brand/logo-mobile.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${barlow.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
