/** Hogback Geo map — NIFC / WFIGS wildfire + evacuation + AVL overlay sources. */

export const defaultMapCenter: [number, number] = [45.5945, -121.1787];
export const defaultMapZoom = 6;

export type GsiBasemapId = "topo" | "satellite" | "imagery" | "relief";

export type GsiBasemap = {
  id: GsiBasemapId;
  name: string;
  description: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string;
};

/**
 * Free public basemap tiles — Esri / USGS / OpenTopoMap (no API key).
 * Satellite vs Imagery: World Imagery vs USGS Imagery Only (aerial/ortho).
 */
export const gsiBasemaps: GsiBasemap[] = [
  {
    id: "topo",
    name: "Topo",
    description: "Topographic map with contours, trails, and place labels.",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 17,
    subdomains: "abc",
  },
  {
    id: "satellite",
    name: "Satellite",
    description: "Esri World Imagery satellite basemap.",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    maxZoom: 19,
  },
  {
    id: "imagery",
    name: "Imagery",
    description: "USGS Imagery Only — aerial / orthoimagery basemap.",
    url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}",
    attribution:
      'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>',
    maxZoom: 16,
  },
  {
    id: "relief",
    name: "Relief",
    description: "Shaded relief / terrain hillshade basemap.",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri",
    maxZoom: 13,
  },
];

export const defaultBasemapId: GsiBasemapId = "topo";

export function getBasemap(id: GsiBasemapId): GsiBasemap {
  return gsiBasemaps.find((b) => b.id === id) ?? gsiBasemaps[0];
}

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
 * Cal OES Fire Resource AVL — OES Type 1 / Type 3 engines and hazmat units
 * assigned to local fire agencies (Field Maps–style resource layer).
 */
export const fireResourceAvlUrl =
  "https://services.arcgis.com/BLN4oKB0N1YSgvY8/arcgis/rest/services/Fire_Rescue_Unit_Location/FeatureServer/0";

/**
 * Cal OES Fire & Rescue fleet telematics AVL — GPS positions for OES engines,
 * fire trucks, and support apparatus.
 */
export const fireFleetAvlUrl =
  "https://services.arcgis.com/BLN4oKB0N1YSgvY8/arcgis/rest/services/Fire_and_Rescue_Fleet_Layer_08152024/FeatureServer/4";

/**
 * NIFC / NWCC Hotshot & IHC daily locations — USFS wildland fire Type 1 crew
 * resource tracking commonly paired with Field Maps incident maps.
 */
export const hotshotLocationsUrl = `${WFIGS_BASE}/HotShotIHC_Locations/FeatureServer/0`;

/**
 * NIFC assigned wildland crews / modules (CrewsMods) — Type 1/2 IA crews,
 * camp crews, fuels & suppression modules at incidents or preposition.
 */
export const assignedCrewsUrl = `${WFIGS_BASE}/CrewsMods/FeatureServer/0`;

/** Interagency fire aircraft bases (air tanker / helibase infrastructure). */
export const fireAircraftBasesUrl = `${WFIGS_BASE}/Fire_Aircraft_Bases/FeatureServer/0`;

/** Oregon Department of Forestry district / unit offices. */
export const odfOfficesUrl =
  "https://gis.odf.oregon.gov/ags3/rest/services/Basemaps/ProtectionMap/MapServer/28";

/** USFS office / ranger-district locations (filter to Oregon). */
export const usfsOfficesUrl =
  "https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_FSOfficeLocations_01/MapServer/0";

/** Oregon fire facilities owned/operated by U.S. Forest Service. */
export const orUsfsFireStationsUrl =
  "https://services.arcgis.com/uUvqNMGPm7axC2dD/arcgis/rest/services/OR_Fire_Stations/FeatureServer/0";

/** USGS National Map GNIS — populated places (cities, towns, communities). */
export const populatedPlacesUrl =
  "https://carto.nationalmap.gov/arcgis/rest/services/geonames/MapServer/3";

/** USGS National Map GNIS — incorporated places (cities/towns) for far zoom. */
export const incorporatedPlacesUrl =
  "https://carto.nationalmap.gov/arcgis/rest/services/geonames/MapServer/1";

/** USA places with census population (points) — used to prioritize labels. */
export const usaPlacesPopulationUrl =
  "https://services5.arcgis.com/bDCD6wpjQP5q0bHM/arcgis/rest/services/USA_Places/FeatureServer/0";

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
  | "wind"
  | "places"
  | "viirs"
  | "modis"
  | "landsat"
  | "avl"
  | "fleetAvl"
  | "hotshots"
  | "crews"
  | "aircraftBases"
  | "odfUnits"
  | "usfsOr"
  | "usfsFire";

