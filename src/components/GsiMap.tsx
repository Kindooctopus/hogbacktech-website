"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type {
  FeatureGroup,
  GeoJSON as LeafletGeoJSON,
  Map as LeafletMap,
  TileLayer,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  defaultBasemapId,
  defaultMapCenter,
  defaultMapZoom,
  escapeHtml,
  evacuationStyle,
  formatAcres,
  formatEpoch,
  formatPercent,
  getBasemap,
  gsiBasemaps,
  gsiOverlays,
  hotshotStyle,
  overlayQueryUrls,
  type GsiBasemapId,
  type GsiOverlayId,
} from "@/lib/gsiLayers";

type LayerStatus = "idle" | "loading" | "ready" | "error";

type OverlayState = Record<
  GsiOverlayId,
  { enabled: boolean; status: LayerStatus; count: number; error?: string }
>;

const LEGEND_ITEMS: { color: string; shape: "dot" | "rect"; label: string }[] =
  [
    { color: "bg-orange-500", shape: "dot", label: "NIFC incidents" },
    {
      color: "bg-orange-500/50 ring-1 ring-red-500",
      shape: "rect",
      label: "Fire perimeters",
    },
    { color: "bg-red-600/70", shape: "rect", label: "Evac order" },
    { color: "bg-cyan-400", shape: "dot", label: "Fire AVL" },
    { color: "bg-green-500", shape: "dot", label: "Hotshot / IHC" },
    { color: "bg-lime-400", shape: "dot", label: "ODF units" },
    { color: "bg-lime-600", shape: "dot", label: "USFS OR offices" },
    { color: "bg-yellow-500", shape: "dot", label: "USFS fire facilities" },
  ];

function initialOverlayState(): OverlayState {
  return Object.fromEntries(
    gsiOverlays.map((o) => [
      o.id,
      {
        enabled: o.defaultOn,
        status: "idle" as LayerStatus,
        count: 0,
      },
    ]),
  ) as OverlayState;
}

function createBasemapLayer(
  L: typeof import("leaflet"),
  id: GsiBasemapId,
): TileLayer {
  const basemap = getBasemap(id);
  return L.tileLayer(basemap.url, {
    attribution: basemap.attribution,
    maxZoom: basemap.maxZoom,
    ...(basemap.subdomains ? { subdomains: basemap.subdomains } : {}),
  });
}

function popupRow(label: string, value: string): string {
  return `<tr><th style="text-align:left;padding:2px 10px 2px 0;color:#94a3b8;font-weight:500;white-space:nowrap">${label}</th><td style="padding:2px 0;color:#e2e8f0">${value}</td></tr>`;
}

function incidentPopup(props: Record<string, unknown>): string {
  const name = escapeHtml(props.IncidentName || "Unnamed incident");
  return `
    <div style="min-width:200px;font-family:system-ui,sans-serif;font-size:12px;line-height:1.4">
      <div style="font-weight:600;color:#fff;margin-bottom:6px">${name}</div>
      <table style="border-collapse:collapse">${[
        popupRow("Type", escapeHtml(props.IncidentTypeCategory || "—")),
        popupRow(
          "Location",
          escapeHtml(
            [props.POOCounty, props.POOState].filter(Boolean).join(", ") || "—",
          ),
        ),
        popupRow("Size", formatAcres(props.IncidentSize)),
        popupRow("Contained", formatPercent(props.PercentContained)),
        popupRow("Cause", escapeHtml(props.FireCause || "—")),
        popupRow("Discovered", formatEpoch(props.FireDiscoveryDateTime)),
      ].join("")}</table>
    </div>`;
}

function perimeterPopup(props: Record<string, unknown>): string {
  const name = escapeHtml(
    props.poly_IncidentName || props.attr_IncidentName || "Unnamed perimeter",
  );
  return `
    <div style="min-width:200px;font-family:system-ui,sans-serif;font-size:12px;line-height:1.4">
      <div style="font-weight:600;color:#fff;margin-bottom:6px">${name}</div>
      <table style="border-collapse:collapse">${[
        popupRow(
          "Type",
          escapeHtml(props.attr_IncidentTypeCategory || "—"),
        ),
        popupRow(
          "Location",
          escapeHtml(
            [props.attr_POOCounty, props.attr_POOState]
              .filter(Boolean)
              .join(", ") || "—",
          ),
        ),
        popupRow(
          "GIS acres",
          formatAcres(props.poly_GISAcres ?? props.attr_IncidentSize),
        ),
        popupRow("Contained", formatPercent(props.attr_PercentContained)),
        popupRow("Discovered", formatEpoch(props.attr_FireDiscoveryDateTime)),
      ].join("")}</table>
    </div>`;
}

