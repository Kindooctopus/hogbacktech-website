"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Map as LeafletMap, TileLayer, TileLayerOptions, WMSOptions } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  defaultDateForLayer,
  defaultMapCenter,
  defaultMapZoom,
  gibsTileUrl,
  gibsWmsUrl,
  referenceLayerId,
  satelliteLayers,
  type SatelliteLayer,
} from "@/lib/satellite";

const imageryAttribution =
  'Imagery <a href="https://earthdata.nasa.gov/gibs">NASA GIBS</a>';

function wmtsOptions(layer: SatelliteLayer): TileLayerOptions {
  return {
    attribution: imageryAttribution,
    bounds: [
      [-85.0511, -180],
      [85.0511, 180],
    ],
    minZoom: 1,
    maxNativeZoom: layer.maxNativeZoom,
    maxZoom: 9,
    opacity: 1,
    crossOrigin: true,
  };
}

export function SatelliteMap() {
  const mapId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const baseRef = useRef<TileLayer | null>(null);
  const overlayRef = useRef<TileLayer | null>(null);

  const [layerId, setLayerId] = useState(satelliteLayers[0].id);
  const layer = satelliteLayers.find((l) => l.id === layerId) ?? satelliteLayers[0];
  const [date, setDate] = useState(() => defaultDateForLayer(satelliteLayers[0]));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const L = await import("leaflet");

      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: defaultMapCenter,
        zoom: defaultMapZoom,
        minZoom: 2,
        maxZoom: 9,
        worldCopyJump: true,
        attributionControl: true,
      });

      map.attributionControl.setPrefix(false);
      mapRef.current = map;
      setReady(true);
    }

    void init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        baseRef.current = null;
        overlayRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;

    let cancelled = false;

    async function applyLayer(selected: SatelliteLayer, time: string) {
      const L = await import("leaflet");
      if (cancelled || !mapRef.current) return;

      if (baseRef.current) {
        mapRef.current.removeLayer(baseRef.current);
        baseRef.current = null;
      }
      if (overlayRef.current) {
        mapRef.current.removeLayer(overlayRef.current);
        overlayRef.current = null;
      }

      const reference =
        satelliteLayers.find((l) => l.id === referenceLayerId) ?? satelliteLayers[0];

      // True color stays underneath every other feed. GIBS returns an empty
      // response where a pass has no tile, and a keyed street basemap used to
      // show through as "API key required".
      if (selected.id !== reference.id) {
        const under = L.tileLayer(gibsTileUrl(reference, time), wmtsOptions(reference));
        under.addTo(mapRef.current);
        baseRef.current = under;
      }

      if (selected.service === "wms") {
        const overlay = L.tileLayer.wms(gibsWmsUrl, {
          layers: selected.gibsLayer,
          styles: "",
          format: "image/png",
          transparent: true,
          version: "1.1.1",
          uppercase: true,
          time,
          opacity: 1,
          attribution: imageryAttribution,
        } as WMSOptions);
        overlay.addTo(mapRef.current);
        overlayRef.current = overlay;
      } else {
        const tiles = L.tileLayer(gibsTileUrl(selected, time), wmtsOptions(selected));
        tiles.addTo(mapRef.current);
        overlayRef.current = tiles;
      }

      mapRef.current.setMaxZoom(9);
    }

    void applyLayer(layer, date);

    return () => {
      cancelled = true;
    };
  }, [ready, layer, date]);

  function onLayerChange(nextId: string) {
    const next = satelliteLayers.find((l) => l.id === nextId) ?? satelliteLayers[0];
    setLayerId(next.id);
    setDate(defaultDateForLayer(next));
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-end gap-3 border-b border-khaki/25 bg-dusk px-4 py-3 sm:gap-4 sm:px-6">
        <label className="flex min-w-[10rem] flex-1 flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-sage sm:max-w-xs">
          Layer
          <select
            value={layerId}
            onChange={(e) => onLayerChange(e.target.value)}
            className="rounded-md border border-khaki/40 bg-[#1c1914] px-3 py-2 font-sans text-sm normal-case tracking-normal text-bone outline-none focus:border-khaki"
          >
            {satelliteLayers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-sage">
          Imagery date (UTC)
          <input
            type="date"
            value={date}
            max={defaultDateForLayer({ ...layer, defaultLagDays: 0 })}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border border-khaki/40 bg-[#1c1914] px-3 py-2 font-sans text-sm normal-case tracking-normal text-bone outline-none focus:border-khaki"
          />
        </label>

        <p className="hidden max-w-md flex-[2] text-xs leading-relaxed text-sage md:block">
          {layer.description}
        </p>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={containerRef}
          id={`hogback-sat-map-${mapId}`}
          className="absolute inset-0 z-0 bg-dusk"
        />
        {!ready && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-dusk text-sm text-sage">
            Loading satellite map…
          </div>
        )}
      </div>
    </div>
  );
}
