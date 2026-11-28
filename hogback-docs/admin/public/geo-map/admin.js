/**
 * Hogback Map Admin — MapLibre GL JS preview for basemap + selectable layer stacks.
 * Hosted at /geo/admin/ on Firebase (backend/out).
 */

/** Absolute CDN when not served from hogback-geo hosting (admin embed, file://). */
const ORIGIN = (() => {
  if (window.location.protocol === "file:") return "https://hogback-geo.web.app";
  const host = window.location.hostname;
  if (host === "hogback-geo.web.app" || host === "localhost" || host === "127.0.0.1") {
    return "";
  }
  return "https://hogback-geo.web.app";
})();
const path = (p) => `${ORIGIN}${p.startsWith("/") ? p : `/${p}`}`;

async function fetchJson(url, fallback) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[map-admin] ${url}`, err);
    return fallback;
  }
}

const OR_CENTER = { lng: -120.75, lat: 44.0 };
const OR_BOUNDS = [
  [-124.7, 41.9],
  [-116.4, 46.3],
];
const WASCO_BOUNDS = [
  [-121.92, 44.67],
  [-120.45, 45.78],
];

const WFIGS_BASE =
  "https://services3.arcgis.com/T4QMspbfLg3qTGWY/ArcGIS/rest/services";
const OR_ACCESS =
  "https://nrimp.dfw.state.or.us/arcgis/rest/services/ORHAM/Access_and_Habitat_Areas/FeatureServer/0";

const OWNERSHIP_FILL = [
  "match",
  ["upcase", ["coalesce", ["get", "code"], ""]],
  ["USFS", "NFS", "FS"],
  "rgba(63, 143, 90, 0.32)",
  ["BLM"],
  "rgba(212, 168, 75, 0.28)",
  ["BIA", "TRIB", "TRIBAL"],
  "rgba(196, 91, 154, 0.30)",
  ["FWS", "USFW", "NPS", "USBR", "BOR", "DOD", "DOE", "USACE", "USAF", "ARMY", "NAVY", "USMC", "USCG", "OTHF", "OTHFE", "FED", "GSA", "FAA", "USDA", "BPA", "DOI"],
  "rgba(63, 143, 90, 0.22)",
  ["STATE", "ST", "STF", "STL", "STW", "ODFW", "ODF", "DSL"],
  "rgba(90, 140, 180, 0.26)",
  "rgba(140, 150, 140, 0.12)",
];

const OWNERSHIP_LINE = [
  "match",
  ["upcase", ["coalesce", ["get", "code"], ""]],
  ["USFS", "NFS", "FS"],
  "#6fbf86",
  ["BLM"],
  "#e0c06a",
  ["BIA", "TRIB", "TRIBAL"],
  "#e08abb",
  ["FWS", "USFW", "NPS", "USBR", "BOR", "DOD", "DOE", "USACE", "USAF", "ARMY", "NAVY", "USMC", "USCG", "OTHF", "OTHFE", "FED", "GSA", "FAA", "USDA", "BPA", "DOI"],
  "#6fbf86",
  ["STATE", "ST", "STF", "STL", "STW", "ODFW", "ODF", "DSL"],
  "#8eb4d4",
  "#a8b4a8",
];

const STACKS = [
  {
    id: "boundaries",
    title: "Boundaries",
    hint: "States, counties, hunt units",
  },
  {
    id: "public",
    title: "Public ownership",
    hint: "Federal, tribal, and state property. Source and update time are on each layer.",
  },
  {
    id: "private",
    title: "Private",
    hint: "Enrolled access & private land — separate from SMA",
  },
  {
    id: "fires",
    title: "Fires",
    hint: "Live NIFC / WFIGS — not baked into Field packs",
  },
];

const BASEMAPS = [
  {
    id: "satellite",
    label: "Satellite",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ],
    attribution: "Esri World Imagery",
    maxzoom: 19,
  },
  {
    id: "topo",
    label: "Topo",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    ],
    attribution: "Esri World Topo",
    maxzoom: 19,
  },
  {
    id: "hybrid",
    label: "Hybrid",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ],
    attribution: "Esri Imagery + topo lines",
    maxzoom: 19,
    overlayTiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    ],
  },
  {
    id: "field",
    label: "Field pack",
    pmtiles: true,
    attribution: "Hogback Field",
  },
];

/**
 * Selectable overlays.
 * source: edition = Hogback hosted GeoJSON; live = ArcGIS query for current viewport.
 */
const LAYER_DEFS = [
  // Boundaries
  {
    id: "states",
    stack: "boundaries",
    name: "State lines",
    meta: "US outlines",
    swatch: "#d8ddd6",
    defaultOn: true,
    source: "edition",
    manifestIds: ["states-us"],
    fallback: "editions/2026.09.22/regions/us/states.geojson",
    kind: "line",
    minzoom: 2,
    paint: {
      "line-color": "#e8ede6",
      "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.6, 8, 1.6],
      "line-opacity": 0.85,
    },
  },
  {
    id: "counties-or",
    stack: "boundaries",
    name: "Counties (OR)",
    meta: "Oregon counties",
    swatch: "#9aa89a",
    defaultOn: false,
    source: "edition",
    manifestIds: ["counties-or", "counties-us"],
    fallback: "editions/2026.10.01/regions/us/counties/or.geojson",
    kind: "line",
    minzoom: 5,
    paint: {
      "line-color": "#b7c4b5",
      "line-width": 0.8,
      "line-opacity": 0.7,
    },
  },
  {
    id: "hunt-units-or",
    stack: "boundaries",
    name: "Hunt units (OR)",
    meta: "ODFW units",
    swatch: "#9a5a4a",
    defaultOn: true,
    source: "edition",
    manifestIds: ["hunt-units-or"],
    fallback: "editions/2026.09.22/regions/or/hunt-units.geojson",
    kind: "fill-line",
    minzoom: 5,
    fillPaint: {
      "fill-color": "rgba(140, 70, 55, 0.07)",
      "fill-outline-color": "rgba(170, 90, 70, 0.55)",
    },
    linePaint: {
      "line-color": "#c47a64",
      "line-width": 1.15,
      "line-opacity": 0.9,
    },
  },
  // Public ownership
  {
    id: "ownership-or",
    stack: "public",
    name: "Federal & tribal (OR)",
    meta: "USFS · BLM · BIA · FWS · NPS",
    swatch: "#3f8f5a",
    defaultOn: true,
    source: "edition",
    manifestIds: ["ownership-or"],
    fallback: "editions/2026.11.28/regions/or/ownership.geojson",
    kind: "ownership",
    minzoom: 5,
  },
  {
    id: "ownership-or-state",
    stack: "public",
    name: "State lands (OR)",
    meta: "State fee property",
    swatch: "#5a8cb4",
    defaultOn: false,
    source: "edition",
    manifestIds: ["ownership-or-state"],
    fallback: "editions/2026.11.28/regions/or/ownership-state.geojson",
    kind: "ownership",
    minzoom: 6,
  },
  {
    id: "ownership-wa",
    stack: "public",
    name: "Federal & tribal (WA)",
    meta: "Washington federal fee",
    swatch: "#d4a84b",
    defaultOn: false,
    source: "edition",
    manifestIds: ["ownership-wa"],
    fallback: "editions/2026.11.28/regions/wa/ownership.geojson",
    kind: "ownership",
    minzoom: 5,
  },
  {
    id: "ownership-ca",
    stack: "public",
    name: "Federal & tribal (CA)",
    meta: "California federal surface",
    swatch: "#6fbf86",
    defaultOn: false,
    source: "edition",
    manifestIds: ["ownership-ca"],
    fallback: "editions/2026.11.28/regions/ca/ownership.geojson",
    kind: "ownership",
    minzoom: 5,
  },
  {
    id: "ownership-id",
    stack: "public",
    name: "Federal & tribal (ID)",
    meta: "Idaho federal surface",
    swatch: "#8eb4d4",
    defaultOn: false,
    source: "edition",
    manifestIds: ["ownership-id"],
    fallback: "editions/2026.11.28/regions/id/ownership.geojson",
    kind: "ownership",
    minzoom: 5,
  },
  // Private
  {
    id: "access-or",
    stack: "private",
    name: "Possible access (OR)",
    meta: "Enrolled private access",
    sourceLabel: "ODFW Access & Habitat",
    sourceUrl: OR_ACCESS,
    swatch: "#2fa894",
    defaultOn: false,
    source: "live",
    live: "access-or",
    kind: "access",
    minzoom: 7,
  },
  {
    id: "taxlots-note",
    stack: "private",
    name: "Taxlots / deeds",
    meta: "Identify-only on devices — not painted here",
    swatch: "#7a8680",
    defaultOn: false,
    source: "none",
    kind: "none",
    disabled: true,
  },
  // Fires
  {
    id: "fire-perimeters",
    stack: "fires",
    name: "Active perimeters",
    meta: "Current fire perimeters",
    sourceLabel: "NIFC WFIGS",
    sourceUrl: `${WFIGS_BASE}/WFIGS_Interagency_Perimeters_Current/FeatureServer/0`,
    swatch: "#e06a4a",
    defaultOn: false,
    source: "live",
    live: "fire-perimeters",
    kind: "fire-fill",
    minzoom: 4,
  },
  {
    id: "fire-points",
    stack: "fires",
    name: "Incident points",
    meta: "Incident locations",
    sourceLabel: "NIFC WFIGS",
    sourceUrl: `${WFIGS_BASE}/WFIGS_Incident_Locations_Current/FeatureServer/0`,
    swatch: "#f0a060",
    defaultOn: false,
    source: "live",
    live: "fire-points",
    kind: "fire-point",
    minzoom: 4,
  },
  {
    id: "fire-historic",
    stack: "fires",
    name: "Historic burns",
    meta: "Last ~10 years · heavy",
    sourceLabel: "NIFC WFIGS historic perimeters",
    sourceUrl: `${WFIGS_BASE}/InterAgencyFirePerimeterHistory_All_Years_View/FeatureServer/0`,
    swatch: "#a06040",
    defaultOn: false,
    source: "live",
    live: "fire-historic",
    kind: "fire-fill",
    minzoom: 6,
  },
];

const state = {
  basemap: "satellite",
  fieldPmtilesUrl: null,
  layerOn: Object.fromEntries(LAYER_DEFS.map((l) => [l.id, l.defaultOn])),
  layerOpacity: Object.fromEntries(LAYER_DEFS.map((l) => [l.id, 1])),
  layerUrls: {},
  layerInfo: {},
  edition: "—",
  liveStatus: "idle",
  liveLoaded: {},
};

let mapRef = null;
let liveTimer = null;

const SOURCE_LABELS = {
  "blm-national-sma": "BLM National Surface Management Agency",
  "usgs-padus-fee": "USGS PAD-US 4.0 Fee Managers",
  "blm-or-wa-ownership-hub": "BLM OR/WA ownership hub",
};

function formatStamp(value) {
  if (!value) return null;
  const raw = String(value);
  const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = dateOnly
    ? new Date(Date.UTC(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])))
    : new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function sourceRecord(layer) {
  const sources = layer?.sources || [];
  return sources[0] || null;
}

function provenanceText(info) {
  if (!info) return "";
  const parts = [];
  if (info.sourceLabel) parts.push(info.sourceLabel);
  const updated = formatStamp(info.fetchedAt);
  if (updated) parts.push(`updated ${updated}`);
  const vintage = formatStamp(info.sourceUpdated);
  if (vintage && vintage !== updated) parts.push(`data through ${vintage}`);
  if (info.featureCount != null) parts.push(`${info.featureCount.toLocaleString()} features`);
  return parts.join(" · ");
}

function setLiveStatus(text) {
  state.liveStatus = text;
  const el = document.getElementById("live-readout");
  if (el) el.textContent = text;
}

function registerPmtiles() {
  const protocol = new pmtiles.Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);
}

function emptyStyle() {
  return {
    version: 8,
    name: "Hogback Admin",
    sources: {},
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": "#0c1210" },
      },
    ],
  };
}

function sourceId(layerId) {
  return `hb-src-${layerId}`;
}
function fillId(layerId) {
  return `hb-${layerId}-fill`;
}
function lineId(layerId) {
  return `hb-${layerId}-line`;
}
function circleId(layerId) {
  return `hb-${layerId}-circle`;
}

function firstOverlayLayerId(map) {
  const layers = map.getStyle()?.layers || [];
  const hit = layers.find((l) => l.id.startsWith("hb-"));
  return hit?.id;
}

function mapEnvelope(map, pad = 0.15) {
  const b = map.getBounds();
  const lngPad = (b.getEast() - b.getWest()) * pad;
  const latPad = (b.getNorth() - b.getSouth()) * pad;
  return {
    west: b.getWest() - lngPad,
    south: b.getSouth() - latPad,
    east: b.getEast() + lngPad,
    north: b.getNorth() + latPad,
  };
}

function arcgisQueryUrl(base, { envelope, where = "1=1", outFields = "*", maxAllowableOffset } = {}) {
  const u = new URL(`${base}/query`);
  u.searchParams.set("f", "geojson");
  u.searchParams.set("where", where);
  u.searchParams.set("outFields", outFields);
  u.searchParams.set("returnGeometry", "true");
  u.searchParams.set("outSR", "4326");
  u.searchParams.set("resultRecordCount", "2000");
  if (envelope) {
    u.searchParams.set(
      "geometry",
      JSON.stringify({
        xmin: envelope.west,
        ymin: envelope.south,
        xmax: envelope.east,
        ymax: envelope.north,
        spatialReference: { wkid: 4326 },
      })
    );
    u.searchParams.set("geometryType", "esriGeometryEnvelope");
    u.searchParams.set("inSR", "4326");
    u.searchParams.set("spatialRel", "esriSpatialRelIntersects");
  }
  if (maxAllowableOffset != null) {
    u.searchParams.set("maxAllowableOffset", String(maxAllowableOffset));
  }
  return u.toString();
}

async function fetchGeoJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function applyBasemap(map) {
  const def = BASEMAPS.find((b) => b.id === state.basemap) || BASEMAPS[0];
  const hint = document.getElementById("basemap-hint");

  for (const id of ["basemap-raster", "basemap-overlay"]) {
    if (map.getLayer(id)) map.removeLayer(id);
  }
  for (const id of ["basemap", "basemap-lines"]) {
    if (map.getSource(id)) map.removeSource(id);
  }

  if (def.pmtiles) {
    if (!state.fieldPmtilesUrl) {
      hint.textContent =
        "No Field PMTiles in catalog yet — bake + publish_mapbase.py, then refresh.";
      hint.className = "hint warn";
      return;
    }
    const url = state.fieldPmtilesUrl.startsWith("http")
      ? state.fieldPmtilesUrl
      : path(state.fieldPmtilesUrl);
    map.addSource("basemap", {
      type: "raster",
      url: `pmtiles://${url}`,
      tileSize: 256,
      attribution: def.attribution,
    });
    map.addLayer(
      {
        id: "basemap-raster",
        type: "raster",
        source: "basemap",
        paint: { "raster-opacity": 1, "raster-fade-duration": 0 },
      },
      firstOverlayLayerId(map)
    );
    hint.textContent = "Field pack (wash baked). Clients should use this, not live SMA.";
    hint.className = "hint";
    return;
  }

  map.addSource("basemap", {
    type: "raster",
    tiles: def.tiles,
    tileSize: 256,
    maxzoom: def.maxzoom || 19,
    attribution: def.attribution,
  });
  map.addLayer(
    {
      id: "basemap-raster",
      type: "raster",
      source: "basemap",
      paint: { "raster-opacity": 1, "raster-fade-duration": 0 },
    },
    firstOverlayLayerId(map)
  );

  if (def.overlayTiles) {
    map.addSource("basemap-lines", {
      type: "raster",
      tiles: def.overlayTiles,
      tileSize: 256,
      maxzoom: 19,
      attribution: "Esri World Topo",
    });
    map.addLayer(
      {
        id: "basemap-overlay",
        type: "raster",
        source: "basemap-lines",
        paint: {
          "raster-opacity": 0.42,
          "raster-fade-duration": 0,
          "raster-saturation": -0.35,
        },
      },
      firstOverlayLayerId(map)
    );
  }

  hint.textContent =
    def.id === "hybrid"
      ? "Live hybrid for authoring. Bake sat+lines into Field before shipping."
      : "Live tiles for authoring. Bake into owned packs for production.";
  hint.className = "hint";
}

