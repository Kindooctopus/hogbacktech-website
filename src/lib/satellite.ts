/** NASA GIBS (free) near-real-time satellite imagery layers for Hogback Sat. */

export type SatelliteLayer = {
  id: string;
  name: string;
  description: string;
  /** GIBS layer identifier */
  gibsLayer: string;
  tileMatrixSet: string;
  /** jpg or png */
  format: "jpg" | "png";
  maxNativeZoom: number;
  /** Days to subtract from today for a reliable default (NRT lag) */
  defaultLagDays: number;
};

export const satelliteLayers: SatelliteLayer[] = [
  {
    id: "true-color",
    name: "True Color",
    description: "VIIRS corrected reflectance — daily optical view of terrain and smoke.",
    gibsLayer: "VIIRS_SNPP_CorrectedReflectance_TrueColor",
    tileMatrixSet: "GoogleMapsCompatible_Level9",
    format: "jpg",
    maxNativeZoom: 9,
    defaultLagDays: 1,
  },
  {
    id: "fires",
    name: "Thermal / Fires",
    description: "VIIRS thermal anomalies — hotspots useful for wildfire situational awareness.",
    gibsLayer: "VIIRS_SNPP_Thermal_Anomalies_375m_Night",
    tileMatrixSet: "GoogleMapsCompatible_Level8",
    format: "png",
    maxNativeZoom: 8,
    defaultLagDays: 1,
  },
  {
    id: "modis-terra",
    name: "MODIS Terra",
    description: "MODIS Terra true color — complementary daily pass over the PNW.",
    gibsLayer: "MODIS_Terra_CorrectedReflectance_TrueColor",
    tileMatrixSet: "GoogleMapsCompatible_Level9",
    format: "jpg",
    maxNativeZoom: 9,
    defaultLagDays: 1,
  },
  {
    id: "night",
    name: "Night Lights",
    description: "VIIRS day/night band — lights, fires, and nighttime activity.",
    gibsLayer: "VIIRS_SNPP_DayNightBand_ENCC",
    tileMatrixSet: "GoogleMapsCompatible_Level8",
    format: "png",
    maxNativeZoom: 8,
    defaultLagDays: 2,
  },
];

/** The Dalles / Columbia River Gorge — Hogback home territory */
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