/** Heat signature layers that should requery against the current map viewport. */
export const heatOverlayIds: GsiOverlayId[] = ["viirs", "modis", "landsat"];

export function isHeatOverlay(id: GsiOverlayId): boolean {
  return heatOverlayIds.includes(id);
}

/**
 * Overlays that reload against the current viewport on pan/zoom
 * (heat signatures, surface wind, place labels).
 */
export const viewportOverlayIds: GsiOverlayId[] = [
  ...heatOverlayIds,
  "wind",
  "places",
];

export function isViewportOverlay(id: GsiOverlayId): boolean {
  return viewportOverlayIds.includes(id);
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
    id: "wind",
    name: "Surface wind",
    shortName: "Surface Wind",
    description:
      "10 m surface wind direction lines and speed (mph) from Open-Meteo — refreshes for the current map view.",
    sourceLabel: "Open-Meteo",
    sourceHref: "https://open-meteo.com/",
    defaultOn: true,
  },
  {
    id: "places",
    name: "Cities & communities",
    shortName: "Cities / Communities",
    description:
      "City and community labels prioritized by population — major cities when zoomed out, more places mid-zoom, hidden at street level.",
    sourceLabel: "USA Places / Census",
    sourceHref: "https://www.census.gov/",
    defaultOn: true,
  },
  {
    id: "viirs",
    name: "VIIRS heat signatures",
    shortName: "VIIRS heat",
    description:
      "Live VIIRS 375m thermal hotspots (S-NPP / NOAA) from Esri Living Atlas — last ~48 hours in the current map view.",
    sourceLabel: "FIRMS / VIIRS",
    sourceHref: "https://www.earthdata.nasa.gov/data/tools/firms",
    defaultOn: true,
  },
  {
    id: "modis",
    name: "MODIS heat signatures",
    shortName: "MODIS heat",
    description:
      "Live MODIS thermal hotspots (Aqua / Terra) from Esri Living Atlas — last ~48 hours in the current map view.",
    sourceLabel: "FIRMS / MODIS",
    sourceHref: "https://www.earthdata.nasa.gov/data/tools/firms",
    defaultOn: true,
  },
  {
    id: "landsat",
    name: "Landsat heat signatures",
    shortName: "Landsat heat",
    description:
      "Live Landsat 30m active-fire heat detections from FIRMS — last ~24 hours in the current map view.",
    sourceLabel: "FIRMS / Landsat",
    sourceHref:
      "https://firms.modaps.eosdis.nasa.gov/content/usfs/active_fire/",
    defaultOn: true,
  },
  {
    id: "avl",
    name: "OES engines & units",
    shortName: "OES Engines",
    description:
      "Cal OES Type 1 / Type 3 engines and hazmat units assigned to local fire agencies — public firefighting resource AVL.",
    sourceLabel: "Cal OES Engines",
    sourceHref:
      "https://www.arcgis.com/home/item.html?id=2f84d6479d0d4c61adf84d3922529176",
    defaultOn: true,
  },
  {
    id: "fleetAvl",
    name: "OES fleet GPS AVL",
    shortName: "Fleet AVL",
    description:
      "Cal OES Fire & Rescue telematics AVL — live GPS for OES fire trucks, engines, and support apparatus.",
    sourceLabel: "Cal OES Fleet",
    sourceHref:
      "https://www.arcgis.com/home/item.html?id=Fire_and_Rescue_Fleet_Layer_08152024",
    defaultOn: true,
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
    id: "crews",
    name: "Assigned wildland crews",
    shortName: "Crews",
    description:
      "NIFC CrewsMods — Type 1/2 IA crews, camp crews, and fuels/suppression modules at incidents or preposition.",
    sourceLabel: "NIFC CrewsMods",
    sourceHref: "https://data-nifc.opendata.arcgis.com/",
    defaultOn: true,
  },
  {
    id: "aircraftBases",
    name: "Fire aircraft bases",
    shortName: "Air Bases",
    description:
      "Interagency fire aircraft bases used for air tankers, helicopters, and aerial firefighting support.",
    sourceLabel: "NIFC",
    sourceHref: "https://data-nifc.opendata.arcgis.com/",
    defaultOn: false,
  },
  {
    id: "odfUnits",
    name: "ODF units",
    shortName: "ODF",
    description:
      "Oregon Department of Forestry district and unit offices across the state.",
    sourceLabel: "ODF",
    sourceHref: "https://gis.odf.oregon.gov/",
    defaultOn: false,
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
    defaultOn: false,
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
    defaultOn: false,
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

const FLEET_AVL_FIELDS = [
  "DeviceID",
  "Description",
  "Make",
  "Model",
  "Year",
  "AssetType_Description",
  "Position_City",
  "Position_Province",
  "Position_Address",
  "Position_Street",
  "LastUpdatedTimeStamp",
  "Position_Speed",
  "IsVisible",
  "IsDeleted",
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

const CREW_FIELDS = [
  "Assignment_Name",
  "Abbreviation",
  "Incident_Number",
  "Incident_Name",
  "Request_Number",
  "Catalog_Item",
  "Request_Status",
  "Mob_Start",
].join(",");

const AIRCRAFT_BASE_FIELDS = [
  "Airport",
  "Designator",
  "State",
  "Category",
  "Base_Type",
  "Agency",
  "Contact",
  "Fuel",
  "Runway",
  "Notes",
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

const PLACE_FIELDS = [
  "NAME",
  "ST",
  "POPULATION",
  "CLASS",
  "STATE_NAME",
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
    orderByFields?: string;
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
  if (options?.orderByFields) {
    params.set("orderByFields", options.orderByFields);
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
  fleetAvl: buildFeatureQueryUrl(fireFleetAvlUrl, FLEET_AVL_FIELDS, {
    where:
      "IsDeleted = 'False' AND Description NOT LIKE '%removed%' AND Position_Latitude IS NOT NULL AND Position_Latitude <> '0'",
  }),
  hotshots: buildFeatureQueryUrl(hotshotLocationsUrl, HOTSHOT_FIELDS),
  crews: buildFeatureQueryUrl(assignedCrewsUrl, CREW_FIELDS, {
    where:
      "Request_Status IN ('At Incident','At Preposition (Available)','Reserved','Reassigned')",
  }),
  aircraftBases: buildFeatureQueryUrl(
    fireAircraftBasesUrl,
    AIRCRAFT_BASE_FIELDS,
  ),
  odfUnits: buildFeatureQueryUrl(odfOfficesUrl, ODF_OFFICE_FIELDS),
  usfsOr: buildFeatureQueryUrl(usfsOfficesUrl, USFS_OFFICE_FIELDS, {
    where: "state = 'OR'",
  }),
  usfsFire: buildFeatureQueryUrl(orUsfsFireStationsUrl, OR_USFS_FIRE_FIELDS, {
    where: "Agency = 'U.S. Forest Service'",
  }),
  // Heat / places require a viewport bbox — placeholders replaced by getOverlayQueryUrl()
  viirs: buildFeatureQueryUrl(viirsHotspotsUrl, VIIRS_FIELDS, {
    where: "hours_old <= 48",
  }),
  modis: buildFeatureQueryUrl(modisHotspotsUrl, MODIS_FIELDS),
  landsat: buildFeatureQueryUrl(firmsCombinedHotspotsUrl, LANDSAT_FIELDS, {
    where: "source = 'fires_landsat_24hrs'",
  }),
  places: buildFeatureQueryUrl(usaPlacesPopulationUrl, PLACE_FIELDS, {
    where: "POPULATION > 0",
    resultRecordCount: 250,
    orderByFields: "POPULATION DESC",
  }),
  // Client-fetched via Open-Meteo in GsiMap (not an ArcGIS FeatureServer).
  wind: "",
};

/** Resolve the query URL for an overlay, applying map bounds for viewport feeds. */
export function getOverlayQueryUrl(
  id: GsiOverlayId,
  bbox?: MapBBox | null,
): string {
  if (id === "wind") return overlayQueryUrls.wind;

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
  if (id === "landsat") {
    return buildFeatureQueryUrl(firmsCombinedHotspotsUrl, LANDSAT_FIELDS, {
      where: "source = 'fires_landsat_24hrs'",
      bbox: bbox ?? undefined,
      resultRecordCount: 2000,
    });
  }
  if (id === "places") {
    // Zoom/population-aware query is applied in getPlacesQueryUrl().
    return buildFeatureQueryUrl(usaPlacesPopulationUrl, PLACE_FIELDS, {
      where: "POPULATION > 0",
      bbox: bbox ?? undefined,
      resultRecordCount: 250,
      orderByFields: "POPULATION DESC",
    });
  }

  return overlayQueryUrls[id];
}

/**
 * Place label density by zoom, prioritized by population:
 * - zoomed out: highest-population cities only
 * - mid zoom: more communities (lower pop floor)
 * - furthest in (>= 15): hide tags entirely
 */
export function placeLabelPolicy(zoom: number): {
  hide: boolean;
  maxLabels: number;
  minPopulation: number;
  fetchLimit: number;
} {
  if (zoom >= 15) {
    return { hide: true, maxLabels: 0, minPopulation: 0, fetchLimit: 0 };
  }
  if (zoom >= 13) {
    return {
      hide: false,
      maxLabels: 140,
      minPopulation: 0,
      fetchLimit: 300,
    };
  }
  if (zoom >= 11) {
    return {
      hide: false,
      maxLabels: 90,
      minPopulation: 200,
      fetchLimit: 220,
    };
  }
  if (zoom >= 9) {
    return {
      hide: false,
      maxLabels: 45,
      minPopulation: 1500,
      fetchLimit: 140,
    };
  }
  if (zoom >= 7) {
    return {
      hide: false,
      maxLabels: 18,
      minPopulation: 8000,
      fetchLimit: 80,
    };
  }
  return {
    hide: false,
    maxLabels: 8,
    minPopulation: 25000,
    fetchLimit: 40,
  };
}

/** Build the ArcGIS query for place labels at the current zoom. */
export function getPlacesQueryUrl(
  bbox: MapBBox | null | undefined,
  zoom: number,
): string | null {
  const policy = placeLabelPolicy(zoom);
  if (policy.hide || policy.fetchLimit <= 0) return null;

  const where =
    policy.minPopulation > 0
      ? `POPULATION >= ${policy.minPopulation}`
      : "POPULATION > 0";

  return buildFeatureQueryUrl(usaPlacesPopulationUrl, PLACE_FIELDS, {
    where,
    bbox: bbox ?? undefined,
    resultRecordCount: policy.fetchLimit,
    orderByFields: "POPULATION DESC",
  });
}

function placePopulation(props: Record<string, unknown>): number {
  const n = Number(props.POPULATION ?? props.population ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Spatially thin place labels, keeping the highest-population place per cell.
 */
export function thinPlaceLabels(
  geojson: GeoJSON.FeatureCollection,
  bbox: MapBBox,
  zoom: number,
): GeoJSON.FeatureCollection {
  const policy = placeLabelPolicy(zoom);
  if (policy.hide || policy.maxLabels <= 0) {
    return { type: "FeatureCollection", features: [] };
  }

  const spanLng = Math.max(bbox.east - bbox.west, 0.001);
  const spanLat = Math.max(bbox.north - bbox.south, 0.001);
  // Coarser cells when zoomed out → fewer labels survive.
  const cells =
    zoom >= 13 ? 14 : zoom >= 11 ? 11 : zoom >= 9 ? 8 : zoom >= 7 ? 5 : 3;
  const cellW = spanLng / cells;
  const cellH = spanLat / cells;

  type Ranked = {
    feature: GeoJSON.Feature;
    lng: number;
    lat: number;
    population: number;
  };

  const ranked: Ranked[] = [];
  for (const feature of geojson.features ?? []) {
    const geometry = feature.geometry;
    if (!geometry || geometry.type !== "Point") continue;
    const [lng, lat] = geometry.coordinates;
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
    const props = (feature.properties ?? {}) as Record<string, unknown>;
    const population = placePopulation(props);
    if (population < policy.minPopulation) continue;
    ranked.push({ feature, lng, lat, population });
  }

  ranked.sort((a, b) => b.population - a.population);

  const used = new Set<string>();
  const kept: GeoJSON.Feature[] = [];
  for (const item of ranked) {
    if (kept.length >= policy.maxLabels) break;
    const col = Math.floor((item.lng - bbox.west) / cellW);
    const row = Math.floor((item.lat - bbox.south) / cellH);
    const key = `${col}:${row}`;
    if (used.has(key)) continue;
    used.add(key);
    kept.push(item.feature);
  }

  return { type: "FeatureCollection", features: kept };
}

/** Clean place names for map labels (USA Places / GNIS). */
export function placeDisplayName(
  nameOrProps: unknown,
  props?: Record<string, unknown>,
): string {
  const record =
    props ??
    (nameOrProps && typeof nameOrProps === "object"
      ? (nameOrProps as Record<string, unknown>)
      : null);

  let name = String(
    record?.NAME ??
      record?.gaz_name ??
      (typeof nameOrProps === "string" || typeof nameOrProps === "number"
        ? nameOrProps
        : "") ??
      "",
  ).trim();
  if (!name) return "Place";
  name = name.replace(/^City of\s+/i, "");
  name = name.replace(/^Town of\s+/i, "");
  name = name.replace(/\s+Census Designated Place$/i, "");
  name = name.replace(/\s+CDP$/i, "");
  return name;
}

export function oesEngineTypeLabel(type: unknown): string {
  const t = String(type ?? "").trim();
  if (t === "1") return "Type 1 engine";
  if (t === "3") return "Type 3 engine";
  if (/hazmat/i.test(t)) return "Hazmat unit";
  return t || "Fire unit";
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
  if (!Number.isFinite(n) || n <= 0) return { ...base, radius: 3 };
  if (n >= 50) return { ...base, radius: 5 };
  if (n >= 15) return { ...base, radius: 4 };
  return { ...base, radius: 3.5 };
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