function evacuationPopup(props: Record<string, unknown>): string {
  const title =
    props.ZONE_NAME ||
    props.ZONE_ID ||
    props.CITY ||
    props.COUNTY ||
    "Evacuation zone";
  const style = evacuationStyle(props.STATUS);
  const info =
    props.CRITICAL_INFO || props.PUBLIC_INFO || props.NOTES || "";
  return `
    <div style="min-width:210px;font-family:system-ui,sans-serif;font-size:12px;line-height:1.4">
      <div style="font-weight:600;color:#fff;margin-bottom:4px">${escapeHtml(title)}</div>
      <div style="display:inline-block;margin-bottom:6px;padding:2px 8px;border-radius:999px;background:${style.fill}33;color:${style.fill};font-size:11px;font-weight:600">${escapeHtml(props.STATUS || style.label)}</div>
      <table style="border-collapse:collapse">${[
        popupRow(
          "Area",
          escapeHtml(
            [props.CITY, props.COUNTY].filter(Boolean).join(", ") || "—",
          ),
        ),
        popupRow("Event", escapeHtml(props.EVENT_TYPE || "—")),
        popupRow("Zone ID", escapeHtml(props.ZONE_ID || "—")),
      ].join("")}</table>
      ${
        info
          ? `<p style="margin:8px 0 0;color:#cbd5e1">${escapeHtml(info)}</p>`
          : ""
      }
    </div>`;
}

function avlPopup(props: Record<string, unknown>): string {
  const unit = props.UNIT__ || props.OES_ID__ || "Unit";
  return `
    <div style="min-width:200px;font-family:system-ui,sans-serif;font-size:12px;line-height:1.4">
      <div style="font-weight:600;color:#fff;margin-bottom:4px">AVL Unit ${escapeHtml(unit)}</div>
      <div style="display:inline-block;margin-bottom:6px;padding:2px 8px;border-radius:999px;background:#06b6d433;color:#67e8f9;font-size:11px;font-weight:600">Fire resource AVL</div>
      <table style="border-collapse:collapse">${[
        popupRow("Assignee", escapeHtml(props.ASSIGNEE || "—")),
        popupRow("Op area", escapeHtml(props.OP_AREA || "—")),
        popupRow("Region", escapeHtml(props.REG || "—")),
        popupRow("Type", escapeHtml(props.Type || "—")),
        popupRow("Location", escapeHtml(props.LOCATION || "—")),
      ].join("")}</table>
    </div>`;
}

function hotshotPopup(props: Record<string, unknown>): string {
  const name =
    props.resource_operational_name ||
    props.resource_name ||
    "Hotshot / IHC crew";
  const status = String(props.resource_status || "—");
  return `
    <div style="min-width:220px;font-family:system-ui,sans-serif;font-size:12px;line-height:1.4">
      <div style="font-weight:600;color:#fff;margin-bottom:4px">${escapeHtml(name)}</div>
      <div style="display:inline-block;margin-bottom:6px;padding:2px 8px;border-radius:999px;background:#22c55e33;color:#86efac;font-size:11px;font-weight:600">${escapeHtml(status)}</div>
      <table style="border-collapse:collapse">${[
        popupRow("Qualifications", escapeHtml(props.qualifications || "—")),
        popupRow("Incident", escapeHtml(props.incident_name || "—")),
        popupRow(
          "Assignment",
          escapeHtml(props.active_assignment || "—"),
        ),
        popupRow("Dispatch", escapeHtml(props.DispName || "—")),
        popupRow(
          "Available area",
          escapeHtml(props.available_area || "—"),
        ),
      ].join("")}</table>
    </div>`;
}

function odfUnitPopup(props: Record<string, unknown>): string {
  const name = props.OFFICENAME || "ODF office";
  return `
    <div style="min-width:200px;font-family:system-ui,sans-serif;font-size:12px;line-height:1.4">
      <div style="font-weight:600;color:#fff;margin-bottom:4px">${escapeHtml(name)}</div>
      <div style="display:inline-block;margin-bottom:6px;padding:2px 8px;border-radius:999px;background:#a3e63533;color:#bef264;font-size:11px;font-weight:600">ODF ${escapeHtml(props.OFFICETYPE || "Unit")}</div>
      <table style="border-collapse:collapse">${[
        popupRow("Type", escapeHtml(props.OFFICETYPE || "—")),
        popupRow("Area", escapeHtml(props.AREANAME || "—")),
      ].join("")}</table>
    </div>`;
}

