"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type {
  CircleMarker,
  FeatureGroup,
  GeoJSON as LeafletGeoJSON,
  Map as LeafletMap,
  Polygon,
  TileLayer,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  CompassArView,
  readCompassHeading,
  requestOrientationPermission,
  type HoldMode,
} from "@/components/CompassArView";
import { MapSearchBox } from "@/components/MapSearchBox";
import {
  featureDisplayName,
  flashlightSector,
  type ArTarget,
  type LatLng,
} from "@/lib/geoNav";
import type { MapSearchResult } from "@/lib/mapSearch";
import {
  defaultBasemapId,
  defaultMapCenter,
  defaultMapZoom,
  escapeHtml,
  evacuationStyle,
  formatAcres,
  formatEpoch,
  formatFrp,
  formatHoursOld,
  formatPercent,
  getBasemap,
  getOverlayQueryUrl,
  gsiBasemaps,
  gsiOverlays,
  heatPointStyle,
  hotshotStyle,
  isViewportOverlay,
  oesEngineTypeLabel,
  placeDisplayName,
  viewportOverlayIds,
  type GsiBasemapId,
  type GsiOverlayId,
  type MapBBox,
} from "@/lib/gsiLayers";
import {
  fetchSurfaceWindGeoJSON,
  formatWindFrom,
  formatWindSpeed,
  windFlowDurationSec,
  windShaftLengthPx,
  windSpeedColor,
  windSpeedLegendGradient,
  windStyle,
} from "@/lib/surfaceWind";

type LayerStatus = "idle" | "loading" | "ready" | "error";

type OverlayState = Record<
  GsiOverlayId,
  { enabled: boolean; status: LayerStatus; count: number; error?: string }
>;

const LEGEND_ITEMS: { color: string; shape: "dot" | "rect" | "fire"; label: string }[] =
  [
    { color: "text-orange-400", shape: "fire", label: "Active fires" },
    {
      color: "bg-orange-500/50 ring-1 ring-red-500",
      shape: "rect",
      label: "Fire perimeters",
    },
    { color: "bg-red-600/70", shape: "rect", label: "Evac order" },
    { color: "bg-red-500", shape: "dot", label: "OES engines" },
    { color: "bg-amber-400", shape: "dot", label: "Fleet AVL" },
    { color: "bg-green-500", shape: "dot", label: "Hotshot / IHC" },
    { color: "bg-emerald-400", shape: "dot", label: "Assigned crews" },
    { color: "bg-sky-400", shape: "dot", label: "Air bases" },
    { color: "bg-rose-400", shape: "dot", label: "VIIRS heat" },
    { color: "bg-orange-500", shape: "dot", label: "MODIS heat" },
    { color: "bg-yellow-300", shape: "dot", label: "Landsat heat" },
    { color: "bg-white", shape: "dot", label: "City / community" },
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

function targetsFromGeoJSON(
  id: GsiOverlayId,
  geojson: GeoJSON.FeatureCollection,
): ArTarget[] {
  // Dense grids would flood the AR compass — skip them.
  if (id === "wind" || id === "places") return [];

  const overlay = gsiOverlays.find((o) => o.id === id);
  const kind = overlay?.shortName ?? id;
  const targets: ArTarget[] = [];

  geojson.features?.forEach((feature, index) => {
    const geometry = feature.geometry;
    if (!geometry) return;

    let lat: number | null = null;
    let lng: number | null = null;

    if (geometry.type === "Point") {
      lng = geometry.coordinates[0];
      lat = geometry.coordinates[1];
    } else if (geometry.type === "MultiPoint" && geometry.coordinates[0]) {
      lng = geometry.coordinates[0][0];
      lat = geometry.coordinates[0][1];
    } else if (
      geometry.type === "Polygon" &&
      geometry.coordinates[0]?.length
    ) {
      const ring = geometry.coordinates[0];
      let x = 0;
      let y = 0;
      for (const [px, py] of ring) {
        x += px;
        y += py;
      }
      lng = x / ring.length;
      lat = y / ring.length;
    }

    if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }
    if (Math.abs(lat) < 0.01 && Math.abs(lng) < 0.01) return;

    const props = (feature.properties ?? {}) as Record<string, unknown>;
    targets.push({
      id: `${id}-${index}`,
      name: featureDisplayName(props, kind),
      kind,
      lat,
      lng,
    });
  });

  return targets;
}

function fireMarkerIcon(L: typeof import("leaflet")) {
  return L.divIcon({
    className: "hogback-map-symbol",
    html: `<span class="hogback-fire-symbol" title="Fire" aria-hidden="true">
      <svg viewBox="0 0 32 40" width="28" height="34" xmlns="http://www.w3.org/2000/svg">
        <path fill="#ea580c" stroke="#7c2d12" stroke-width="1.2" d="M16 2c1.2 6.5-4.5 9.5-4.8 15.2 0 1.8.6 3.4 1.7 4.7-3.3-1.4-5.6-4.7-5.6-8.6C7.3 7.8 12.2 3.6 16 2zm0 36c-6.4 0-11.5-5-11.5-12.2 0-4.8 2.4-8.2 5.2-11.3 1.2 4.6 4.8 7.2 4.8 11.5 0 .9.7 1.6 1.5 1.6s1.5-.7 1.5-1.6c0-4.8 4.1-7.6 5.2-12.4 3.4 3.2 6.3 7 6.3 12.2C27.5 33 22.4 38 16 38z"/>
        <path fill="#fbbf24" d="M16 22.5c.7 2.2-.8 3.5-1 5.4.1.7.5 1.2 1 1.6-.9-.3-1.7-1.2-1.7-2.6 0-1.7 1.1-3 1.7-4.4z"/>
      </svg>
    </span>`,
    iconSize: [28, 34],
    iconAnchor: [14, 32],
    popupAnchor: [0, -28],
  });
}

