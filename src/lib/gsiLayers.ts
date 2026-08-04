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

/** Esri Living Atlas — VIIRS thermal hotspots / fire activity (global NRT). */
export const viirsHotspotsUrl =
  "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/Satellite_VIIRS_Thermal_Hotspots_and_Fire_Activity/FeatureServer/0";

/** Esri Living Atlas — MODIS thermal hotspots (last 48 hours). */
export const modisHotspotsUrl =
  "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/MODIS_Thermal_v1/FeatureServer/0";

/**
 * Combined FIRMS hotspot feed including Landsat 24h detections
 * (also carries MODIS / NOAA-20 / NOAA-21 VIIRS).
 */
export const firmsCombinedHotspotsUrl =
  "https://services.arcgis.com/txWDfZ2LIgzmw5Ts/arcgis/rest/services/firms_hotspots_combined/FeatureServer/0";

export type GsiOverlayId =
  | "incidents"
  | "perimeters"
  | "evacuations"
  | "avl"
  | "hotshots"
  | "odfUnits"
  | "usfsOr"
  | "usfsFire"
  | "viirs"
  | "modis"
  | "landsat";

/** Heat signature layers that should requery against the current map viewport. */
export const heatOverlayIds: GsiOverlayId[] = ["viirs", "modis", "landsat"];

export function isHeatOverlay(id: GsiOverlayId): boolean {
  return heatOverlayIds.includes(id);
}
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
  {
    id: "viirs",
    name: "VIIRS heat signatures",
    shortName: "VIIRS",
    description:
      "Live VIIRS 375m thermal hotspots (S-NPP / NOAA) from Esri Living Atlas — last ~48 hours in the current map view.",
    sourceLabel: "FIRMS / VIIRS",
    sourceHref:
      "https://www.earthdata.nasa.gov/data/tools/firms",
    defaultOn: true,
  },
  {
    id: "modis",
    name: "MODIS heat signatures",
    shortName: "MODIS",
    description:
      "Live MODIS thermal hotspots (Aqua / Terra) from Esri Living Atlas — last ~48 hours in the current map view.",
    sourceLabel: "FIRMS / MODIS",
    sourceHref:
      "https://www.earthdata.nasa.gov/data/tools/firms",
    defaultOn: true,
  },
  {
    id: "landsat",
    name: "Landsat heat signatures",
    shortName: "Landsat",
    description:
      "Live Landsat 30m active-fire heat detections from FIRMS — last ~24 hours in the current map view.",
    sourceLabel: "FIRMS / Landsat",
    sourceHref:
      "https://firms.modaps.eosdis.nasa.gov/content/usfs/active_fire/",
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

const VIIRS_FIELDS = [
  "bright_ti4",
  "bright_ti5",
  "acq_date",
  "acq_time",
  "satellite",
  "confidence",
  "frp",
  "daynight",
  "hours_old",
].join(",");

const MODIS_FIELDS = [
  "BRIGHTNESS",
  "BRIGHT_T31",
  "SATELLITE",
  "CONFIDENCE",
  "FRP",
  "ACQ_DATE",
  "DAYNIGHT",
  "HOURS_OLD",
].join(",");

const LANDSAT_FIELDS = [
  "source",
  "latitude",
  "longitude",
  "brightness",
  "confidence",
  "frp",
  "satellite",
  "acq_date",
  "acq_time",
  "daynight",
  "path",
  "row",
].join(",");

export type MapBBox = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export function buildFeatureQueryUrl(
  layerUrl: string,
  outFields: string,
  options?: {
    where?: string;
    geometryPrecision?: number;
    bbox?: MapBBox;
    resultRecordCount?: number;
  },
): string {
  const params = new URLSearchParams({
    where: options?.where ?? "1=1",
    outFields,
    returnGeometry: "true",
    outSR: "4326",
    f: "geojson",
    resultRecordCount: String(options?.resultRecordCount ?? 2000),
  });
  if (options?.geometryPrecision != null) {
    params.set("geometryPrecision", String(options.geometryPrecision));
  }
  if (options?.bbox) {
    const { west, south, east, north } = options.bbox;
    params.set("geometry", `${west},${south},${east},${north}`);
    params.set("geometryType", "esriGeometryEnvelope");
    params.set("inSR", "4326");
    params.set("spatialRel", "esriSpatialRelIntersects");
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
  // Heat layers require a viewport bbox — placeholders replaced by getOverlayQueryUrl()
  viirs: buildFeatureQueryUrl(viirsHotspotsUrl, VIIRS_FIELDS, {
    where: "hours_old <= 48",
  }),
  modis: buildFeatureQueryUrl(modisHotspotsUrl, MODIS_FIELDS),
  landsat: buildFeatureQueryUrl(firmsCombinedHotspotsUrl, LANDSAT_FIELDS, {
    where: "source = 'fires_landsat_24hrs'",
  }),
};

/** Resolve the query URL for an overlay, applying map bounds for heat feeds. */
export function getOverlayQueryUrl(
  id: GsiOverlayId,
  bbox?: MapBBox | null,
): string {
  if (!isHeatOverlay(id)) return overlayQueryUrls[id];

  if (id === "viirs") {
    return buildFeatureQueryUrl(viirsHotspotsUrl, VIIRS_FIELDS, {
      where: "hours_old <= 48",
      bbox: bbox ?? undefined,
      resultRecordCount: 2000,
    });
  }
  if (id === "modis") {
    return buildFeatureQueryUrl(modisHotspotsUrl, MODIS_FIELDS, {
      bbox: bbox ?? undefined,
      resultRecordCount: 2000,
    });
  }
  return buildFeatureQueryUrl(firmsCombinedHotspotsUrl, LANDSAT_FIELDS, {
    where: "source = 'fires_landsat_24hrs'",
    bbox: bbox ?? undefined,
    resultRecordCount: 2000,
  });
}
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

export type HeatStyle = { fill: string; stroke: string; radius: number };

/** Style heat points by fire radiative power (MW) when available. */
export function heatPointStyle(
  frp: unknown,
  sensor: "viirs" | "modis" | "landsat",
): HeatStyle {
  const n = typeof frp === "number" ? frp : Number(frp);
  const base =
    sensor === "viirs"
      ? { fill: "#fb7185", stroke: "#9f1239" }
      : sensor === "modis"
        ? { fill: "#f97316", stroke: "#9a3412" }
        : { fill: "#facc15", stroke: "#a16207" };
  if (!Number.isFinite(n) || n <= 0) return { ...base, radius: 4 };
  if (n >= 50) return { ...base, radius: 8 };
  if (n >= 15) return { ...base, radius: 6 };
  return { ...base, radius: 5 };
}

export function formatFrp(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(1)} MW`;
}

export function formatHoursOld(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  if (n < 1) return "< 1 hr";
  return `${Math.round(n)} hr`;
}
