"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Map as LeafletMap, TileLayer } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  defaultDateForLayer,
  defaultMapCenter,
  defaultMapZoom,
  gibsTileUrl,
  satelliteLayers,
  type SatelliteLayer,
} from "@/lib/satellite";

export function SatelliteMap() {
  const mapId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileRef = useRef<TileLayer | null>(null);

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
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      setReady(true);
    }

    void init();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        tileRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;

    let cancelled = false;

    async function applyLayer(selected: SatelliteLayer, time: string) {
      const L = await import("leaflet");
      if (cancelled || !mapRef.current) return;

      if (tileRef.current) {
        mapRef.current.removeLayer(tileRef.current);
        tileRef.current = null;
      }

      const tiles = L.tileLayer(gibsTileUrl(selected, time), {
        attribution:
          'Imagery <a href="https://earthdata.nasa.gov/gibs">NASA GIBS</a>',
        bounds: [
          [-85.0511, -180],
          [85.0511, 180],
        ],
        minZoom: 1,
        maxNativeZoom: selected.maxNativeZoom,
        maxZoom: 9,
        opacity: 0.92,
        crossOrigin: true,
      });

      tiles.addTo(mapRef.current);
      tileRef.current = tiles;
      mapRef.current.setMaxZoom(Math.max(9, selected.maxNativeZoom));
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
      <div className="flex flex-wrap items-end gap-3 border-b border-white/10 bg-navy-900/80 px-4 py-3 backdrop-blur-sm sm:gap-4 sm:px-6">
        <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-xs text-slate-400 sm:max-w-xs">
          Layer
          <select
            value={layerId}
            onChange={(e) => onLayerChange(e.target.value)}
            className="rounded-lg border border-white/10 bg-navy-950 px-3 py-2 text-sm text-white outline-none focus:border-copper-500"
          >
            {satelliteLayers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-slate-400">
          Imagery date (UTC)
          <input
            type="date"
            value={date}
            max={defaultDateForLayer({ ...layer, defaultLagDays: 0 })}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-white/10 bg-navy-950 px-3 py-2 text-sm text-white outline-none focus:border-copper-500"
          />
        </label>

        <p className="hidden max-w-md flex-[2] text-xs leading-relaxed text-slate-500 md:block">
          {layer.description}
        </p>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={containerRef}
          id={`hogback-sat-map-${mapId}`}
          className="absolute inset-0 z-0 bg-navy-950"
        />
        {!ready && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-navy-950 text-sm text-slate-400">
            Loading satellite map…
          </div>
        )}
      </div>
    </div>
  );
}