function windMarkerIcon(
  L: typeof import("leaflet"),
  props: Record<string, unknown>,
) {
  const speed = Number(props.speedMph);
  const toDeg = Number(props.toDeg);
  const color = windSpeedColor(speed);
  const shaft = windShaftLengthPx(speed);
  const duration = windFlowDurationSec(speed);
  // Line-only marker: animated strokes traveling in the blow-to direction.
  const box = Math.max(28, shaft + 10);
  const cx = box / 2;
  const cy = box / 2;
  const half = shaft / 2;
  const y1 = cy + half;
  const y2 = cy - half;
  const rotate = Number.isFinite(toDeg) ? toDeg : 0;
  const strokeW = Math.max(1.5, Math.min(2.75, 1.4 + (Number.isFinite(speed) ? speed : 0) * 0.03));

  return L.divIcon({
    className: "hogback-map-symbol hogback-wind-symbol",
    html: `<div class="hogback-wind-marker" style="width:${box}px;height:${box}px;--wind-color:${color};--wind-duration:${duration}s;--wind-drift:${Math.max(4, Math.min(10, half * 0.45))}px" title="${escapeHtml(formatWindSpeed(speed))} from ${escapeHtml(formatWindFrom(props.fromDeg))}">
      <div class="hogback-wind-shaft" style="width:${box}px;height:${box}px;transform:rotate(${rotate}deg)">
        <svg viewBox="0 0 ${box} ${box}" width="${box}" height="${box}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <line class="hogback-wind-ghost" x1="${cx}" y1="${y1}" x2="${cx}" y2="${y2}" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round" opacity="0.28"/>
          <line class="hogback-wind-flow" x1="${cx}" y1="${y1}" x2="${cx}" y2="${y2}" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round"/>
        </svg>
      </div>
    </div>`,
    iconSize: [box, box],
    iconAnchor: [box / 2, box / 2],
    popupAnchor: [0, -(box / 2)],
  });
}

function engineMarkerIcon(
  L: typeof import("leaflet"),
  fill = "#ef4444",
  label = "E",
) {
  return L.divIcon({
    className: "hogback-map-symbol",
    html: `<span class="hogback-engine-symbol" style="--engine-fill:${fill}" title="Engine" aria-hidden="true">
      <svg viewBox="0 0 34 24" width="30" height="22" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="7" width="24" height="11" rx="2" fill="var(--engine-fill)" stroke="#7f1d1d" stroke-width="1.2"/>
        <path d="M25 10h5l3 4v4h-8z" fill="var(--engine-fill)" stroke="#7f1d1d" stroke-width="1.2"/>
        <circle cx="9" cy="19" r="3" fill="#111827" stroke="#f8fafc" stroke-width="1"/>
        <circle cx="24" cy="19" r="3" fill="#111827" stroke="#f8fafc" stroke-width="1"/>
        <text x="13" y="15" text-anchor="middle" font-size="8" font-weight="700" fill="#fff" font-family="system-ui,sans-serif">${label}</text>
      </svg>
    </span>`,
    iconSize: [30, 22],
    iconAnchor: [15, 18],
    popupAnchor: [0, -14],
  });
}