function ensureOverlay(map, def) {
  if (def.kind === "none" || def.disabled) return;

  const opacity = state.layerOpacity[def.id] ?? 1;
  const visible = state.layerOn[def.id] ? "visible" : "none";
  const src = sourceId(def.id);

  if (def.source === "edition") {
    const url = state.layerUrls[def.id];
    if (!url) return;
    if (!map.getSource(src)) {
      const info = state.layerInfo[def.id];
      map.addSource(src, {
        type: "geojson",
        data: url,
        // Keep edition vertices exact in Map Admin (authoring before bake).
        // Ownership already needed 0; states / hunt units were chorded at 0.375.
        tolerance: 0,
        attribution: info?.sourceLabel || "Hogback editions",
      });
    }
  } else if (def.source === "live") {
    if (!map.getSource(src)) {
      map.addSource(src, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        attribution: def.stack === "fires" ? "NIFC / WFIGS" : "ODFW Access & Habitat",
      });
    }
  }

  if (def.kind === "line") {
    upsertLine(map, def, visible, opacity);
    return;
  }
  if (def.kind === "fill-line" || def.kind === "ownership" || def.kind === "access" || def.kind === "fire-fill") {
    upsertFillLine(map, def, visible, opacity);
    return;
  }
  if (def.kind === "fire-point") {
    upsertCircle(map, def, visible, opacity);
  }
}

