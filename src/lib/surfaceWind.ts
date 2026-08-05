import type { MapBBox } from "@/lib/gsiLayers";

export type SurfaceWindSample = {
  lat: number;
  lng: number;
  speedMph: number;
  gustMph: number | null;
  /** Meteorological direction wind comes FROM (degrees, 0 = north). */
  fromDeg: number;
};

export type WindStyle = {
  stroke: string;
  fill: string;
  label: string;
};

type OpenMeteoCurrent = {
  latitude: number;
  longitude: number;
  current?: {
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    wind_gusts_10m?: number;
  };
};

const OPEN_METEO_FORECAST = "https://api.open-meteo.com/v1/forecast";

/** Max grid samples per Open-Meteo multi-location request. */
const MAX_SAMPLES = 64;

/**
 * Build a viewport grid sized to zoom — denser when zoomed in,
 * capped so Open-Meteo requests stay small.
 */
export function buildWindGrid(
  bbox: MapBBox,
  zoom: number,
): { lat: number; lng: number }[] {
  const spanLng = Math.max(bbox.east - bbox.west, 0.05);
  const spanLat = Math.max(bbox.north - bbox.south, 0.05);

  // Slightly denser grid so arrows read as a wind field.
  let cols = 5;
  let rows = 4;
  if (zoom >= 11) {
    cols = 9;
    rows = 8;
  } else if (zoom >= 9) {
    cols = 8;
    rows = 7;
  } else if (zoom >= 7) {
    cols = 7;
    rows = 6;
  } else if (zoom >= 5) {
    cols = 6;
    rows = 5;
  }

  while (cols * rows > MAX_SAMPLES) {
    if (cols >= rows) cols -= 1;
    else rows -= 1;
  }

  const padLng = spanLng * 0.08;
  const padLat = spanLat * 0.08;
  const west = bbox.west + padLng;
  const east = bbox.east - padLng;
  const south = bbox.south + padLat;
  const north = bbox.north - padLat;
  const dLng = cols > 1 ? (east - west) / (cols - 1) : 0;
  const dLat = rows > 1 ? (north - south) / (rows - 1) : 0;

  const points: { lat: number; lng: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      points.push({
        lat: south + dLat * r,
        lng: west + dLng * c,
      });
    }
  }
  return points;
}

export async function fetchSurfaceWind(
  bbox: MapBBox,
  zoom: number,
): Promise<SurfaceWindSample[]> {
  const grid = buildWindGrid(bbox, zoom);
  if (grid.length === 0) return [];

  const params = new URLSearchParams({
    latitude: grid.map((p) => p.lat.toFixed(4)).join(","),
    longitude: grid.map((p) => p.lng.toFixed(4)).join(","),
    current: "wind_speed_10m,wind_direction_10m,wind_gusts_10m",
    wind_speed_unit: "mph",
    timezone: "auto",
  });

  const res = await fetch(`${OPEN_METEO_FORECAST}?${params.toString()}`);
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);

  const payload = (await res.json()) as OpenMeteoCurrent | OpenMeteoCurrent[];
  const nodes = Array.isArray(payload) ? payload : [payload];

  return nodes
    .map((node) => {
      const speed = Number(node.current?.wind_speed_10m);
      const from = Number(node.current?.wind_direction_10m);
      const gust = Number(node.current?.wind_gusts_10m);
      if (!Number.isFinite(speed) || !Number.isFinite(from)) return null;
      return {
        lat: node.latitude,
        lng: node.longitude,
        speedMph: speed,
        gustMph: Number.isFinite(gust) ? gust : null,
        fromDeg: ((from % 360) + 360) % 360,
      } satisfies SurfaceWindSample;
    })
    .filter((s): s is SurfaceWindSample => s != null);
}

/** Wind samples as a GeoJSON FeatureCollection for Leaflet. */
export function surfaceWindToGeoJSON(
  samples: SurfaceWindSample[],
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: samples.map((sample, index) => ({
      type: "Feature",
      id: index,
      geometry: {
        type: "Point",
        coordinates: [sample.lng, sample.lat],
      },
      properties: {
        speedMph: sample.speedMph,
        gustMph: sample.gustMph,
        fromDeg: sample.fromDeg,
        /** Direction wind is blowing toward. */
        toDeg: (sample.fromDeg + 180) % 360,
      },
    })),
  };
}

