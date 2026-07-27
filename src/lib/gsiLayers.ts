/** Hogback GSI — NIFC / WFIGS wildfire + evacuation + AVL overlay sources. */

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

/**
 * Cal OES Fire Resource AVL — unit locations used on wildland fire Field Maps
 * style operational maps across the West.
 */
export const fireResourceAvlUrl =
  "https://services.arcgis.com/BLN4oKB0N1YSgvY8/arcgis/rest/services/Fire_Rescue_Unit_Location/FeatureServer/0";

/**
 * NIFC / NWCC Hotshot & IHC daily locations — USFS wildland fire Type 1 crew
 * resource tracking commonly paired with Field Maps incident maps.
 */
export const hotshotLocationsUrl = `${WFIGS_BASE}/HotShotIHC_Locations/FeatureServer/0`;

/** Oregon Department of Forestry district / unit offices. */
export const odfOfficesUrl =
  "https://gis.odf.oregon.gov/ags3/rest/services/Basemaps/ProtectionMap/MapServer/28";

/** USFS office / ranger-district locations (filter to Oregon). */
export const usfsOfficesUrl =
  "https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_FSOfficeLocations_01/MapServer/0";

/** Oregon fire facilities owned/operated by U.S. Forest Service. */
export const orUsfsFireStationsUrl =
  "https://services.arcgis.com/uUvqNMGPm7axC2dD/arcgis/rest/services/OR_Fire_Stations/FeatureServer/0";

export type GsiOverlayId =
  | "incidents"
  | "perimeters"
  | "evacuations"
  | "avl"
  | "hotshots"
  | "odfUnits"
  | "usfsOr"
  | "usfsFire";

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
  {
    id: "avl",
    name: "Fire resource AVL",
    shortName: "AVL",
    description:
      "Wildland fire Field Maps–style AVL unit tracking from Cal OES Fire Resource locations (CA engines and assigned units).",
    sourceLabel: "Cal OES AVL",
    sourceHref:
      "https://www.arcgis.com/home/item.html?id=Fire_Rescue_Unit_Location",
    defaultOn: false,
  },
  {
    id: "hotshots",
    name: "USFS hotshot / IHC",
    shortName: "Hotshots",
    description:
      "US Forest Service / interagency Hotshot and IHC crew locations from NIFC — status, assignment, and home dispatch.",
    sourceLabel: "NIFC / USFS",
    sourceHref:
      "https://www.arcgis.com/home/item.html?id=HotShotIHC_Locations",
    defaultOn: true,
  },
  {
    id: "odfUnits",
    name: "ODF units",
    shortName: "ODF",
    description:
      "Oregon Department of Forestry district and unit offices across the state.",
    sourceLabel: "ODF",
    sourceHref: "https://gis.odf.oregon.gov/",
    defaultOn: true,
  },
  {
    id: "usfsOr",
    name: "USFS Oregon offices",
    shortName: "USFS OR",
    description:
      "U.S. Forest Service offices and ranger districts in Oregon (Region 6).",
    sourceLabel: "USFS EDW",
    sourceHref:
      "https://data.fs.usda.gov/geodata/edw/datasets.php?xmlKeyword=office",
    defaultOn: true,
  },
  {
    id: "usfsFire",
    name: "USFS OR fire facilities",
    shortName: "USFS Fire",
    description:
      "Oregon fire stations / facilities operated by the U.S. Forest Service.",
    sourceLabel: "OR Fire Stations",
    sourceHref:
      "https://www.arcgis.com/home/item.html?id=OR_Fire_Stations",
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

const AVL_FIELDS = [
  "UNIT__",
  "OES_ID__",
  "ASSIGNEE",
  "REG",
  "OP_AREA",
  "LOCATION",
  "Type",
].join(",");

const HOTSHOT_FIELDS = [
  "resource_operational_name",
  "resource_name",
  "qualifications",
  "resource_status",
  "incident_name",
  "active_assignment",
  "active_request_status",
  "DispName",
  "available_area",
  "current_dispatch_unit_identifier",
].join(",");

const ODF_OFFICE_FIELDS = ["OFFICETYPE", "OFFICENAME", "AREANAME"].join(",");

const USFS_OFFICE_FIELDS = [
  "name",
  "street",
  "city",
  "state",
  "region",
  "forest_name",
  "district_name",
  "phone",
].join(",");

const OR_USFS_FIRE_FIELDS = [
  "Agency",
  "Station",
  "Facility_Type",
  "Owner_Type",
  "County",
  "Physical_Address",
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
    where: "IncidentTypeCategory = 'WF' OR IncidentTypeCategory IS NULL",
  }),
  perimeters: buildFeatureQueryUrl(firePerimetersUrl, PERIMETER_FIELDS, {
    geometryPrecision: 4,
  }),
  evacuations: buildFeatureQueryUrl(evacuationsUrl, EVACUATION_FIELDS, {
    geometryPrecision: 4,
  }),
  avl: buildFeatureQueryUrl(fireResourceAvlUrl, AVL_FIELDS),
  hotshots: buildFeatureQueryUrl(hotshotLocationsUrl, HOTSHOT_FIELDS),
  odfUnits: buildFeatureQueryUrl(odfOfficesUrl, ODF_OFFICE_FIELDS),
  usfsOr: buildFeatureQueryUrl(usfsOfficesUrl, USFS_OFFICE_FIELDS, {
    where: "state = 'OR'",
  }),
  usfsFire: buildFeatureQueryUrl(orUsfsFireStationsUrl, OR_USFS_FIRE_FIELDS, {
    where: "Agency = 'U.S. Forest Service'",
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

export type HotshotStyle = { fill: string; stroke: string };

export function hotshotStyle(status: unknown): HotshotStyle {
  const s = String(status ?? "").toLowerCase();
  if (s.includes("assigned") || s.includes("committed")) {
    return { fill: "#ef4444", stroke: "#991b1b" };
  }
  if (s.includes("available")) {
    return { fill: "#22c55e", stroke: "#166534" };
  }
  if (s.includes("returned") || s.includes("demob")) {
    return { fill: "#94a3b8", stroke: "#475569" };
  }
  return { fill: "#38bdf8", stroke: "#0369a1" };
}
