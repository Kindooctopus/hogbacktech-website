import type { Metadata } from "next";
import Link from "next/link";
import { GsiMap } from "@/components/GsiMap";
import { company } from "@/lib/content";

export const metadata: Metadata = {
  title: "Hogback GSI — NIFC Fire & Evacuation Layers",
  description:
    "Geographic situational intelligence with NIFC WFIGS incidents, fire perimeters, and evacuation zones for public safety awareness.",
  openGraph: {
    title: `Hogback GSI | ${company.name}`,
    description:
      "NIFC incident information, interagency fire perimeters, and evacuation overlays on one map.",
    images: [
      {
        url: "/brand/products/gsi.png",
        width: 1024,
        height: 1024,
        alt: "Hogback GSI",
      },
    ],
  },
};

export default function HogbackGsiAppPage() {
  return (
    <div className="flex h-dvh flex-col bg-navy-950 text-slate-300">
      <header className="z-20 flex items-center justify-between gap-4 border-b border-white/10 bg-navy-950/95 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-copper-400">
            Hogback GSI
          </p>
          <h1 className="truncate font-display text-lg font-semibold text-white sm:text-xl">
            NIFC fire &amp; evacuation layers
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-sm">
          <Link
            href="/products/gsi"
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
        <GsiMap />
      </main>

      <footer className="border-t border-white/10 px-4 py-2 text-[11px] leading-relaxed text-slate-500 sm:px-6">
        <strong className="font-medium text-slate-400">Informational only.</strong>{" "}
        Incidents and perimeters from{" "}
        <a
          href="https://data-nifc.opendata.arcgis.com/"
          className="text-copper-400 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          NIFC WFIGS
        </a>
        ; evacuations from{" "}
        <a
          href="https://www.caloes.ca.gov/"
          className="text-copper-400 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          Cal OES
        </a>
        . Not a substitute for official alerts or local emergency management.
      </footer>
    </div>
  );
}
