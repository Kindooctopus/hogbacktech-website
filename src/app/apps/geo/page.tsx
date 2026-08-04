import type { Metadata } from "next";
import { GsiMap } from "@/components/GsiMap";
import { HogbackMapAppShell } from "@/components/HogbackMapAppShell";
import { company } from "@/lib/content";

export const metadata: Metadata = {
  title: "Hogback Geo — Fire Layers & Situational Map",
  description:
    "The Hogback Geo map — topo, satellite, imagery, and relief basemaps with live NIFC fire layers, perimeters, evacuations, AVL, and unit locations.",
  openGraph: {
    title: `Hogback Geo map | ${company.name}`,
    description:
      "Live fire layers, AVL, and GIS overlays on topo / satellite / imagery / relief basemaps — the Hogback Geo map.",
    images: [
      {
        url: "/brand/products/geo.png",
        width: 1024,
        height: 1024,
        alt: "Hogback Geo map",
      },
    ],
  },
};

export default function HogbackGeoAppPage() {
  return (
    <HogbackMapAppShell
      eyebrow="Hogback Geo"
      title="Geo map — fire layers, units & AVL"
      footer={
        <>
          <strong className="font-medium text-slate-400">
            Informational only.
          </strong>{" "}
          Incidents, perimeters, and hotshot/IHC locations from{" "}
          <a
            href="https://data-nifc.opendata.arcgis.com/"
            className="text-copper-400 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            NIFC / USFS
          </a>
          ; evacuations and fire resource AVL from{" "}
          <a
            href="https://www.caloes.ca.gov/"
            className="text-copper-400 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Cal OES
          </a>
          ; ODF units from{" "}
          <a
            href="https://gis.odf.oregon.gov/"
            className="text-copper-400 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Oregon Department of Forestry
          </a>
          ; USFS Oregon offices from{" "}
          <a
            href="https://data.fs.usda.gov/geodata/edw/"
            className="text-copper-400 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            USFS EDW
          </a>
          . Basemaps from OpenTopoMap, Esri, and USGS. Not a substitute for
          official alerts, dispatch, or Field Maps incident systems.
        </>
      }
    >
      <GsiMap />
    </HogbackMapAppShell>
  );
}