function upsertLine(map, def, visible, opacity) {
  const id = lineId(def.id);
  if (!map.getLayer(id)) {
    map.addLayer({
      id,
      type: "line",
      source: sourceId(def.id),
      minzoom: def.minzoom || 0,
      layout: { visibility: visible },
      paint: {
        ...def.paint,
        "line-opacity": (def.paint["line-opacity"] ?? 1) * opacity,
      },
    });
  } else {
    map.setLayoutProperty(id, "visibility", visible);
    map.setPaintProperty(id, "line-opacity", (def.paint["line-opacity"] ?? 1) * opacity);
  }
}

function upsertFillLine(map, def, visible, opacity) {
  let fillPaint;
  let linePaint;

  if (def.kind === "ownership") {
    fillPaint = { "fill-color": OWNERSHIP_FILL, "fill-opacity": opacity };
    linePaint = {
      "line-color": OWNERSHIP_LINE,
      "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.4, 12, 1.2],
      "line-opacity": 0.9 * opacity,
    };
  } else if (def.kind === "access") {
    fillPaint = {
      "fill-color": "rgba(47, 168, 148, 0.28)",
      "fill-opacity": opacity,
    };
    linePaint = {
      "line-color": "#5ec4b0",
      "line-width": 1.2,
      "line-opacity": 0.95 * opacity,
    };
  } else if (def.kind === "fire-fill") {
    const historic = def.id === "fire-historic";
    fillPaint = {
      "fill-color": historic ? "rgba(160, 96, 64, 0.22)" : "rgba(224, 106, 74, 0.35)",
      "fill-opacity": opacity,
    };
    linePaint = {
      "line-color": historic ? "#c08060" : "#ff8a60",
      "line-width": historic ? 0.8 : 1.4,
      "line-opacity": 0.95 * opacity,
    };
  } else {
    fillPaint = {
      ...def.fillPaint,
      "fill-opacity": (def.fillPaint?.["fill-opacity"] ?? 1) * opacity,
    };
    linePaint = {
      ...def.linePaint,
      "line-opacity": (def.linePaint?.["line-opacity"] ?? 1) * opacity,
    };
  }

  const fid = fillId(def.id);
  const lid = lineId(def.id);
  if (!map.getLayer(fid)) {
    map.addLayer({
      id: fid,
      type: "fill",
      source: sourceId(def.id),
      minzoom: def.minzoom || 0,
      layout: { visibility: visible },
      paint: fillPaint,
    });
  } else {
    map.setLayoutProperty(fid, "visibility", visible);
    map.setPaintProperty(fid, "fill-opacity", fillPaint["fill-opacity"]);
  }

  if (!map.getLayer(lid)) {
    map.addLayer({
      id: lid,
      type: "line",
      source: sourceId(def.id),
      minzoom: def.minzoom || 0,
      layout: { visibility: visible },
      paint: linePaint,
    });
  } else {
    map.setLayoutProperty(lid, "visibility", visible);
    map.setPaintProperty(lid, "line-opacity", linePaint["line-opacity"]);
  }
}