export async function fetchSurfaceWindGeoJSON(
  bbox: MapBBox,
  zoom: number,
): Promise<GeoJSON.FeatureCollection> {
  const samples = await fetchSurfaceWind(bbox, zoom);
  return surfaceWindToGeoJSON(samples);
}

/** Graduated mph color stops (cyan → lime → yellow → orange → red). */
const WIND_COLOR_STOPS: { mph: number; rgb: [number, number, number] }[] = [
  { mph: 0, rgb: [103, 232, 249] },
  { mph: 8, rgb: [56, 189, 248] },
  { mph: 15, rgb: [163, 230, 53] },
  { mph: 25, rgb: [250, 204, 21] },
  { mph: 35, rgb: [249, 115, 22] },
  { mph: 50, rgb: [239, 68, 68] },
];

function lerpChannel(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

/** Continuous color for a given wind speed (mph). */
export function windSpeedColor(speedMph: unknown): string {
  const n = typeof speedMph === "number" ? speedMph : Number(speedMph);
  const speed = Number.isFinite(n) ? Math.max(0, n) : 0;
  const stops = WIND_COLOR_STOPS;

  if (speed <= stops[0].mph) {
    const [r, g, b] = stops[0].rgb;
    return `rgb(${r}, ${g}, ${b})`;
  }
  const last = stops[stops.length - 1];
  if (speed >= last.mph) {
    const [r, g, b] = last.rgb;
    return `rgb(${r}, ${g}, ${b})`;
  }

  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (speed >= a.mph && speed <= b.mph) {
      const t = (speed - a.mph) / (b.mph - a.mph);
      return `rgb(${lerpChannel(a.rgb[0], b.rgb[0], t)}, ${lerpChannel(a.rgb[1], b.rgb[1], t)}, ${lerpChannel(a.rgb[2], b.rgb[2], t)})`;
    }
  }

  const [r, g, b] = last.rgb;
  return `rgb(${r}, ${g}, ${b})`;
}

/** CSS linear-gradient matching the mph chart (for legend). */
export const windSpeedLegendGradient =
  "linear-gradient(90deg, rgb(103,232,249) 0%, rgb(56,189,248) 16%, rgb(163,230,53) 30%, rgb(250,204,21) 50%, rgb(249,115,22) 70%, rgb(239,68,68) 100%)";

export function windStyle(speedMph: unknown): WindStyle {
  const n = typeof speedMph === "number" ? speedMph : Number(speedMph);
  const color = windSpeedColor(n);
  if (!Number.isFinite(n) || n < 5) {
    return { stroke: color, fill: color, label: "Light" };
  }
  if (n < 12) {
    return { stroke: color, fill: color, label: "Moderate" };
  }
  if (n < 20) {
    return { stroke: color, fill: color, label: "Breezy" };
  }
  if (n < 30) {
    return { stroke: color, fill: color, label: "Strong" };
  }
  return { stroke: color, fill: color, label: "High" };
}

/** Compact shaft length in screen px — longer = faster. */
export function windShaftLengthPx(speedMph: unknown): number {
  const n = typeof speedMph === "number" ? speedMph : Number(speedMph);
  if (!Number.isFinite(n)) return 16;
  return Math.max(12, Math.min(28, 11 + n * 0.55));
}

/** Animation duration (seconds) — faster wind = faster flow. */
export function windFlowDurationSec(speedMph: unknown): number {
  const n = typeof speedMph === "number" ? speedMph : Number(speedMph);
  if (!Number.isFinite(n) || n <= 0) return 2.4;
  return Math.max(0.45, Math.min(2.2, 2.1 - n * 0.035));
}

export function formatWindSpeed(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${Math.round(n)} mph`;
}

export function formatWindFrom(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
  const idx = Math.round((((n % 360) + 360) % 360) / 45) % 8;
  return `${dirs[idx]} (${Math.round(n)}°)`;
}
