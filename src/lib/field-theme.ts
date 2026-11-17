import type { CSSProperties } from "react";
import type { SiteContent } from "@/lib/site-content";

/** True when a hex color is dark enough for the Geo field palette. */
export function isDarkColor(input: string): boolean {
  const match = input.trim().toLowerCase().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (!match) return true;
  let hex = match[1];
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.55;
}

/** Page shell aligned with Hogback Geo: dusk field, bone type, khaki accent. */
export function fieldPageStyle(design: SiteContent["design"]): CSSProperties {
  const dark = isDarkColor(design.pageBackground);
  return {
    backgroundColor: design.pageBackground,
    color: dark ? "#ece2cc" : "#161910",
    fontSize: design.bodySizePx,
    ["--color-copper-500" as string]: design.copper,
    ["--color-khaki" as string]: design.copper,
    ["--color-navy-950" as string]: design.navy,
    ["--heading-scale" as string]: String(design.headingScale),
    ...(dark
      ? {}
      : {
          ["--color-bone" as string]: "#161910",
          ["--color-sage" as string]: "#5c564c",
          ["--color-dusk" as string]: "#f6f3ea",
          ["--color-stone" as string]: "#e4dece",
        }),
  };
}