function upsertCircle(map, def, visible, opacity) {
  const id = circleId(def.id);
  if (!map.getLayer(id)) {
    map.addLayer({
      id,
      type: "circle",
      source: sourceId(def.id),
      minzoom: def.minzoom || 0,
      layout: { visibility: visible },
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 3, 10, 7],
        "circle-color": "#f0a060",
        "circle-stroke-color": "#3a2018",
        "circle-stroke-width": 1,
        "circle-opacity": opacity,
      },
    });
  } else {
    map.setLayoutProperty(id, "visibility", visible);
    map.setPaintProperty(id, "circle-opacity", opacity);
  }
}

function syncOverlays(map) {
  for (const def of LAYER_DEFS) ensureOverlay(map, def);
}

function resolveLayerUrls(manifest) {
  const byId = new Map((manifest.layers || []).map((l) => [l.id, l]));
  for (const def of LAYER_DEFS) {
    if (def.source !== "edition") {
      if (def.sourceLabel) {
        state.layerInfo[def.id] = {
          sourceLabel: def.sourceLabel,
          sourceUrl: def.sourceUrl || "",
          fetchedAt: null,
          live: true,
        };
      }
      continue;
    }
    let found = null;
    for (const mid of def.manifestIds || []) {
      if (byId.has(mid)) {
        found = byId.get(mid);
        break;
      }
    }
    const version = found?.sha256 ? found.sha256.slice(0, 12) : "";
    state.layerUrls[def.id] = path(
      `/${found?.path || def.fallback}${version ? `?v=${version}` : ""}`
    );
    const record = sourceRecord(found);
    if (!found) continue;
    state.layerInfo[def.id] = {
      sourceLabel: record?.name || SOURCE_LABELS[record?.id] || "Hogback edition",
      sourceUrl: record?.url || "",
      fetchedAt: record?.fetchedAt || manifest.publishedAt || null,
      sourceUpdated: record?.sourceUpdated || null,
      featureCount: found.featureCount ?? null,
      edition: manifest.edition || null,
    };
  }
  state.edition = manifest.edition || "fallback";
  document.getElementById("edition-readout").textContent = state.edition;
}

