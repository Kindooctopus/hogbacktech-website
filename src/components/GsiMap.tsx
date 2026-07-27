"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type {
  FeatureGroup,
  GeoJSON as LeafletGeoJSON,
  Map as LeafletMap,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  defaultMapCenter,
  defaultMapZoom,
  escapeHtml,
  evacuationStyle,
  formatAcres,
  formatEpoch,
  formatPercent,
  gsiOverlays,
  hotshotStyle,
  overlayQueryUrls,
  type GsiOverlayId,
} from "@/lib/gsiLayers";

type LayerStatus = "idle" | "loading" | "ready" | "error";

type OverlayState = Record<
  GsiOverlayId,
  { enabled: boolean; status: LayerStatus; count: number; error?: string }
>;

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

  // hotshots
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

export function GsiMap() {
  const mapId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const groupsRef = useRef<Partial<Record<GsiOverlayId, FeatureGroup>>>({});
  const [ready, setReady] = useState(false);
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

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

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
        groupsRef.current = {};
      }
    };
  }, []);

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

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-end gap-3 border-b border-white/10 bg-navy-900/80 px-4 py-3 backdrop-blur-sm sm:gap-4 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {gsiOverlays.map((overlay) => {
            const state = overlayState[overlay.id];
            const active = state.enabled;
            return (
              <button
                key={overlay.id}
                type="button"
                onClick={() => toggleOverlay(overlay.id)}
                aria-pressed={active}
                title={overlay.description}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                  active
                    ? "border-copper-500/60 bg-copper-500/15 text-white"
                    : "border-white/10 bg-navy-950 text-slate-400 hover:border-white/20 hover:text-slate-200"
                }`}
              >
                <span className="block font-medium">{overlay.shortName}</span>
                <span className="mt-0.5 block text-[11px] text-slate-500">
                  {state.status === "loading" && "Loading…"}
                  {state.status === "ready" &&
                    `${state.count.toLocaleString()} features`}
                  {state.status === "error" && "Error"}
                  {state.status === "idle" && "—"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          {lastRefresh && (
            <p className="hidden text-xs text-slate-500 sm:block">
              Updated {lastRefresh.toLocaleTimeString()}
            </p>
          )}
          <button
            type="button"
            onClick={refresh}
            className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/5"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="border-b border-white/5 bg-navy-950/60 px-4 py-2 sm:px-6">
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            NIFC incidents
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-3 rounded-sm bg-orange-500/50 ring-1 ring-red-500" />
            Fire perimeters
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-3 rounded-sm bg-red-600/70" />
            Evac order
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
            Fire AVL
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            Hotshot / IHC
          </span>
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
