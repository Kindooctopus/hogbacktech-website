import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, Source_Sans_3 } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { MailtoContactConversion } from "@/components/MailtoContactConversion";
import { company } from "@/lib/content";
import { GOOGLE_ADS_ID } from "@/lib/google-ads";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-plex-mono",
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
    "Hogback Sat",
    "live satellite imagery",
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
    images: [{ url: "/brand/hero-banner.png", width: 1024, height: 1024, alt: company.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: company.name,
    description: company.mission,
  },
  robots: { index: true, follow: true },
  icons: { icon: "/brand/top-logo.png", apple: "/brand/top-logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${barlowCondensed.variable} ${plexMono.variable}`}
    >
      <body className="font-sans antialiased">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = window.gtag || gtag;
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
          `}
        </Script>
        <MailtoContactConversion />
        {children}
      </body>
    </html>
  );
}
