/** Tactical polygon tools — pins and TF-numbered address zones. */

import { destinationPoint, distanceMeters, type LatLng } from "@/lib/geoNav";

export type TacticalAddress = {
  id: string;
  label: string;
  detail: string;
  lat: number;
  lng: number;
};

export function formatTfId(index: number): string {
  return `TF${String(index).padStart(2, "0")}`;
}

/** Ray-cast point-in-polygon. `ring` may be open or closed. */
export function pointInPolygon(point: LatLng, ring: LatLng[]): boolean {
  if (ring.length < 3) return false;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i].lng;
    const yi = ring[i].lat;
    const xj = ring[j].lng;
    const yj = ring[j].lat;
    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Monotone-chain convex hull (lng/lat treated as plane for local zones). */
export function convexHull(points: LatLng[]): LatLng[] {
  const unique = dedupePoints(points);
  if (unique.length < 3) return unique;

  const sorted = [...unique].sort((a, b) =>
    a.lng === b.lng ? a.lat - b.lat : a.lng - b.lng,
  );

  const cross = (o: LatLng, a: LatLng, b: LatLng) =>
    (a.lng - o.lng) * (b.lat - o.lat) - (a.lat - o.lat) * (b.lng - o.lng);

  const lower: LatLng[] = [];
  for (const p of sorted) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    ) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: LatLng[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    ) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return [...lower, ...upper];
}

function dedupePoints(points: LatLng[]): LatLng[] {
  const seen = new Set<string>();
  const out: LatLng[] = [];
  for (const p of points) {
    const key = `${p.lat.toFixed(6)}:${p.lng.toFixed(6)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

/** Sample locations inside a polygon, nearest to `origin` first. */
export function samplePointsInPolygon(
  ring: LatLng[],
  origin: LatLng,
  options?: { maxRadiusM?: number },
): LatLng[] {
  const maxRadiusM = options?.maxRadiusM ?? 450;
  const radii = [0, 28, 55, 90, 130, 175, 230, 300, 380, 450].filter(
    (r) => r <= maxRadiusM,
  );
  const scored: { p: LatLng; d: number }[] = [];

  for (const radius of radii) {
    if (radius === 0) {
      if (pointInPolygon(origin, ring)) {
        scored.push({ p: origin, d: 0 });
      }
      continue;
    }
    const steps = radius < 100 ? 8 : radius < 250 ? 10 : 12;
    for (let i = 0; i < steps; i++) {
      const p = destinationPoint(origin, (360 / steps) * i, radius);
      if (pointInPolygon(p, ring)) {
        scored.push({ p, d: distanceMeters(origin, p) });
      }
    }
  }

  scored.sort((a, b) => a.d - b.d);
  return scored.map((s) => s.p);
}

type ArcGisReverse = {
  address?: {
    Match_addr?: string;
    ShortLabel?: string;
    LongLabel?: string;
    AddNum?: string;
    Address?: string;
    City?: string;
    RegionAbbr?: string;
    Postal?: string;
    Addr_type?: string;
  };
  location?: { x?: number; y?: number };
};

async function reversePointAddress(
  point: LatLng,
): Promise<TacticalAddress | null> {
  const params = new URLSearchParams({
    f: "json",
    featureTypes: "PointAddress",
    location: `${point.lng},${point.lat}`,
    distance: "80",
  });
  const res = await fetch(
    `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?${params}`,
  );
  if (!res.ok) return null;
  const data = (await res.json()) as ArcGisReverse;
  const addr = data.address;
  const loc = data.location;
  if (!addr || loc?.x == null || loc?.y == null) return null;
  if (addr.Addr_type && addr.Addr_type !== "PointAddress") return null;

  const lat = loc.y;
  const lng = loc.x;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const label =
    addr.ShortLabel ||
    addr.Address ||
    [addr.AddNum, addr.Address].filter(Boolean).join(" ") ||
    addr.Match_addr ||
    "Address";
  const detail = [addr.City, addr.RegionAbbr, addr.Postal]
    .filter(Boolean)
    .join(", ");

  return {
    id: `${lat.toFixed(6)}:${lng.toFixed(6)}:${label.toLowerCase()}`,
    label,
    detail,
    lat,
    lng,
  };
}

/**
 * Find the closest rooftop addresses to `origin` that fall inside `ring`.
 * Uses ArcGIS PointAddress reverse geocoding on a spiral sample.
 */
export async function fetchClosestAddressesInPolygon(
  ring: LatLng[],
  origin: LatLng,
  limit = 10,
): Promise<TacticalAddress[]> {
  const samples = samplePointsInPolygon(ring, origin);
  if (samples.length === 0) return [];

  const found = new Map<string, TacticalAddress>();
  const batchSize = 6;

  for (let i = 0; i < samples.length && found.size < limit; i += batchSize) {
    const batch = samples.slice(i, i + batchSize);
    const hits = await Promise.all(batch.map((p) => reversePointAddress(p)));
    for (const hit of hits) {
      if (!hit) continue;
      const inside = pointInPolygon({ lat: hit.lat, lng: hit.lng }, ring);
      if (!inside) continue;
      const key = hit.label.replace(/\s+/g, " ").trim().toLowerCase();
      if (found.has(key)) continue;
      found.set(key, hit);
      if (found.size >= limit) break;
    }
  }

  return [...found.values()]
    .sort(
      (a, b) =>
        distanceMeters(origin, { lat: a.lat, lng: a.lng }) -
        distanceMeters(origin, { lat: b.lat, lng: b.lng }),
    )
    .slice(0, limit);
}

/** Leaflet getLatLngs() → a single outer ring that contains `point` if possible. */
export function leafletLatLngsToRing(
  raw: unknown,
  point?: LatLng,
): LatLng[] | null {
  const rings = flattenLeafletRings(raw);
  if (rings.length === 0) return null;
  if (point) {
    const hit = rings.find((ring) => pointInPolygon(point, ring));
    if (hit) return hit;
  }
  return rings.reduce((best, ring) =>
    ring.length > best.length ? ring : best,
  );
}

function flattenLeafletRings(raw: unknown): LatLng[][] {
  if (!Array.isArray(raw) || raw.length === 0) return [];

  const asPoint = (item: unknown): LatLng | null => {
    if (!item || typeof item !== "object") return null;
    const rec = item as { lat?: unknown; lng?: unknown };
    if (typeof rec.lat === "number" && typeof rec.lng === "number") {
      return { lat: rec.lat, lng: rec.lng };
    }
    return null;
  };

  if (asPoint(raw[0])) {
    return [(raw as unknown[]).map(asPoint).filter((p): p is LatLng => p != null)];
  }

  const out: LatLng[][] = [];
  for (const child of raw as unknown[]) {
    out.push(...flattenLeafletRings(child));
  }
  return out.filter((ring) => ring.length >= 3);
}
