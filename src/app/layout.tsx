import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Hogback Tech | Software, Applications & Engagement",
    template: "%s | Hogback Tech",
  },
  description:
    "Hogback Tech builds custom software, modern applications, and meaningful digital engagement experiences. Based in The Dalles, Oregon.",
  keywords: [
    "software development",
    "web applications",
    "mobile apps",
    "digital engagement",
    "Hogback Tech",
    "Oregon tech",
  ],
  authors: [{ name: "Hogback Tech" }],
  creator: "Hogback Tech",
  metadataBase: new URL("https://hogbacktech.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hogbacktech.com",
    siteName: "Hogback Tech",
    title: "Hogback Tech | Software, Applications & Engagement",
    description:
      "Custom software, modern applications, and meaningful digital engagement experiences.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hogback Tech | Software, Applications & Engagement",
    description:
      "Custom software, modern applications, and meaningful digital engagement experiences.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${instrumentSerif.variable}`}>
      <body className="font-sans antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