async function loadLiveLayer(map, def) {
  if (!state.layerOn[def.id] || def.source !== "live") return;

  const env = mapEnvelope(map);
  const src = map.getSource(sourceId(def.id));
  if (!src) return;

  setLiveStatus(`loading ${def.name}…`);
  try {
    let data;
    if (def.live === "access-or") {
      data = await fetchGeoJSON(
        arcgisQueryUrl(OR_ACCESS, {
          envelope: env,
          outFields: "OBJECTID,NAME,Full_name,OpenAccess,Acres",
          maxAllowableOffset: 0.0008,
        })
      );
    } else if (def.live === "fire-perimeters") {
      data = await fetchGeoJSON(
        arcgisQueryUrl(`${WFIGS_BASE}/WFIGS_Interagency_Perimeters_Current/FeatureServer/0`, {
          envelope: env,
          maxAllowableOffset: 0.0007,
        })
      );
    } else if (def.live === "fire-points") {
      data = await fetchGeoJSON(
        arcgisQueryUrl(`${WFIGS_BASE}/WFIGS_Incident_Locations_Current/FeatureServer/0`, {
          envelope: env,
        })
      );
    } else if (def.live === "fire-historic") {
      const cutoff = new Date().getFullYear() - 10;
      data = await fetchGeoJSON(
        arcgisQueryUrl(
          `${WFIGS_BASE}/InterAgencyFirePerimeterHistory_All_Years_View/FeatureServer/0`,
          {
            envelope: env,
            where: `FIRE_YEAR >= ${cutoff}`,
            maxAllowableOffset: 0.0012,
          }
        )
      );
    }
    if (data) {
      src.setData(data);
      state.liveLoaded[def.id] = (data.features || []).length;
      setLiveStatus(`${def.name}: ${state.liveLoaded[def.id]}`);
    }
  } catch (err) {
    console.warn(def.id, err);
    setLiveStatus(`${def.name} failed`);
  }
}

