/** Hogback GSI — NIFC / WFIGS wildfire + evacuation overlay sources. */

export const defaultMapCenter: [number, number] = [45.5945, -121.1787];
export const defaultMapZoom = 6;

const WFIGS_BASE =
  "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services";

/** NIFC WFIGS current incident locations (points). */
export const nifcIncidentsUrl = `${WFIGS_BASE}/WFIGS_Incident_Locations_Current/FeatureServer/0`;

/** NIFC WFIGS current interagency fire perimeters (polygons). */
export const firePerimetersUrl = `${WFIGS_BASE}/WFIGS_Interagency_Perimeters_Current/FeatureServer/0`;

/**
 * Cal OES hosted statewide evacuations (orders / warnings / advisories).
 * Primary public wildfire-era evacuation polygon feed for the West.
 */
export const evacuationsUrl =
  "https://services.arcgis.com/BLN4oKB0N1YSgvY8/arcgis/rest/services/CA_EVACUATIONS_CalOESHosted_view/FeatureServer/0";

export type GsiOverlayId = "incidents" | "perimeters" | "evacuations";

export type GsiOverlay = {
  id: GsiOverlayId;
  name: string;
  shortName: string;
  description: string;
  sourceLabel: string;
  sourceHref: string;
  defaultOn: boolean;
};

export const gsiOverlays: GsiOverlay[] = [
  {
    id: "incidents",
    name: "NIFC incidents",
    shortName: "Incidents",
    description:
      "Current wildland fire incident locations from NIFC WFIGS — name, size, containment, and cause.",
    sourceLabel: "NIFC WFIGS",
    sourceHref:
      "https://data-nifc.opendata.arcgis.com/datasets/nifc::wfigs-current-incident-locations",
    defaultOn: true,
  },
  {
    id: "perimeters",
    name: "Fire perimeters",
    shortName: "Perimeters",
    description:
      "Current interagency fire perimeters from NIFC WFIGS — mapped burn areas for active incidents.",
    sourceLabel: "NIFC WFIGS",
    sourceHref:
      "https://data-nifc.opendata.arcgis.com/datasets/nifc::wfigs-current-interagency-fire-perimeters",
    defaultOn: true,
  },
  {
    id: "evacuations",
    name: "Evacuation zones",
    shortName: "Evacuations",
    description:
      "Active evacuation orders, warnings, and advisories from Cal OES (California statewide feed).",
    sourceLabel: "Cal OES",
    sourceHref: "https://www.caloes.ca.gov/",
    defaultOn: true,
  },
];

const INCIDENT_FIELDS = [
  "IncidentName",
  "IncidentTypeCategory",
  "POOState",
  "POOCounty",
  "PercentContained",
  "IncidentSize",
  "FireDiscoveryDateTime",
  "FireCause",
  "UniqueFireIdentifier",
  "IncidentShortDescription",
].join(",");

const PERIMETER_FIELDS = [
  "poly_IncidentName",
  "poly_GISAcres",
  "attr_PercentContained",
  "attr_IncidentSize",
  "attr_POOState",
  "attr_POOCounty",
  "attr_IncidentTypeCategory",
  "attr_FireDiscoveryDateTime",
  "attr_UniqueFireIdentifier",
].join(",");

const EVACUATION_FIELDS = [
  "COUNTY",
  "CITY",
  "ZONE_NAME",
  "ZONE_ID",
  "STATUS",
  "EVENT_TYPE",
  "CRITICAL_INFO",
  "PUBLIC_INFO",
  "NOTES",
].join(",");

export function buildFeatureQueryUrl(
  layerUrl: string,
  outFields: string,
  options?: { where?: string; geometryPrecision?: number },
): string {
  const params = new URLSearchParams({
    where: options?.where ?? "1=1",
    outFields,
    returnGeometry: "true",
    outSR: "4326",
    f: "geojson",
    resultRecordCount: "2000",
  });
  if (options?.geometryPrecision != null) {
    params.set("geometryPrecision", String(options.geometryPrecision));
  }
  return `${layerUrl}/query?${params.toString()}`;
}

export const overlayQueryUrls: Record<GsiOverlayId, string> = {
  incidents: buildFeatureQueryUrl(nifcIncidentsUrl, INCIDENT_FIELDS, {
    // Prefer wildfires; still include CX/CX-adjacent if category missing via OR
    where: "IncidentTypeCategory = 'WF' OR IncidentTypeCategory IS NULL",
  }),
  perimeters: buildFeatureQueryUrl(firePerimetersUrl, PERIMETER_FIELDS, {
    geometryPrecision: 4,
  }),
  evacuations: buildFeatureQueryUrl(evacuationsUrl, EVACUATION_FIELDS, {
    geometryPrecision: 4,
  }),
};

export function formatAcres(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  if (n >= 1000) return `${Math.round(n).toLocaleString()} ac`;
  if (n >= 10) return `${n.toFixed(0)} ac`;
  return `${n.toFixed(1)} ac`;
}

export function formatPercent(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${Math.round(n)}%`;
}

export function formatEpoch(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return "—";
  return new Date(n).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type EvacStyle = { fill: string; stroke: string; label: string };

export function evacuationStyle(status: unknown): EvacStyle {
  const s = String(status ?? "").toLowerCase();
  if (s.includes("order")) {
    return { fill: "#dc2626", stroke: "#991b1b", label: "Order" };
  }
  if (s.includes("warning")) {
    return { fill: "#f59e0b", stroke: "#b45309", label: "Warning" };
  }
  if (s.includes("advisory") || s.includes("notice")) {
    return { fill: "#3b82f6", stroke: "#1d4ed8", label: "Advisory" };
  }
  return { fill: "#94a3b8", stroke: "#64748b", label: "Other" };
}
