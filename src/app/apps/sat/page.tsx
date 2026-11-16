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
    <div className="flex h-dvh flex-col bg-dusk text-bone/80">
      <header className="z-20 flex items-center justify-between gap-4 border-b border-khaki/25 bg-dusk/95 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="min-w-0">
          <p className="kicker">
            Hogback Sat
          </p>
          <h1 className="truncate font-display text-lg font-semibold uppercase tracking-wide text-bone sm:text-xl">
            Live satellite feed
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-sm">
          <Link
            href="/products/sat"
            className="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-sage transition hover:text-bone sm:inline"
          >
            Product
          </Link>
          <Link
            href="/"
            className="rounded-md border border-khaki/40 px-3 py-1.5 text-bone hover:bg-khaki/10"
          >
            Home
          </Link>
        </div>
      </header>

      <main className="min-h-0 flex-1">
        <SatelliteMap />
      </main>

      <footer className="border-t border-khaki/20 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-sage sm:px-6">
        Near-real-time imagery via{" "}
        <a
          href="https://earthdata.nasa.gov/gibs"
          className="text-khaki hover:text-bone"
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