function scheduleLiveRefresh(map) {
  clearTimeout(liveTimer);
  liveTimer = setTimeout(() => {
    const liveOn = LAYER_DEFS.filter((d) => d.source === "live" && state.layerOn[d.id]);
    if (!liveOn.length) {
      setLiveStatus("idle");
      return;
    }
    (async () => {
      for (const def of liveOn) {
        await loadLiveLayer(map, def);
      }
      if (liveOn.length > 1) setLiveStatus(`${liveOn.length} live layers`);
    })();
  }, 450);
}

function renderBasemapSeg(map) {
  const root = document.getElementById("basemap-seg");
  root.innerHTML = "";
  for (const b of BASEMAPS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = b.label;
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", String(state.basemap === b.id));
    if (b.pmtiles && !state.fieldPmtilesUrl) btn.disabled = true;
    btn.addEventListener("click", () => {
      state.basemap = b.id;
      renderBasemapSeg(map);
      applyBasemap(map);
    });
    root.appendChild(btn);
  }
}

function makeLayerRow(map, def) {
  const li = document.createElement("li");
  li.className = "layer-item";
  if (def.disabled) li.style.opacity = "0.55";

  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = !!state.layerOn[def.id];
  check.disabled = !!def.disabled;
  check.style.accentColor = def.swatch;
  check.addEventListener("change", () => {
    state.layerOn[def.id] = check.checked;
    ensureOverlay(map, def);
    if (def.source === "live") {
      if (check.checked) loadLiveLayer(map, def);
      else setLiveStatus("idle");
    }
  });

  const text = document.createElement("label");
  text.style.cursor = def.disabled ? "default" : "pointer";
  const n = document.createElement("span");
  n.className = "name";
  n.textContent = def.name;
  const m = document.createElement("span");
  m.className = "meta";
  const hint = document.createElement("span");
  hint.textContent = def.meta;
  m.appendChild(hint);
  const info = state.layerInfo[def.id];
  const provenance = info?.live
    ? `${info.sourceLabel} · live`
    : provenanceText(info);
  if (provenance) {
    const src = document.createElement(info?.sourceUrl ? "a" : "span");
    src.className = "src";
    src.textContent = provenance;
    if (info?.sourceUrl) {
      src.href = info.sourceUrl;
      src.target = "_blank";
      src.rel = "noreferrer";
      src.title = info.sourceUrl;
      src.addEventListener("click", (ev) => ev.stopPropagation());
    }
    m.appendChild(src);
  }
  text.append(n, m);
  if (!def.disabled) {
    text.addEventListener("click", (ev) => {
      ev.preventDefault();
      check.checked = !check.checked;
      check.dispatchEvent(new Event("change"));
    });
  }

  if (def.disabled) {
    li.append(check, text);
    return li;
  }

  const range = document.createElement("input");
  range.type = "range";
  range.min = "0.15";
  range.max = "1";
  range.step = "0.05";
  range.value = String(state.layerOpacity[def.id] ?? 1);
  range.title = "Opacity";
  range.addEventListener("input", () => {
    state.layerOpacity[def.id] = Number(range.value);
    ensureOverlay(map, def);
  });

  li.append(check, text, range);
  return li;
}

