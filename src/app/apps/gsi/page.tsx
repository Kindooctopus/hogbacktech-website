import type { Metadata } from "next";
import { GsiMap } from "@/components/GsiMap";
import { HogbackMapAppShell } from "@/components/HogbackMapAppShell";
import { company } from "@/lib/content";

export const metadata: Metadata = {
  title: "Hogback GSI — NIFC Fire, Evacuation & AVL Layers",
  description:
    "Geographic situational intelligence with NIFC WFIGS incidents, fire perimeters, evacuations, Cal OES fire resource AVL, and USFS hotshot/IHC tracking.",
  openGraph: {
    title: `Hogback GSI | ${company.name}`,
    description:
      "NIFC incidents, fire perimeters, evacuations, Field Maps–style AVL, and USFS hotshot overlays on one map.",
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
    <HogbackMapAppShell
      activeApp="gsi"
      eyebrow="Hogback GSI"
      title="Fire, OR / USFS units & AVL"
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
          . Not a substitute for official alerts, dispatch, or Field Maps
          incident systems.
        </>
      }
    >
      <GsiMap />
    </HogbackMapAppShell>
  );
}
