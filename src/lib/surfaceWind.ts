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

  let cols = 4;
  let rows = 4;
  if (zoom >= 11) {
    cols = 8;
    rows = 7;
  } else if (zoom >= 9) {
    cols = 7;
    rows = 6;
  } else if (zoom >= 7) {
    cols = 6;
    rows = 5;
  } else if (zoom >= 5) {
    cols = 5;
    rows = 4;
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

export function windStyle(speedMph: unknown): WindStyle {
  const n = typeof speedMph === "number" ? speedMph : Number(speedMph);
  if (!Number.isFinite(n) || n < 5) {
    return { stroke: "#67e8f9", fill: "#a5f3fc", label: "Light" };
  }
  if (n < 12) {
    return { stroke: "#38bdf8", fill: "#7dd3fc", label: "Moderate" };
  }
  if (n < 20) {
    return { stroke: "#fbbf24", fill: "#fde68a", label: "Breezy" };
  }
  if (n < 30) {
    return { stroke: "#f97316", fill: "#fdba74", label: "Strong" };
  }
  return { stroke: "#ef4444", fill: "#fca5a5", label: "High" };
}

/** Shaft length in screen px — longer = faster. */
export function windShaftLengthPx(speedMph: unknown): number {
  const n = typeof speedMph === "number" ? speedMph : Number(speedMph);
  if (!Number.isFinite(n)) return 22;
  return Math.max(18, Math.min(44, 16 + n * 0.9));
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
