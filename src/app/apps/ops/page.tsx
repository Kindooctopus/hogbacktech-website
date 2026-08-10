import type { Metadata } from "next";
import { GsiMap } from "@/components/GsiMap";
import { HogbackMapAppShell } from "@/components/HogbackMapAppShell";
import { company } from "@/lib/content";

export const metadata: Metadata = {
  title: "Hogback Ops — Map, Layers & AR Compass",
  description:
    "Hogback Ops — the public safety operations map with live fire layers, heat signatures, wind, AVL, and AR compass for field situational awareness.",
  openGraph: {
    title: `Hogback Ops | ${company.name}`,
    description:
      "Operations map with Hogback Geo layers and AR compass — fire, heat, wind, AVL, and heading-aware targeting.",
    images: [
      {
        url: "/brand/products/ops.png",
        width: 1024,
        height: 1024,
        alt: "Hogback Ops",
      },
    ],
  },
};

export default function HogbackOpsAppPage() {
  return (
    <HogbackMapAppShell
      eyebrow="Hogback Ops"
      title="Ops — map, layers & AR compass"
      productHref="/products/ops"
      footer={
        <>
          <strong className="font-medium text-slate-400">
            Informational only.
          </strong>{" "}
          Hogback Ops embeds the Hogback Geo map and AR compass for field
          situational awareness. Incidents, perimeters, and hotshot/IHC
          locations from{" "}
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
          . Basemaps from OpenTopoMap, Esri, and USGS. Satellite heat
          signatures from NASA FIRMS / Esri Living Atlas (VIIRS, MODIS,
          Landsat). Surface wind from{" "}
          <a
            href="https://open-meteo.com/"
            className="text-copper-400 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Open-Meteo
          </a>
          ; city/community labels (population-ranked) from{" "}
          <a
            href="https://www.census.gov/"
            className="text-copper-400 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            USA Places / Census
          </a>
          . Not a substitute for official alerts, dispatch, or Field Maps
          incident systems.
        </>
      }
    >
      <GsiMap loadingLabel="Loading Hogback Ops…" />
    </HogbackMapAppShell>
  );
}
