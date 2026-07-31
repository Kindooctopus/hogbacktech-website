"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  runMapSearch,
  type MapSearchResult,
} from "@/lib/mapSearch";
import type { ArTarget, LatLng } from "@/lib/geoNav";

type MapSearchBoxProps = {
  targets: ArTarget[];
  bias: LatLng | null;
  onSelect: (result: MapSearchResult) => void;
  onLocateMe?: () => void;
  locating?: boolean;
  hasLocation?: boolean;
};

const KIND_LABEL: Record<MapSearchResult["kind"], string> = {
  fire: "Fire",
  place: "Place",
  address: "Address",
  resource: "Resource",
};

export function MapSearchBox({
  targets,
  bias,
  onSelect,
  onLocateMe,
  locating = false,
  hasLocation = false,
}: MapSearchBoxProps) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MapSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const next = await runMapSearch(q, targets, bias ?? undefined);
          if (cancelled) return;
          setResults(next);
          setOpen(true);
          if (next.length === 0) setError("No matches");
        } catch {
          if (cancelled) return;
          setResults([]);
          setError("Search failed");
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, targets, bias]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function choose(result: MapSearchResult) {
    setQuery(result.label);
    setOpen(false);
    onSelect(result);
  }

  return (
    <div className="relative min-w-0 flex-1" ref={wrapRef}>
      <div className="flex gap-2">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search fires, addresses, places</span>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              if (results.length || query.trim().length >= 2) setOpen(true);
            }}
            placeholder="Search fires, addresses, places…"
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            className="w-full rounded-md border border-white/15 bg-navy-950 px-3 py-1.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-copper-500/50"
          />
          {loading && (
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-500">
              …
            </span>
          )}
        </label>
        {onLocateMe && (
          <button
            type="button"
            onClick={onLocateMe}
            title="Show my location"
            aria-label="Show my location"
            className={`shrink-0 rounded-md border px-2.5 py-1.5 text-sm ${
              hasLocation
                ? "border-sky-400/40 bg-sky-500/15 text-sky-300"
                : "border-white/15 text-white hover:bg-white/5"
            }`}
          >
            {locating ? "…" : "My location"}
          </button>
        )}
      </div>

      {open && (results.length > 0 || error) && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-40 mt-1 max-h-72 overflow-auto rounded-lg border border-white/10 bg-navy-900 py-1 shadow-xl shadow-black/40"
        >
          {results.map((result) => (
            <li key={result.id} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => choose(result)}
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-white/5"
              >
                <span className="mt-0.5 shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {KIND_LABEL[result.kind]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-white">
                    {result.label}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                    {result.detail}
                  </span>
                </span>
              </button>
            </li>
          ))}
          {results.length === 0 && error && (
            <li className="px-3 py-2 text-xs text-slate-500">{error}</li>
          )}
        </ul>
      )}
    </div>
  );
}