function renderLayerStacks(map) {
  const root = document.getElementById("layer-stacks");
  root.innerHTML = "";

  for (const stack of STACKS) {
    const section = document.createElement("section");
    section.className = "stack";
    section.dataset.stack = stack.id;

    const head = document.createElement("div");
    head.className = "stack-head";
    const titles = document.createElement("div");
    const h = document.createElement("h3");
    h.className = "stack-title";
    h.textContent = stack.title;
    const hint = document.createElement("p");
    hint.className = "stack-hint";
    hint.textContent = stack.hint;
    titles.append(h, hint);
    head.appendChild(titles);
    section.appendChild(head);

    const list = document.createElement("ul");
    list.className = "layer-list";
    for (const def of LAYER_DEFS.filter((d) => d.stack === stack.id)) {
      list.appendChild(makeLayerRow(map, def));
    }
    section.appendChild(list);

    if (stack.id === "fires") {
      const actions = document.createElement("div");
      actions.className = "stack-actions";
      const refresh = document.createElement("button");
      refresh.type = "button";
      refresh.textContent = "Refresh fire layers";
      refresh.addEventListener("click", () => {
        for (const def of LAYER_DEFS.filter((d) => d.stack === "fires" && state.layerOn[d.id])) {
          loadLiveLayer(map, def);
        }
      });
      actions.appendChild(refresh);
      section.appendChild(actions);
    }

    if (stack.id === "private") {
      const actions = document.createElement("div");
      actions.className = "stack-actions";
      const refresh = document.createElement("button");
      refresh.type = "button";
      refresh.textContent = "Refresh access for view";
      refresh.addEventListener("click", () => {
        const def = LAYER_DEFS.find((d) => d.id === "access-or");
        if (def && state.layerOn[def.id]) loadLiveLayer(map, def);
      });
      actions.appendChild(refresh);
      section.appendChild(actions);
    }

    root.appendChild(section);
  }
}

function renderPacks(map, catalog) {
  const root = document.getElementById("pack-list");
  const packages = catalog.packages || [];
  if (!packages.length) {
    root.innerHTML =
      '<p class="hint">Catalog is empty. After a Field bake, <code>publish_mapbase.py</code> fills this list.</p>';
    state.fieldPmtilesUrl = null;
    return;
  }

  root.innerHTML = "";
  for (const pkg of packages) {
    const el = document.createElement("div");
    el.className = "pack";
    const title = document.createElement("strong");
    title.textContent = pkg.title || pkg.id;
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = [
      pkg.kind,
      `z${pkg.minZoom}–${pkg.maxZoom}`,
      pkg.washBaked ? "wash baked" : null,
      pkg.status,
    ]
      .filter(Boolean)
      .join(" · ");
    el.append(title, meta);

    if (pkg.pmtilesUrl) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Use as Field basemap";
      btn.addEventListener("click", () => {
        state.fieldPmtilesUrl = pkg.pmtilesUrl;
        state.basemap = "field";
        renderBasemapSeg(map);
        applyBasemap(map);
        if (pkg.envelope) {
          map.fitBounds(
            [
              [pkg.envelope.west, pkg.envelope.south],
              [pkg.envelope.east, pkg.envelope.north],
            ],
            { padding: 48, duration: 800 }
          );
        }
      });
      el.appendChild(btn);
      if (!state.fieldPmtilesUrl) state.fieldPmtilesUrl = pkg.pmtilesUrl;
    }
    root.appendChild(el);
  }
}

function updateReadout(map) {
  const z = map.getZoom();
  const c = map.getCenter();
  document.getElementById("zoom-readout").textContent = z.toFixed(2);
  document.getElementById("center-readout").textContent =
    `${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`;
}

