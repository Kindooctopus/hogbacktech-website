import type { Metadata } from "next";
import { GsiMap } from "@/components/GsiMap";
import { HogbackMapAppShell } from "@/components/HogbackMapAppShell";
import { company } from "@/lib/content";

export const metadata: Metadata = {
  title: "Hogback Geo — Advanced Mapping & GIS Layers",
  description:
    "Hogback Geo advanced mapping with topo, satellite, imagery, and relief basemaps plus live GIS overlays for situational awareness.",
  openGraph: {
    title: `Hogback Geo | ${company.name}`,
    description:
      "Topo, satellite, imagery, and relief basemaps with live GIS overlays for fleet and field situational awareness.",
    images: [
      {
        url: "/brand/products/geo.png",
        width: 1024,
        height: 1024,
        alt: "Hogback Geo",
      },
    ],
  },
};

export default function HogbackGeoAppPage() {
  return (
    <HogbackMapAppShell
      activeApp="geo"
      eyebrow="Hogback Geo"
      title="Advanced mapping & GIS layers"
      footer={
        <>
          <strong className="font-medium text-slate-400">
            Informational only.
          </strong>{" "}
          Basemaps from OpenTopoMap, Esri, and USGS. Overlay feeds from{" "}
          <a
            href="https://data-nifc.opendata.arcgis.com/"
            className="text-copper-400 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            NIFC / USFS
          </a>
          ,{" "}
          <a
            href="https://www.caloes.ca.gov/"
            className="text-copper-400 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Cal OES
          </a>
          , and{" "}
          <a
            href="https://gis.odf.oregon.gov/"
            className="text-copper-400 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            ODF
          </a>
          . Not a substitute for official dispatch or fleet systems.
        </>
      }
    >
      <GsiMap />
    </HogbackMapAppShell>
  );
}