function usfsOfficePopup(props: Record<string, unknown>): string {
  const name =
    props.district_name || props.name || props.forest_name || "USFS office";
  return `
    <div style="min-width:220px;font-family:system-ui,sans-serif;font-size:12px;line-height:1.4">
      <div style="font-weight:600;color:#fff;margin-bottom:4px">${escapeHtml(name)}</div>
      <div style="display:inline-block;margin-bottom:6px;padding:2px 8px;border-radius:999px;background:#84cc1633;color:#a3e635;font-size:11px;font-weight:600">USFS Oregon</div>
      <table style="border-collapse:collapse">${[
        popupRow("Forest", escapeHtml(props.forest_name || "—")),
        popupRow("Office", escapeHtml(props.name || "—")),
        popupRow(
          "Location",
          escapeHtml(
            [props.street, props.city, props.state].filter(Boolean).join(", ") ||
              "—",
          ),
        ),
        popupRow("Region", escapeHtml(props.region || "—")),
        popupRow("Phone", escapeHtml(props.phone || "—")),
      ].join("")}</table>
    </div>`;
}

function usfsFirePopup(props: Record<string, unknown>): string {
  const name = props.Station || props.Agency || "USFS fire facility";
  return `
    <div style="min-width:220px;font-family:system-ui,sans-serif;font-size:12px;line-height:1.4">
      <div style="font-weight:600;color:#fff;margin-bottom:4px">${escapeHtml(name)}</div>
      <div style="display:inline-block;margin-bottom:6px;padding:2px 8px;border-radius:999px;background:#eab30833;color:#fde047;font-size:11px;font-weight:600">USFS fire facility</div>
      <table style="border-collapse:collapse">${[
        popupRow("Agency", escapeHtml(props.Agency || "—")),
        popupRow("Type", escapeHtml(props.Facility_Type || "—")),
        popupRow("County", escapeHtml(props.County || "—")),
        popupRow("Address", escapeHtml(props.Physical_Address || "—")),
      ].join("")}</table>
    </div>`;
}

async function buildOverlayLayer(
  L: typeof import("leaflet"),
  id: GsiOverlayId,
  geojson: GeoJSON.FeatureCollection,
): Promise<LeafletGeoJSON> {
  if (id === "incidents") {
    return L.geoJSON(geojson, {
      pointToLayer(_feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 6,
          color: "#9a3412",
          weight: 1.5,
          fillColor: "#ea580c",
          fillOpacity: 0.9,
        });
      },
      onEachFeature(feature, lyr) {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        lyr.bindPopup(incidentPopup(props), {
          className: "hogback-gsi-popup",
          maxWidth: 280,
        });
      },
    });
  }

  if (id === "perimeters") {
    return L.geoJSON(geojson, {
      style: {
        color: "#ef4444",
        weight: 2,
        fillColor: "#f97316",
        fillOpacity: 0.35,
      },
      onEachFeature(feature, lyr) {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        lyr.bindPopup(perimeterPopup(props), {
          className: "hogback-gsi-popup",
          maxWidth: 280,
        });
      },
    });
  }

  if (id === "evacuations") {
    return L.geoJSON(geojson, {
      style(feature) {
        const props = (feature?.properties ?? {}) as Record<string, unknown>;
        const s = evacuationStyle(props.STATUS);
        return {
          color: s.stroke,
          weight: 2,
          fillColor: s.fill,
          fillOpacity: 0.4,
        };
      },
      onEachFeature(feature, lyr) {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        lyr.bindPopup(evacuationPopup(props), {
          className: "hogback-gsi-popup",
          maxWidth: 300,
        });
      },
    });
  }

  if (id === "avl") {
    return L.geoJSON(geojson, {
      pointToLayer(_feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 7,
          color: "#0e7490",
          weight: 2,
          fillColor: "#22d3ee",
          fillOpacity: 0.95,
        });
      },
      onEachFeature(feature, lyr) {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        lyr.bindPopup(avlPopup(props), {
          className: "hogback-gsi-popup",
          maxWidth: 300,
        });
      },
    });
  }

  if (id === "hotshots") {
    return L.geoJSON(geojson, {
      pointToLayer(feature, latlng) {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        const s = hotshotStyle(props.resource_status);
        return L.circleMarker(latlng, {
          radius: 8,
          color: s.stroke,
          weight: 2,
          fillColor: s.fill,
          fillOpacity: 0.95,
        });
      },
      onEachFeature(feature, lyr) {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        lyr.bindPopup(hotshotPopup(props), {
          className: "hogback-gsi-popup",
          maxWidth: 320,
        });
      },
    });
  }

  if (id === "odfUnits") {
    return L.geoJSON(geojson, {
      pointToLayer(_feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 7,
          color: "#3f6212",
          weight: 2,
          fillColor: "#a3e635",
          fillOpacity: 0.95,
        });
      },
      onEachFeature(feature, lyr) {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        lyr.bindPopup(odfUnitPopup(props), {
          className: "hogback-gsi-popup",
          maxWidth: 280,
        });
      },
    });
  }

  if (id === "usfsOr") {
    return L.geoJSON(geojson, {
      pointToLayer(_feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 6,
          color: "#365314",
          weight: 2,
          fillColor: "#84cc16",
          fillOpacity: 0.9,
        });
      },
      onEachFeature(feature, lyr) {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        lyr.bindPopup(usfsOfficePopup(props), {
          className: "hogback-gsi-popup",
          maxWidth: 320,
        });
      },
    });
  }

  // usfsFire
  return L.geoJSON(geojson, {
    pointToLayer(_feature, latlng) {
      return L.circleMarker(latlng, {
        radius: 8,
        color: "#a16207",
        weight: 2,
        fillColor: "#eab308",
        fillOpacity: 0.95,
      });
    },
    onEachFeature(feature, lyr) {
      const props = (feature.properties ?? {}) as Record<string, unknown>;
      lyr.bindPopup(usfsFirePopup(props), {
        className: "hogback-gsi-popup",
        maxWidth: 320,
      });
    },
  });
}