function inspectableLayerIds(map) {
  return LAYER_DEFS.flatMap((d) => [fillId(d.id), lineId(d.id), circleId(d.id)]).filter((id) =>
    map.getLayer(id)
  );
}

function wireInspect(map) {
  const box = document.getElementById("inspect");
  const body = document.getElementById("inspect-body");
  document.getElementById("inspect-close").addEventListener("click", () => {
    box.hidden = true;
  });

  map.on("click", (e) => {
    const hits = map.queryRenderedFeatures(e.point, { layers: inspectableLayerIds(map) });
    if (!hits.length) {
      box.hidden = true;
      return;
    }
    const f = hits[0];
    const p = f.properties || {};
    const title =
      p.name ||
      p.NAME ||
      p.Full_name ||
      p.IncidentName ||
      p.attr_IncidentName ||
      p.poly_IncidentName ||
      p.unit ||
      p.id ||
      f.layer.id;
    const rows = Object.entries(p)
      .filter(([k]) => !["bbox"].includes(k))
      .slice(0, 14)
      .map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(String(v))}</dd>`)
      .join("");
    const def = LAYER_DEFS.find(
      (d) => f.layer.id === fillId(d.id) || f.layer.id === lineId(d.id) || f.layer.id === circleId(d.id)
    );
    const info = def ? state.layerInfo[def.id] : null;
    const from = provenanceText(info);
    const sourceLine = from
      ? `<p class="inspect-source">${escapeHtml(from)}</p>`
      : "";
    body.innerHTML = `<h3>${escapeHtml(String(title))}</h3>${sourceLine}<dl>${rows}</dl>`;
    box.hidden = false;
  });

  map.on("mousemove", (e) => {
    const hits = map.queryRenderedFeatures(e.point, { layers: inspectableLayerIds(map) });
    map.getCanvas().style.cursor = hits.length ? "pointer" : "";
  });
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function boot() {
  registerPmtiles();

  // MapLibre needs a visible container — auth gate reveals #app first.
  const map = new maplibregl.Map({
    container: "map",
    style: emptyStyle(),
    center: [OR_CENTER.lng, OR_CENTER.lat],
    zoom: 6.2,
    maxPitch: 0,
    attributionControl: true,
  });
  mapRef = map;
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), "top-right");
  map.addControl(new maplibregl.ScaleControl({ unit: "imperial" }), "bottom-left");

  // Force resize after gate → app reveal.
  requestAnimationFrame(() => map.resize());
  setTimeout(() => map.resize(), 50);

  document.getElementById("panel-toggle").addEventListener("click", () => {
    document.getElementById("panel").classList.toggle("open");
  });
  document.getElementById("btn-fit-or").addEventListener("click", () => {
    map.fitBounds(OR_BOUNDS, { padding: 40, duration: 700 });
  });

  map.on("move", () => updateReadout(map));
  map.on("moveend", () => scheduleLiveRefresh(map));

  map.on("load", async () => {
    updateReadout(map);
    map.resize();

    // Basemap UI + tiles must load even when catalog/manifest are missing.
    renderBasemapSeg(map);
    renderLayerStacks(map);
    applyBasemap(map);
    wireInspect(map);

    const [manifest, catalog] = await Promise.all([
      fetchJson(path("/latest/manifest.json"), { layers: [] }),
      fetchJson(path("/geo/mapbase/v1/catalog.json"), {
        version: 1,
        packages: [],
        notes: "Catalog not published yet",
      }),
    ]);

    resolveLayerUrls(manifest);
    renderLayerStacks(map);
    renderPacks(map, catalog);
    syncOverlays(map);

    const firstPack = (catalog.packages || [])[0];
    if (firstPack?.envelope) {
      map.fitBounds(
        [
          [firstPack.envelope.west, firstPack.envelope.south],
          [firstPack.envelope.east, firstPack.envelope.north],
        ],
        { padding: 48, duration: 0 }
      );
    } else {
      map.fitBounds(WASCO_BOUNDS, { padding: 56, duration: 0 });
    }
  });
}

let adminStarted = false;
function startAdmin() {
  if (adminStarted) return;
  adminStarted = true;
  boot().catch((err) => {
    adminStarted = false;
    console.error(err);
    const hint = document.getElementById("basemap-hint");
    if (hint) {
      hint.textContent = `Failed to start: ${err.message || err}`;
      hint.className = "hint warn";
    }
  });
}

window.addEventListener("hogback-admin-ready", startAdmin);
// Embed under /geo-map/ has no auth-gate — parent RequireAdmin already authenticated.
if (!document.getElementById("auth-gate")) startAdmin();
