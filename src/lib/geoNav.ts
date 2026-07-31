/** Navigation helpers for AR compass / flashlight pointing. */

export type LatLng = { lat: number; lng: number };

export type ArTarget = {
  id: string;
  name: string;
  kind: string;
  lat: number;
  lng: number;
};

const EARTH_RADIUS_M = 6371000;

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/** Normalize degrees into [0, 360). */
export function normalizeDegrees(degrees: number): number {
  const n = degrees % 360;
  return n < 0 ? n + 360 : n;
}

/** Shortest signed delta from `from` to `to` in degrees (−180…180]. */
export function shortestAngleDelta(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}

/** Initial bearing from A → B in degrees (0 = north, clockwise). */
export function bearingDegrees(from: LatLng, to: LatLng): number {
  const φ1 = toRadians(from.lat);
  const φ2 = toRadians(to.lat);
  const Δλ = toRadians(to.lng - from.lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return normalizeDegrees(toDegrees(Math.atan2(y, x)));
}

/** Great-circle distance in meters. */
export function distanceMeters(from: LatLng, to: LatLng): number {
  const φ1 = toRadians(from.lat);
  const φ2 = toRadians(to.lat);
  const Δφ = toRadians(to.lat - from.lat);
  const Δλ = toRadians(to.lng - from.lng);
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Destination point given start, bearing (deg), and distance (m). */
export function destinationPoint(
  from: LatLng,
  bearingDeg: number,
  distanceM: number,
): LatLng {
  const δ = distanceM / EARTH_RADIUS_M;
  const θ = toRadians(bearingDeg);
  const φ1 = toRadians(from.lat);
  const λ1 = toRadians(from.lng);
  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ),
  );
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2),
    );
  return { lat: toDegrees(φ2), lng: toDegrees(λ2) };
}

/** Leaflet-friendly latlng ring for a flashlight sector. */
export function flashlightSector(
  from: LatLng,
  headingDeg: number,
  radiusM: number,
  halfAngleDeg: number,
  steps = 28,
): [number, number][] {
  const ring: [number, number][] = [[from.lat, from.lng]];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const bearing = headingDeg - halfAngleDeg + t * (halfAngleDeg * 2);
    const p = destinationPoint(from, bearing, radiusM);
    ring.push([p.lat, p.lng]);
  }
  ring.push([from.lat, from.lng]);
  return ring;
}

export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters)) return "—";
  const miles = meters / 1609.344;
  if (miles < 0.1) {
    const feet = meters * 3.28084;
    return `${Math.round(feet)} ft`;
  }
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

export function cardinalFromHeading(degrees: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
  const idx = Math.round(normalizeDegrees(degrees) / 45) % 8;
  return dirs[idx];
}

export function featureDisplayName(
  props: Record<string, unknown>,
  kind: string,
): string {
  const candidates = [
    props.IncidentName,
    props.poly_IncidentName,
    props.attr_IncidentName,
    props.ZONE_NAME,
    props.UNIT__,
    props.OES_ID__,
    props.Description,
    props.DeviceID,
    props.resource_operational_name,
    props.resource_name,
    props.Assignment_Name,
    props.Catalog_Item,
    props.Airport,
    props.Designator,
    props.OFFICENAME,
    props.district_name,
    props.name,
    props.Station,
  ];
  for (const value of candidates) {
    if (value != null && String(value).trim()) return String(value);
  }
  return kind;
}