export function GsiMap() {
  const mapId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const basemapLayerRef = useRef<TileLayer | null>(null);
  const groupsRef = useRef<Partial<Record<GsiOverlayId, FeatureGroup>>>({});
  const layersMenuRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [basemapId, setBasemapId] = useState<GsiBasemapId>(defaultBasemapId);
  const [layersOpen, setLayersOpen] = useState(false);
  const [overlayState, setOverlayState] = useState<OverlayState>(
    initialOverlayState,
  );
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const setLayerMeta = useCallback(
    (
      id: GsiOverlayId,
      patch: Partial<OverlayState[GsiOverlayId]>,
    ) => {
      setOverlayState((prev) => ({
        ...prev,
        [id]: { ...prev[id], ...patch },
      }));
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: defaultMapCenter,
        zoom: defaultMapZoom,
        minZoom: 3,
        maxZoom: 18,
        worldCopyJump: true,
      });

      for (const overlay of gsiOverlays) {
        const group = L.featureGroup();
        groupsRef.current[overlay.id] = group;
        if (overlay.defaultOn) group.addTo(map);
      }

      mapRef.current = map;
      setReady(true);
    }

    void init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        basemapLayerRef.current = null;
        groupsRef.current = {};
      }
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;

    let cancelled = false;

    async function swapBasemap() {
      const L = await import("leaflet");
      const map = mapRef.current;
      if (!map || cancelled) return;

      const next = createBasemapLayer(L, basemapId);
      next.addTo(map);
      next.bringToBack();
      if (basemapLayerRef.current) {
        map.removeLayer(basemapLayerRef.current);
      }
      basemapLayerRef.current = next;
    }

    void swapBasemap();

    return () => {
      cancelled = true;
    };
  }, [basemapId, ready]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;

    let cancelled = false;

    async function loadOverlay(id: GsiOverlayId) {
      const L = await import("leaflet");
      const group = groupsRef.current[id];
      if (!group || cancelled) return;

      setLayerMeta(id, { status: "loading", error: undefined });

      try {
        const res = await fetch(overlayQueryUrls[id]);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const geojson = (await res.json()) as GeoJSON.FeatureCollection;
        if (cancelled) return;

        group.clearLayers();
        const layer = await buildOverlayLayer(L, id, geojson);
        layer.addTo(group);
        setLayerMeta(id, {
          status: "ready",
          count: geojson.features?.length ?? 0,
        });
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Failed to load layer";
        setLayerMeta(id, { status: "error", error: message, count: 0 });
      }
    }

    void (async () => {
      await Promise.all(gsiOverlays.map((o) => loadOverlay(o.id)));
      if (!cancelled) setLastRefresh(new Date());
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, refreshToken, setLayerMeta]);

  useEffect(() => {
    if (!layersOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (
        layersMenuRef.current &&
        !layersMenuRef.current.contains(event.target as Node)
      ) {
        setLayersOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLayersOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [layersOpen]);

  function toggleOverlay(id: GsiOverlayId) {
    const map = mapRef.current;
    const group = groupsRef.current[id];
    if (!map || !group) return;

    setOverlayState((prev) => {
      const nextEnabled = !prev[id].enabled;
      if (nextEnabled) group.addTo(map);
      else map.removeLayer(group);
      return {
        ...prev,
        [id]: { ...prev[id], enabled: nextEnabled },
      };
    });
  }

  function refresh() {
    setRefreshToken((n) => n + 1);
  }

  const enabledCount = gsiOverlays.filter(
    (o) => overlayState[o.id].enabled,
  ).length;
  const activeBasemap = getBasemap(basemapId);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="relative z-20 flex flex-wrap items-center gap-2 border-b border-white/10 bg-navy-900/80 px-3 py-2 backdrop-blur-sm sm:gap-3 sm:px-4">
        <label className="flex min-w-0 items-center gap-2 text-xs text-slate-400">
          <span className="shrink-0 font-medium uppercase tracking-wider text-slate-500">
            Map
          </span>
          <select
            value={basemapId}
            onChange={(e) => setBasemapId(e.target.value as GsiBasemapId)}
            title={activeBasemap.description}
            aria-label="Basemap style"
            className="min-w-[8.5rem] rounded-md border border-white/15 bg-navy-950 px-2.5 py-1.5 text-sm text-white outline-none focus:border-copper-500/50"
          >
            {gsiBasemaps.map((basemap) => (
              <option key={basemap.id} value={basemap.id}>
                {basemap.name}
              </option>
            ))}
          </select>
        </label>

        <div className="relative" ref={layersMenuRef}>
          <button
            type="button"
            onClick={() => setLayersOpen((open) => !open)}
            aria-expanded={layersOpen}
            aria-haspopup="listbox"
            className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-navy-950 px-2.5 py-1.5 text-sm text-white hover:border-white/25"
          >
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Layers
            </span>
            <span>
              {enabledCount}/{gsiOverlays.length}
            </span>
            <span className="text-slate-500" aria-hidden>
              ▾
            </span>
          </button>

          {layersOpen && (
            <div
              role="listbox"
              aria-label="Overlay filters"
              className="absolute left-0 top-full z-30 mt-1 w-[min(100vw-1.5rem,20rem)] rounded-lg border border-white/10 bg-navy-900 py-1 shadow-xl shadow-black/40"
            >
              {gsiOverlays.map((overlay) => {
                const state = overlayState[overlay.id];
                const active = state.enabled;
                return (
                  <label
                    key={overlay.id}
                    className="flex cursor-pointer items-start gap-2.5 px-3 py-2 text-sm hover:bg-white/5"
                    title={overlay.description}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleOverlay(overlay.id)}
                      className="mt-1 h-3.5 w-3.5 shrink-0 accent-copper-500"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-white">
                        {overlay.shortName}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-slate-500">
                        {state.status === "loading" && "Loading…"}
                        {state.status === "ready" &&
                          `${state.count.toLocaleString()} features`}
                        {state.status === "error" &&
                          (state.error || "Error")}
                        {state.status === "idle" && "—"}
                      </span>
                    </span>
                  </label>
                );
              })}

              <div className="mt-1 border-t border-white/10 px-3 py-2">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Legend
                </p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-400">
                  {LEGEND_ITEMS.map((item) => (
                    <span
                      key={item.label}
                      className="inline-flex items-center gap-1.5"
                    >
                      <span
                        className={
                          item.shape === "dot"
                            ? `h-2 w-2 shrink-0 rounded-full ${item.color}`
                            : `h-2 w-2.5 shrink-0 rounded-sm ${item.color}`
                        }
                      />
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2 sm:gap-3">
          {lastRefresh && (
            <p className="hidden text-xs text-slate-500 sm:block">
              Updated {lastRefresh.toLocaleTimeString()}
            </p>
          )}
          <button
            type="button"
            onClick={refresh}
            className="rounded-md border border-white/15 px-2.5 py-1.5 text-sm text-white hover:bg-white/5"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={containerRef}
          id={`hogback-gsi-map-${mapId}`}
          className="absolute inset-0 z-0 bg-navy-950"
        />
        {!ready && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-navy-950 text-sm text-slate-400">
            Loading GSI map…
          </div>
        )}
      </div>
    </div>
  );
}
