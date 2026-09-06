import type { Metadata } from "next";
import { GsiMap } from "@/components/GsiMap";
import { HogbackMapAppShell } from "@/components/HogbackMapAppShell";
import { company } from "@/lib/content";

export const metadata: Metadata = {
  title: "Hogback GSI — NIFC Fire, ODF Units & AVL Layers",
  description:
    "Geographic situational intelligence with NIFC incidents, NWCC engine/crew counts, ODF protection units, ODF MMA airborne heat, evacuations, and fire resource AVL.",
  openGraph: {
    title: `Hogback GSI | ${company.name}`,
    description:
      "Oregon-focused fire SI: NWCC engines & crews, ODF unit areas, MMA airborne heat, NIFC layers, and AVL overlays.",
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
      title="Fire, ODF units, engines & AVL"
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
          ; NW engine/crew counts from{" "}
          <a
            href="https://gacc.nifc.gov/nwcc/"
            className="text-copper-400 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            NWCC
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
          ; ODF protection units, offices, and MMA airborne from{" "}
          <a
            href="https://gis.odf.oregon.gov/"
            className="text-copper-400 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Oregon Department of Forestry
          </a>
          . Live ODF Codan AVL for individual engines requires agency auth and
          is not on this public map. Not a substitute for official alerts,
          dispatch, or Field Maps.
        </>
      }
    >
      <GsiMap />
    </HogbackMapAppShell>
  );
}
