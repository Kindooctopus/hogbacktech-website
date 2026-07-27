import type { Metadata } from "next";
import Link from "next/link";
import { SatelliteMap } from "@/components/SatelliteMap";
import { company } from "@/lib/content";

export const metadata: Metadata = {
  title: "Hogback Sat — Live Satellite Feed",
  description:
    "Near-real-time NASA satellite imagery for situational awareness across the Pacific Northwest and beyond.",
  openGraph: {
    title: `Hogback Sat | ${company.name}`,
    description:
      "Live satellite feed powered by NASA GIBS — true color, thermal/fire, and night lights.",
    images: [{ url: "/brand/products/sat.png", width: 1024, height: 1024, alt: "Hogback Sat" }],
  },
};

export default function HogbackSatAppPage() {
  return (
    <div className="flex h-dvh flex-col bg-navy-950 text-slate-300">
      <header className="z-20 flex items-center justify-between gap-4 border-b border-white/10 bg-navy-950/95 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-copper-400">
            Hogback Sat
          </p>
          <h1 className="truncate font-display text-lg font-semibold text-white sm:text-xl">
            Live satellite feed
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-sm">
          <Link
            href="/products/sat"
            className="hidden text-slate-400 transition hover:text-white sm:inline"
          >
            Product
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/15 px-3 py-1.5 text-white hover:bg-white/5"
          >
            Home
          </Link>
        </div>
      </header>

      <main className="min-h-0 flex-1">
        <SatelliteMap />
      </main>

      <footer className="border-t border-white/10 px-4 py-2 text-[11px] text-slate-500 sm:px-6">
        Near-real-time imagery via{" "}
        <a
          href="https://earthdata.nasa.gov/gibs"
          className="text-copper-400 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          NASA GIBS
        </a>
        . Updates typically lag a few hours after satellite observation.
      </footer>
    </div>
  );
}