function resourceDotIcon(
  L: typeof import("leaflet"),
  fill: string,
  stroke: string,
  label?: string,
) {
  const text = label
    ? `<text x="12" y="16" text-anchor="middle" font-size="9" font-weight="700" fill="#fff" font-family="system-ui,sans-serif">${label}</text>`
    : "";
  return L.divIcon({
    className: "hogback-map-symbol",
    html: `<span class="hogback-resource-symbol" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        ${text}
      </svg>
    </span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -10],
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
  const typeLabel = oesEngineTypeLabel(props.Type);
  return `
    <div style="min-width:200px;font-family:system-ui,sans-serif;font-size:12px;line-height:1.4">
      <div style="font-weight:600;color:#fff;margin-bottom:4px">OES ${escapeHtml(unit)}</div>
      <div style="display:inline-block;margin-bottom:6px;padding:2px 8px;border-radius:999px;background:#ef444433;color:#fca5a5;font-size:11px;font-weight:600">${escapeHtml(typeLabel)}</div>
      <table style="border-collapse:collapse">${[
        popupRow("Assignee", escapeHtml(props.ASSIGNEE || "—")),
        popupRow("Op area", escapeHtml(props.OP_AREA || "—")),
        popupRow("Region", escapeHtml(props.REG || "—")),
        popupRow("Location", escapeHtml(props.LOCATION || "—")),
      ].join("")}</table>
    </div>`;
}

function fleetAvlPopup(props: Record<string, unknown>): string {
  const unit =
    props.Description || props.DeviceID || props.Model || "OES apparatus";
  const vehicle = [props.Year, props.Make, props.Model]
    .filter(Boolean)
    .join(" ");
  return `
    <div style="min-width:220px;font-family:system-ui,sans-serif;font-size:12px;line-height:1.4">
      <div style="font-weight:600;color:#fff;margin-bottom:4px">${escapeHtml(unit)}</div>
      <div style="display:inline-block;margin-bottom:6px;padding:2px 8px;border-radius:999px;background:#f59e0b33;color:#fcd34d;font-size:11px;font-weight:600">Fleet AVL</div>
      <table style="border-collapse:collapse">${[
        popupRow("Vehicle", escapeHtml(vehicle || "—")),
        popupRow("Type", escapeHtml(props.AssetType_Description || "—")),
        popupRow(
          "Location",
          escapeHtml(
            props.Position_Address ||
              [props.Position_City, props.Position_Province]
                .filter(Boolean)
                .join(", ") ||
              "—",
          ),
        ),
        popupRow("Updated", escapeHtml(props.LastUpdatedTimeStamp || "—")),
        popupRow("Speed", escapeHtml(
          props.Position_Speed != null && props.Position_Speed !== ""
            ? `${props.Position_Speed}`
            : "—",
        )),
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

function crewPopup(props: Record<string, unknown>): string {
  const name = props.Assignment_Name || props.Catalog_Item || "Wildland crew";
  return `
    <div style="min-width:220px;font-family:system-ui,sans-serif;font-size:12px;line-height:1.4">
      <div style="font-weight:600;color:#fff;margin-bottom:4px">${escapeHtml(name)}</div>
      <div style="display:inline-block;margin-bottom:6px;padding:2px 8px;border-radius:999px;background:#34d39933;color:#6ee7b7;font-size:11px;font-weight:600">${escapeHtml(props.Request_Status || "Assigned")}</div>
      <table style="border-collapse:collapse">${[
        popupRow("Catalog", escapeHtml(props.Catalog_Item || "—")),
        popupRow("Incident", escapeHtml(props.Incident_Name || "—")),
        popupRow("Incident #", escapeHtml(props.Incident_Number || "—")),
        popupRow("Request #", escapeHtml(props.Request_Number || "—")),
        popupRow("Agency", escapeHtml(props.Abbreviation || "—")),
        popupRow("Mob start", formatEpoch(props.Mob_Start)),
      ].join("")}</table>
    </div>`;
}

function aircraftBasePopup(props: Record<string, unknown>): string {
  const name = props.Airport || props.Designator || "Fire aircraft base";
  return `
    <div style="min-width:220px;font-family:system-ui,sans-serif;font-size:12px;line-height:1.4">
      <div style="font-weight:600;color:#fff;margin-bottom:4px">${escapeHtml(name)}</div>
      <div style="display:inline-block;margin-bottom:6px;padding:2px 8px;border-radius:999px;background:#38bdf833;color:#7dd3fc;font-size:11px;font-weight:600">${escapeHtml(props.Base_Type || "Aircraft base")}</div>
      <table style="border-collapse:collapse">${[
        popupRow("Designator", escapeHtml(props.Designator || "—")),
        popupRow("State", escapeHtml(props.State || "—")),
        popupRow("Agency", escapeHtml(props.Agency || "—")),
        popupRow("Category", escapeHtml(props.Category || "—")),
        popupRow("Fuel", escapeHtml(props.Fuel || "—")),
        popupRow("Runway", escapeHtml(props.Runway || "—")),
        popupRow("Contact", escapeHtml(props.Contact || "—")),
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

function windPopup(props: Record<string, unknown>): string {
  const style = windStyle(props.speedMph);
  const color = windSpeedColor(props.speedMph);
  return `
    <div style="min-width:200px;font-family:system-ui,sans-serif;font-size:12px;line-height:1.4">
      <div style="font-weight:600;color:#fff;margin-bottom:4px">Surface wind</div>
      <div style="display:inline-block;margin-bottom:6px;padding:2px 8px;border-radius:999px;background:${color}33;color:${color};font-size:11px;font-weight:600">${escapeHtml(style.label)} · ${escapeHtml(formatWindSpeed(props.speedMph))}</div>
      <div style="margin:0 0 8px;height:8px;border-radius:999px;background:${windSpeedLegendGradient};border:1px solid rgba(255,255,255,0.15)"></div>
      <div style="display:flex;justify-content:space-between;margin:-4px 0 8px;font-size:9px;color:#94a3b8"><span>0</span><span>15</span><span>30</span><span>50+ mph</span></div>
      <table style="border-collapse:collapse">${[
        popupRow("Speed", formatWindSpeed(props.speedMph)),
        popupRow("From", formatWindFrom(props.fromDeg)),
        popupRow(
          "Gusts",
          props.gustMph == null ? "—" : formatWindSpeed(props.gustMph),
        ),
        popupRow("Height", "10 m AGL"),
        popupRow("Source", "Open-Meteo"),
      ].join("")}</table>
    </div>`;
}

function placePopup(props: Record<string, unknown>): string {
  const name = placeDisplayName(props.gaz_name);
  return `
    <div style="min-width:180px;font-family:system-ui,sans-serif;font-size:12px;line-height:1.4">
      <div style="font-weight:600;color:#fff;margin-bottom:4px">${escapeHtml(name)}</div>
      <div style="display:inline-block;margin-bottom:6px;padding:2px 8px;border-radius:999px;background:#e2e8f033;color:#e2e8f0;font-size:11px;font-weight:600">Community</div>
      <table style="border-collapse:collapse">${[
        popupRow("State", escapeHtml(props.state_alpha || "—")),
        popupRow("County", escapeHtml(props.county_name || "—")),
        popupRow("Type", escapeHtml(props.gaz_featureclass || "—")),
        popupRow("Source", "USGS GNIS"),
      ].join("")}</table>
    </div>`;
}

function placeLabelIcon(
  L: typeof import("leaflet"),
  props: Record<string, unknown>,
) {
  const name = placeDisplayName(props.gaz_name);
  return L.divIcon({
    className: "hogback-map-symbol hogback-place-symbol",
    html: `<span class="hogback-place-label" title="${escapeHtml(name)}">${escapeHtml(name)}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -8],
  });
}

/** Collapse USGS MultiPoint place geometries to a single label point. */
function normalizePlaceGeoJSON(
  geojson: GeoJSON.FeatureCollection,
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];
  for (const feature of geojson.features ?? []) {
    const geometry = feature.geometry;
    if (!geometry) continue;

    if (geometry.type === "Point") {
      features.push(feature);
      continue;
    }

    if (geometry.type === "MultiPoint" && geometry.coordinates.length > 0) {
      let x = 0;
      let y = 0;
      for (const [lng, lat] of geometry.coordinates) {
        x += lng;
        y += lat;
      }
      const n = geometry.coordinates.length;
      features.push({
        ...feature,
        geometry: {
          type: "Point",
          coordinates: [x / n, y / n],
        },
      });
    }
  }
  return { type: "FeatureCollection", features };
}

function heatPopup(
  props: Record<string, unknown>,
  sensor: "viirs" | "modis" | "landsat",
): string {
  const label =
    sensor === "viirs" ? "VIIRS" : sensor === "modis" ? "MODIS" : "Landsat";
  const brightness =
    props.bright_ti4 ?? props.BRIGHTNESS ?? props.brightness ?? "—";
  const frp = props.frp ?? props.FRP;
  const confidence = props.confidence ?? props.CONFIDENCE ?? "—";
  const satellite = props.satellite ?? props.SATELLITE ?? "—";
  const daynight = props.daynight ?? props.DAYNIGHT ?? "—";
  const hours = props.hours_old ?? props.HOURS_OLD;
  const acq = props.acq_date ?? props.ACQ_DATE;
  return `
    <div style="min-width:210px;font-family:system-ui,sans-serif;font-size:12px;line-height:1.4">
      <div style="font-weight:600;color:#fff;margin-bottom:4px">${label} heat signature</div>
      <div style="display:inline-block;margin-bottom:6px;padding:2px 8px;border-radius:999px;background:#fb718533;color:#fda4af;font-size:11px;font-weight:600">Thermal hotspot</div>
      <table style="border-collapse:collapse">${[
        popupRow("Satellite", escapeHtml(satellite)),
        popupRow("Brightness", escapeHtml(brightness)),
        popupRow("FRP", formatFrp(frp)),
        popupRow("Confidence", escapeHtml(confidence)),
        popupRow("Day/Night", escapeHtml(daynight)),
        popupRow("Age", formatHoursOld(hours)),
        popupRow("Acquired", formatEpoch(acq)),
        sensor === "landsat"
          ? popupRow(
              "Path/Row",
              escapeHtml(
                [props.path, props.row].filter(Boolean).join(" / ") || "—",
              ),
            )
          : "",
      ]
        .filter(Boolean)
        .join("")}</table>
    </div>`;
}

function mapBoundsToBBox(map: LeafletMap): MapBBox {
  const b = map.getBounds();
  return {
    west: b.getWest(),
    south: b.getSouth(),
    east: b.getEast(),
    north: b.getNorth(),
  };
}

async function buildOverlayLayer(
  L: typeof import("leaflet"),
  id: GsiOverlayId,
  geojson: GeoJSON.FeatureCollection,
): Promise<LeafletGeoJSON> {
  if (id === "incidents") {
    const icon = fireMarkerIcon(L);
    return L.geoJSON(geojson, {
      pointToLayer(_feature, latlng) {
        return L.marker(latlng, { icon, riseOnHover: true });
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
    const type1 = engineMarkerIcon(L, "#ef4444", "E1");
    const type3 = engineMarkerIcon(L, "#f97316", "E3");
    const hazmat = engineMarkerIcon(L, "#a855f7", "HZ");
    return L.geoJSON(geojson, {
      pointToLayer(feature, latlng) {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        const type = String(props.Type ?? "");
        const icon =
          type === "3" ? type3 : /hazmat/i.test(type) ? hazmat : type1;
        return L.marker(latlng, { icon, riseOnHover: true });
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

  if (id === "fleetAvl") {
    const icon = engineMarkerIcon(L, "#f59e0b", "AVL");
    return L.geoJSON(geojson, {
      pointToLayer(_feature, latlng) {
        return L.marker(latlng, { icon, riseOnHover: true });
      },
      onEachFeature(feature, lyr) {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        lyr.bindPopup(fleetAvlPopup(props), {
          className: "hogback-gsi-popup",
          maxWidth: 320,
        });
      },
    });
  }

  if (id === "hotshots") {
    const available = resourceDotIcon(L, "#22c55e", "#166534", "HS");
    const assigned = resourceDotIcon(L, "#ef4444", "#991b1b", "HS");
    const other = resourceDotIcon(L, "#38bdf8", "#0369a1", "HS");
    return L.geoJSON(geojson, {
      pointToLayer(feature, latlng) {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        const s = hotshotStyle(props.resource_status);
        const icon =
          s.fill === "#ef4444"
            ? assigned
            : s.fill === "#22c55e"
              ? available
              : other;
        return L.marker(latlng, { icon, riseOnHover: true });
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

  if (id === "crews") {
    const atIncident = resourceDotIcon(L, "#34d399", "#047857", "C");
    const staging = resourceDotIcon(L, "#2dd4bf", "#0f766e", "C");
    return L.geoJSON(geojson, {
      pointToLayer(feature, latlng) {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        const status = String(props.Request_Status ?? "");
        const icon = /incident/i.test(status) ? atIncident : staging;
        return L.marker(latlng, { icon, riseOnHover: true });
      },
      onEachFeature(feature, lyr) {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        lyr.bindPopup(crewPopup(props), {
          className: "hogback-gsi-popup",
          maxWidth: 320,
        });
      },
    });
  }

  if (id === "aircraftBases") {
    const icon = resourceDotIcon(L, "#38bdf8", "#0369a1", "A");
    return L.geoJSON(geojson, {
      pointToLayer(_feature, latlng) {
        return L.marker(latlng, { icon, riseOnHover: true });
      },
      onEachFeature(feature, lyr) {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        lyr.bindPopup(aircraftBasePopup(props), {
          className: "hogback-gsi-popup",
          maxWidth: 300,
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

  if (id === "usfsFire") {
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

  if (id === "viirs" || id === "modis" || id === "landsat") {
    const sensor = id;
    return L.geoJSON(geojson, {
      pointToLayer(feature, latlng) {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        const frp = props.frp ?? props.FRP;
        const s = heatPointStyle(frp, sensor);
        return L.circleMarker(latlng, {
          radius: s.radius,
          color: s.stroke,
          weight: 1,
          opacity: 0.35,
          fillColor: s.fill,
          fillOpacity: 0.22,
        });
      },
      onEachFeature(feature, lyr) {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        lyr.bindPopup(heatPopup(props, sensor), {
          className: "hogback-gsi-popup",
          maxWidth: 300,
        });
      },
    });
  }

  if (id === "wind") {
    return L.geoJSON(geojson, {
      pointToLayer(feature, latlng) {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        return L.marker(latlng, {
          icon: windMarkerIcon(L, props),
          interactive: true,
          keyboard: false,
          zIndexOffset: 400,
        });
      },
      onEachFeature(feature, lyr) {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        lyr.bindPopup(windPopup(props), {
          className: "hogback-gsi-popup",
          maxWidth: 280,
        });
      },
    });
  }

  if (id === "places") {
    const places = normalizePlaceGeoJSON(geojson);
    return L.geoJSON(places, {
      pointToLayer(feature, latlng) {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        return L.marker(latlng, {
          icon: placeLabelIcon(L, props),
          interactive: true,
          keyboard: false,
          zIndexOffset: 250,
        });
      },
      onEachFeature(feature, lyr) {
        const props = (feature.properties ?? {}) as Record<string, unknown>;
        lyr.bindPopup(placePopup(props), {
          className: "hogback-gsi-popup",
          maxWidth: 260,
        });
      },
    });
  }

  return L.geoJSON(geojson);
}

export function GsiMap() {
  const mapId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const basemapLayerRef = useRef<TileLayer | null>(null);
  const groupsRef = useRef<Partial<Record<GsiOverlayId, FeatureGroup>>>({});
  const featuresRef = useRef<Partial<Record<GsiOverlayId, ArTarget[]>>>({});
  const userMarkerRef = useRef<CircleMarker | null>(null);
  const searchMarkerRef = useRef<CircleMarker | null>(null);
  const flashlightRef = useRef<Polygon | null>(null);
  const layersMenuRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [basemapId, setBasemapId] = useState<GsiBasemapId>(defaultBasemapId);
  const [layersOpen, setLayersOpen] = useState(false);
  const [arOpen, setArOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [headingAccuracy, setHeadingAccuracy] = useState<number | null>(null);
  const [holdMode, setHoldMode] = useState<HoldMode>("upright");
  const [holdModeLocked, setHoldModeLocked] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [didCenterOnUser, setDidCenterOnUser] = useState(false);
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

  const [targetsVersion, setTargetsVersion] = useState(0);

  const arTargets = useMemo(() => {
    const list: ArTarget[] = [];
    for (const overlay of gsiOverlays) {
      if (!overlayState[overlay.id]?.enabled) continue;
      const items = featuresRef.current[overlay.id];
      if (items?.length) list.push(...items);
    }
    return list;
    // targetsVersion bumps after overlay GeoJSON loads into featuresRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlayState, targetsVersion]);

  const allSearchTargets = useMemo(() => {
    const list: ArTarget[] = [];
    for (const overlay of gsiOverlays) {
      const items = featuresRef.current[overlay.id];
      if (items?.length) list.push(...items);
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetsVersion]);

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
        featuresRef.current = {};
        userMarkerRef.current = null;
        searchMarkerRef.current = null;
        flashlightRef.current = null;
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
    let moveTimer: ReturnType<typeof setTimeout> | null = null;
    const map = mapRef.current;

    async function loadOverlay(id: GsiOverlayId, bbox?: MapBBox | null) {
      const L = await import("leaflet");
      const group = groupsRef.current[id];
      if (!group || cancelled) return;

      setLayerMeta(id, { status: "loading", error: undefined });

      try {
        let geojson: GeoJSON.FeatureCollection;
        if (id === "wind") {
          const bounds = bbox ?? mapBoundsToBBox(map);
          geojson = await fetchSurfaceWindGeoJSON(bounds, map.getZoom());
        } else {
          const res = await fetch(getOverlayQueryUrl(id, bbox));
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          geojson = (await res.json()) as GeoJSON.FeatureCollection;
          if (id === "places") geojson = normalizePlaceGeoJSON(geojson);
        }
        if (cancelled) return;

        group.clearLayers();
        const layer = await buildOverlayLayer(L, id, geojson);
        layer.addTo(group);
        featuresRef.current[id] = targetsFromGeoJSON(id, geojson);
        setLayerMeta(id, {
          status: "ready",
          count: geojson.features?.length ?? 0,
        });
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Failed to load layer";
        featuresRef.current[id] = [];
        setLayerMeta(id, { status: "error", error: message, count: 0 });
      }
    }

    async function loadAll() {
      const bbox = mapBoundsToBBox(map);
      await Promise.all(
        gsiOverlays.map((o) =>
          loadOverlay(o.id, isViewportOverlay(o.id) ? bbox : null),
        ),
      );
      if (!cancelled) {
        setLastRefresh(new Date());
        setTargetsVersion((n) => n + 1);
      }
    }

    function reloadViewportLayers() {
      const bbox = mapBoundsToBBox(map);
      void Promise.all(
        viewportOverlayIds.map((id) => loadOverlay(id, bbox)),
      ).then(() => {
        if (!cancelled) setTargetsVersion((n) => n + 1);
      });
    }

    function onMoveEnd() {
      if (moveTimer) clearTimeout(moveTimer);
      moveTimer = setTimeout(() => {
        reloadViewportLayers();
      }, 450);
    }

    void loadAll();
    map.on("moveend", onMoveEnd);

    return () => {
      cancelled = true;
      map.off("moveend", onMoveEnd);
      if (moveTimer) clearTimeout(moveTimer);
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

  useEffect(() => {
    if (!ready) return;

    if (!navigator.geolocation) {
      setLocationError("GPS is not available in this browser.");
      return;
    }

    setLocating(true);
    setLocationError(null);
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
        setLocationError(null);
      },
      (err) => {
        setLocating(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied — tap My location to try again."
            : err.message || "Unable to read GPS location.",
        );
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [ready]);

  useEffect(() => {
    if (!arOpen) return;

    function onOrientation(event: DeviceOrientationEvent) {
      const reading = readCompassHeading(event);
      if (!reading) return;
      setHeading(reading.heading);
      setHeadingAccuracy(reading.accuracy);
      if (!holdModeLocked) setHoldMode(reading.holdMode);
    }

    window.addEventListener("deviceorientationabsolute", onOrientation, true);
    window.addEventListener("deviceorientation", onOrientation, true);
    return () => {
      window.removeEventListener(
        "deviceorientationabsolute",
        onOrientation,
        true,
      );
      window.removeEventListener("deviceorientation", onOrientation, true);
    };
  }, [arOpen, holdModeLocked]);

  useEffect(() => {
    if (!ready || !mapRef.current || !userLocation) return;

    const loc = userLocation;
    const currentHeading = heading;
    const showBeam = arOpen && currentHeading != null;
    let cancelled = false;

    async function drawUserAndBeam() {
      const L = await import("leaflet");
      const map = mapRef.current;
      if (!map || cancelled) return;

      if (!userMarkerRef.current) {
        userMarkerRef.current = L.circleMarker([loc.lat, loc.lng], {
          radius: 8,
          color: "#ffffff",
          weight: 3,
          fillColor: "#3b82f6",
          fillOpacity: 1,
        })
          .bindTooltip("You are here", {
            permanent: false,
            direction: "top",
            className: "hogback-gsi-popup",
          })
          .addTo(map);
      } else {
        userMarkerRef.current.setLatLng([loc.lat, loc.lng]);
        if (!map.hasLayer(userMarkerRef.current)) {
          userMarkerRef.current.addTo(map);
        }
      }

      if (!didCenterOnUser) {
        map.flyTo([loc.lat, loc.lng], Math.max(map.getZoom(), 11), {
          animate: true,
          duration: 0.9,
        });
        setDidCenterOnUser(true);
      }

      if (!showBeam) {
        if (flashlightRef.current) {
          map.removeLayer(flashlightRef.current);
          flashlightRef.current = null;
        }
        return;
      }

      const ring = flashlightSector(loc, currentHeading!, 8000, 18);
      if (!flashlightRef.current) {
        flashlightRef.current = L.polygon(ring, {
          color: "#f59e0b",
          weight: 1,
          fillColor: "#f59e0b",
          fillOpacity: 0.18,
          interactive: false,
        }).addTo(map);
      } else {
        flashlightRef.current.setLatLngs(ring);
        if (!map.hasLayer(flashlightRef.current)) {
          flashlightRef.current.addTo(map);
        }
      }
    }

    void drawUserAndBeam();

    return () => {
      cancelled = true;
    };
  }, [ready, userLocation, heading, arOpen, didCenterOnUser]);

  useEffect(() => {
    if (arOpen) return;
    const map = mapRef.current;
    if (!map) return;
    if (flashlightRef.current) {
      map.removeLayer(flashlightRef.current);
      flashlightRef.current = null;
    }
  }, [arOpen]);

  function toggleOverlay(id: GsiOverlayId) {
    const map = mapRef.current;
    const group = groupsRef.current[id];
    if (!map || !group) return;

    setOverlayState((prev) => {
      const nextEnabled = !prev[id].enabled;
      if (nextEnabled) {
        group.addTo(map);
        if (isViewportOverlay(id)) {
          const bbox = mapBoundsToBBox(map);
          void (async () => {
            const L = await import("leaflet");
            setLayerMeta(id, { status: "loading", error: undefined });
            try {
              let geojson: GeoJSON.FeatureCollection;
              if (id === "wind") {
                geojson = await fetchSurfaceWindGeoJSON(bbox, map.getZoom());
              } else {
                const res = await fetch(getOverlayQueryUrl(id, bbox));
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                geojson = (await res.json()) as GeoJSON.FeatureCollection;
                if (id === "places") geojson = normalizePlaceGeoJSON(geojson);
              }
              group.clearLayers();
              const layer = await buildOverlayLayer(L, id, geojson);
              layer.addTo(group);
              featuresRef.current[id] = targetsFromGeoJSON(id, geojson);
              setLayerMeta(id, {
                status: "ready",
                count: geojson.features?.length ?? 0,
              });
              setTargetsVersion((n) => n + 1);
            } catch (err) {
              const message =
                err instanceof Error ? err.message : "Failed to load layer";
              featuresRef.current[id] = [];
              setLayerMeta(id, { status: "error", error: message, count: 0 });
            }
          })();
        }
      } else {
        map.removeLayer(group);
      }
      return {
        ...prev,
        [id]: { ...prev[id], enabled: nextEnabled },
      };
    });
  }

  function refresh() {
    setRefreshToken((n) => n + 1);
  }

  function locateMe() {
    setLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocating(false);
      setLocationError("GPS is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(loc);
        setLocating(false);
        const map = mapRef.current;
        if (map) {
          map.flyTo([loc.lat, loc.lng], Math.max(map.getZoom(), 13), {
            animate: true,
            duration: 0.8,
          });
        }
      },
      (err) => {
        setLocating(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Enable location for this site in browser settings."
            : err.message || "Unable to read GPS location.",
        );
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  }

  async function goToSearchResult(result: MapSearchResult) {
    const map = mapRef.current;
    if (!map) return;

    const L = await import("leaflet");
    map.flyTo([result.lat, result.lng], result.kind === "fire" ? 11 : 13, {
      animate: true,
      duration: 0.85,
    });

    if (searchMarkerRef.current) {
      map.removeLayer(searchMarkerRef.current);
    }
    searchMarkerRef.current = L.circleMarker([result.lat, result.lng], {
      radius: 9,
      color: "#fbbf24",
      weight: 2,
      fillColor: result.kind === "fire" ? "#ea580c" : "#22d3ee",
      fillOpacity: 0.95,
    })
      .bindPopup(
        `<div style="min-width:160px;font-family:system-ui,sans-serif;font-size:12px;color:#e2e8f0">
          <div style="font-weight:600;color:#fff;margin-bottom:4px">${result.label.replace(/</g, "&lt;")}</div>
          <div style="color:#94a3b8">${result.detail.replace(/</g, "&lt;")}</div>
        </div>`,
        { className: "hogback-gsi-popup", maxWidth: 260 },
      )
      .addTo(map)
      .openPopup();
  }

  async function openAr() {
    setLayersOpen(false);
    setHoldModeLocked(false);
    const allowed = await requestOrientationPermission();
    if (!allowed) {
      setLocationError(
        "Motion/compass permission denied — you can still set heading manually.",
      );
    }
    if (!heading) setHeading(0);
    if (!userLocation) locateMe();
    setArOpen(true);
  }

  const enabledCount = gsiOverlays.filter(
    (o) => overlayState[o.id].enabled,
  ).length;
  const activeBasemap = getBasemap(basemapId);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="relative z-20 flex flex-wrap items-center gap-2 border-b border-white/10 bg-navy-900/80 px-3 py-2 backdrop-blur-sm sm:gap-3 sm:px-4">
        <label className="flex shrink-0 items-center gap-2 text-xs text-slate-400">
          <span className="font-medium uppercase tracking-wider text-slate-500">
            Map
          </span>
          <select
            value={basemapId}
            onChange={(e) => setBasemapId(e.target.value as GsiBasemapId)}
            title={activeBasemap.description}
            aria-label="Basemap style"
            className="min-w-[7.5rem] rounded-md border border-white/15 bg-navy-950 px-2.5 py-1.5 text-sm text-white outline-none focus:border-copper-500/50"
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
              className="absolute left-0 top-full z-30 mt-1 flex max-h-[min(70dvh,32rem)] w-[min(100vw-1.5rem,22rem)] flex-col overflow-hidden rounded-lg border border-white/10 bg-navy-900 shadow-xl shadow-black/40"
            >
              <div className="border-b border-white/10 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-copper-400">
                  Scroll for all layers
                </p>
                <p className="text-[11px] text-slate-500">
                  Surface Wind &amp; Cities are near the top
                </p>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
                {gsiOverlays.map((overlay) => {
                  const state = overlayState[overlay.id];
                  const active = state.enabled;
                  const emphasize =
                    overlay.id === "wind" || overlay.id === "places";
                  return (
                    <label
                      key={overlay.id}
                      className={`flex cursor-pointer items-start gap-2.5 px-3 py-2 text-sm hover:bg-white/5 ${
                        emphasize ? "bg-copper-500/10" : ""
                      }`}
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
              </div>

              <div className="border-t border-white/10 px-3 py-2">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Legend
                </p>
                <div className="mb-2">
                  <p className="mb-1 text-[11px] text-slate-400">
                    Surface wind (mph)
                  </p>
                  <div
                    className="h-2 rounded-full border border-white/15"
                    style={{ background: windSpeedLegendGradient }}
                    aria-hidden
                  />
                  <div className="mt-0.5 flex justify-between text-[9px] text-slate-500">
                    <span>0</span>
                    <span>15</span>
                    <span>30</span>
                    <span>50+</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-400">
                  {LEGEND_ITEMS.map((item) => (
                    <span
                      key={item.label}
                      className="inline-flex items-center gap-1.5"
                    >
                      {item.shape === "fire" ? (
                        <span
                          className="inline-flex h-3 w-2.5 shrink-0 items-center justify-center"
                          aria-hidden
                        >
                          <svg
                            viewBox="0 0 32 40"
                            width="10"
                            height="12"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill="#ea580c"
                              d="M16 2c1.2 6.5-4.5 9.5-4.8 15.2 0 1.8.6 3.4 1.7 4.7-3.3-1.4-5.6-4.7-5.6-8.6C7.3 7.8 12.2 3.6 16 2zm0 36c-6.4 0-11.5-5-11.5-12.2 0-4.8 2.4-8.2 5.2-11.3 1.2 4.6 4.8 7.2 4.8 11.5 0 .9.7 1.6 1.5 1.6s1.5-.7 1.5-1.6c0-4.8 4.1-7.6 5.2-12.4 3.4 3.2 6.3 7 6.3 12.2C27.5 33 22.4 38 16 38z"
                            />
                          </svg>
                        </span>
                      ) : (
                        <span
                          className={
                            item.shape === "dot"
                              ? `h-2 w-2 shrink-0 rounded-full ${item.color}`
                              : `h-2 w-2.5 shrink-0 rounded-sm ${item.color}`
                          }
                        />
                      )}
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <MapSearchBox
          targets={allSearchTargets}
          bias={userLocation}
          onSelect={(result) => void goToSearchResult(result)}
          onLocateMe={locateMe}
          locating={locating}
          hasLocation={Boolean(userLocation)}
        />

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {lastRefresh && (
            <p className="hidden text-xs text-slate-500 lg:block">
              Updated {lastRefresh.toLocaleTimeString()}
            </p>
          )}
          <button
            type="button"
            onClick={() => void openAr()}
            className={`rounded-md border px-2.5 py-1.5 text-sm ${
              arOpen
                ? "border-copper-500/60 bg-copper-500/20 text-copper-300"
                : "border-white/15 text-white hover:bg-white/5"
            }`}
            title="Open AR compass with direction flashlight"
          >
            AR Compass
          </button>
          <button
            type="button"
            onClick={refresh}
            className="rounded-md border border-white/15 px-2.5 py-1.5 text-sm text-white hover:bg-white/5"
          >
            Refresh
          </button>
        </div>
      </div>

      {locationError && (
        <p className="border-b border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-200">
          {locationError}
        </p>
      )}

      <div className="relative min-h-0 flex-1">
        <div
          ref={containerRef}
          id={`hogback-gsi-map-${mapId}`}
          className="absolute inset-0 z-0 bg-navy-950"
        />
        {!ready && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-navy-950 text-sm text-slate-400">
            Loading Geo map…
          </div>
        )}
        {ready && !userLocation && !locationError && (
          <div className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-md border border-white/10 bg-navy-950/80 px-2.5 py-1.5 text-[11px] text-slate-300 backdrop-blur-sm">
            Getting your location…
          </div>
        )}
        <CompassArView
          open={arOpen}
          onClose={() => {
            setArOpen(false);
            setHoldModeLocked(false);
          }}
          userLocation={userLocation}
          heading={heading}
          headingAccuracy={headingAccuracy}
          holdMode={holdMode}
          onHoldModeChange={(mode) => {
            setHoldMode(mode);
            setHoldModeLocked(true);
          }}
          targets={arTargets}
          onManualHeading={setHeading}
        />
      </div>
    </div>
  );
}
