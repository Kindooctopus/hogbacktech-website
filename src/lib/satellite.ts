/** NASA GIBS (free) near-real-time satellite imagery layers for Hogback Sat. */

export type SatelliteLayer = {
  id: string;
  name: string;
  description: string;
  /** GIBS layer identifier */
  gibsLayer: string;
  /**
   * wmts: raster tiles. wms: transparent overlay (thermal hotspots are no longer
   * published as PNG tiles; GIBS draws them through WMS).
   */
  service: "wmts" | "wms";
  tileMatrixSet: string;
  /** jpg or png */
  format: "jpg" | "png";
  maxNativeZoom: number;
  /** Days to subtract from today for a reliable default (NRT lag) */
  defaultLagDays: number;
};

/** Optical pass kept under every other layer so a missing tile never falls through to a keyed basemap. */
export const referenceLayerId = "true-color";

export const satelliteLayers: SatelliteLayer[] = [
  {
    id: "true-color",
    name: "True Color",
    description: "NOAA-21 VIIRS corrected reflectance — daily optical view of terrain, cloud, and smoke.",
    gibsLayer: "VIIRS_NOAA21_CorrectedReflectance_TrueColor",
    service: "wmts",
    tileMatrixSet: "GoogleMapsCompatible_Level9",
    format: "jpg",
    maxNativeZoom: 9,
    defaultLagDays: 1,
  },
  {
    id: "fires",
    name: "Thermal / Fires",
    description: "NOAA-21 VIIRS thermal anomalies — hotspots drawn on the true-color pass.",
    gibsLayer: "VIIRS_NOAA21_Thermal_Anomalies_375m_All",
    service: "wms",
    tileMatrixSet: "GoogleMapsCompatible_Level8",
    format: "png",
    maxNativeZoom: 9,
    defaultLagDays: 1,
  },
  {
    id: "modis-terra",
    name: "MODIS Terra",
    description: "MODIS Terra true color — a second daily pass over the same ground.",
    gibsLayer: "MODIS_Terra_CorrectedReflectance_TrueColor",
    service: "wmts",
    tileMatrixSet: "GoogleMapsCompatible_Level9",
    format: "jpg",
    maxNativeZoom: 9,
    defaultLagDays: 1,
  },
  {
    id: "night",
    name: "Night Lights",
    description: "NOAA-21 VIIRS day/night band — city lights, flares, and nighttime activity.",
    gibsLayer: "VIIRS_NOAA21_DayNightBand",
    service: "wmts",
    tileMatrixSet: "GoogleMapsCompatible_Level7",
    format: "png",
    maxNativeZoom: 7,
    defaultLagDays: 1,
  },
];

/** Columbia River Gorge — default map center */
export const defaultMapCenter: [number, number] = [45.5945, -121.1787];
export const defaultMapZoom = 7;

export function formatGibsDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function defaultDateForLayer(layer: SatelliteLayer): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - layer.defaultLagDays);
  return formatGibsDate(d);
}

export function gibsTileUrl(layer: SatelliteLayer, time: string): string {
  return (
    `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/` +
    `${layer.gibsLayer}/default/${time}/${layer.tileMatrixSet}/{z}/{y}/{x}.${layer.format}`
  );
}

export const gibsWmsUrl = "https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi";
