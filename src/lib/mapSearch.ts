/** Map search helpers — fires, addresses, and common place names. */

import type { ArTarget } from "@/lib/geoNav";

export type SearchResultKind = "fire" | "place" | "address" | "resource";

export type MapSearchResult = {
  id: string;
  label: string;
  detail: string;
  kind: SearchResultKind;
  lat: number;
  lng: number;
};

/** Frequently used PNW / West places for quick lookup without geocoding. */
export const COMMON_PLACES: MapSearchResult[] = [
  {
    id: "place-the-dalles",
    label: "The Dalles, OR",
    detail: "Hogback home — Wasco County",
    kind: "place",
    lat: 45.5945,
    lng: -121.1787,
  },
  {
    id: "place-portland",
    label: "Portland, OR",
    detail: "Multnomah County",
    kind: "place",
    lat: 45.5152,
    lng: -122.6784,
  },
  {
    id: "place-bend",
    label: "Bend, OR",
    detail: "Deschutes County",
    kind: "place",
    lat: 44.0582,
    lng: -121.3153,
  },
  {
    id: "place-medford",
    label: "Medford, OR",
    detail: "Jackson County",
    kind: "place",
    lat: 42.3265,
    lng: -122.8756,
  },
  {
    id: "place-eugene",
    label: "Eugene, OR",
    detail: "Lane County",
    kind: "place",
    lat: 44.0521,
    lng: -123.0868,
  },
  {
    id: "place-salem",
    label: "Salem, OR",
    detail: "Oregon state capital",
    kind: "place",
    lat: 44.9429,
    lng: -123.0351,
  },
  {
    id: "place-pendleton",
    label: "Pendleton, OR",
    detail: "Umatilla County",
    kind: "place",
    lat: 45.6721,
    lng: -118.7886,
  },
  {
    id: "place-klamath-falls",
    label: "Klamath Falls, OR",
    detail: "Klamath County",
    kind: "place",
    lat: 42.2249,
    lng: -121.7817,
  },
  {
    id: "place-boise",
    label: "Boise, ID",
    detail: "Ada County",
    kind: "place",
    lat: 43.615,
    lng: -116.2023,
  },
  {
    id: "place-seattle",
    label: "Seattle, WA",
    detail: "King County",
    kind: "place",
    lat: 47.6062,
    lng: -122.3321,
  },
  {
    id: "place-spokane",
    label: "Spokane, WA",
    detail: "Spokane County",
    kind: "place",
    lat: 47.6588,
    lng: -117.426,
  },
  {
    id: "place-redding",
    label: "Redding, CA",
    detail: "Shasta County",
    kind: "place",
    lat: 40.5865,
    lng: -122.3917,
  },
  {
    id: "place-sacramento",
    label: "Sacramento, CA",
    detail: "California state capital",
    kind: "place",
    lat: 38.5816,
    lng: -121.4944,
  },
  {
    id: "place-reno",
    label: "Reno, NV",
    detail: "Washoe County",
    kind: "place",
    lat: 39.5296,
    lng: -119.8138,
  },
  {
    id: "place-nifc",
    label: "National Interagency Fire Center",
    detail: "Boise, ID",
    kind: "place",
    lat: 43.5668,
    lng: -116.2405,
  },
];

function normalizeQuery(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, " ");
}

export function searchLocalTargets(
  query: string,
  targets: ArTarget[],
): MapSearchResult[] {
  const q = normalizeQuery(query);
  if (q.length < 2) return [];

  return targets
    .filter((t) => {
      const hay = `${t.name} ${t.kind}`.toLowerCase();
      return hay.includes(q);
    })
    .slice(0, 8)
    .map((t) => ({
      id: `local-${t.id}`,
      label: t.name,
      detail: t.kind,
      kind:
        /fire|incident|perimeter/i.test(t.kind) || /fire/i.test(t.name)
          ? ("fire" as const)
          : ("resource" as const),
      lat: t.lat,
      lng: t.lng,
    }));
}

export function searchCommonPlaces(query: string): MapSearchResult[] {
  const q = normalizeQuery(query);
  if (q.length < 2) return [];

  return COMMON_PLACES.filter((p) => {
    const hay = `${p.label} ${p.detail}`.toLowerCase();
    return hay.includes(q);
  }).slice(0, 6);
}

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    type?: string;
    osm_value?: string;
  };
};

/** Photon (Komoot) geocoder for addresses and place names. */
export async function searchAddressesAndPlaces(
  query: string,
  bias?: { lat: number; lng: number },
): Promise<MapSearchResult[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const params = new URLSearchParams({
    q,
    limit: "6",
    lang: "en",
  });
  if (bias) {
    params.set("lat", String(bias.lat));
    params.set("lon", String(bias.lng));
  }

  const res = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`Geocoder HTTP ${res.status}`);

  const data = (await res.json()) as { features?: PhotonFeature[] };
  const features = data.features ?? [];

  return features
    .map((feature, index) => {
      const coords = feature.geometry?.coordinates;
      if (!coords || coords.length < 2) return null;
      const [lng, lat] = coords;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

      const p = feature.properties ?? {};
      const street = [p.housenumber, p.street].filter(Boolean).join(" ");
      const label =
        p.name ||
        street ||
        [p.city, p.state].filter(Boolean).join(", ") ||
        "Place";
      const detail = [street && p.name ? street : null, p.city, p.state, p.country]
        .filter(Boolean)
        .join(", ");

      const isAddress = Boolean(p.street || p.housenumber || p.postcode);

      return {
        id: `geo-${index}-${lat.toFixed(4)}-${lng.toFixed(4)}`,
        label,
        detail: detail || p.type || p.osm_value || "Place",
        kind: (isAddress ? "address" : "place") as SearchResultKind,
        lat,
        lng,
      };
    })
    .filter((r): r is MapSearchResult => r != null);
}

export async function runMapSearch(
  query: string,
  targets: ArTarget[],
  bias?: { lat: number; lng: number },
): Promise<MapSearchResult[]> {
  const local = searchLocalTargets(query, targets);
  const places = searchCommonPlaces(query);

  let remote: MapSearchResult[] = [];
  try {
    remote = await searchAddressesAndPlaces(query, bias);
  } catch {
    remote = [];
  }

  const seen = new Set<string>();
  const merged: MapSearchResult[] = [];
  for (const item of [...local, ...places, ...remote]) {
    const key = `${item.label.toLowerCase()}|${item.lat.toFixed(3)}|${item.lng.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  return merged.slice(0, 12);
}
