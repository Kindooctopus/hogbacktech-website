"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  bearingDegrees,
  cardinalFromHeading,
  distanceMeters,
  formatDistance,
  normalizeDegrees,
  shortestAngleDelta,
  type ArTarget,
  type LatLng,
} from "@/lib/geoNav";

type CompassArViewProps = {
  open: boolean;
  onClose: () => void;
  userLocation: LatLng | null;
  heading: number | null;
  headingAccuracy: number | null;
  targets: ArTarget[];
  onManualHeading?: (degrees: number) => void;
};

const BEAM_HALF_ANGLE = 18;

type DeviceOrientationEventiOS = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
};

export function CompassArView({
  open,
  onClose,
  userLocation,
  heading,
  headingAccuracy,
  targets,
  onManualHeading,
}: CompassArViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    if (!open) return;

    let stream: MediaStream | null = null;
    let cancelled = false;
    const videoEl = videoRef.current;

    async function startCamera() {
      setCameraError(null);
      setCameraReady(false);
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera not available in this browser.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
          setCameraReady(true);
        }
      } catch {
        setCameraError(
          "Camera permission denied — compass flashlight still works.",
        );
      }
    }

    void startCamera();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      if (videoEl) videoEl.srcObject = null;
    };
  }, [open]);

  const ranked = useMemo(() => {
    if (!userLocation || heading == null) return [];
    return targets
      .map((target) => {
        const bearing = bearingDegrees(userLocation, {
          lat: target.lat,
          lng: target.lng,
        });
        const distance = distanceMeters(userLocation, {
          lat: target.lat,
          lng: target.lng,
        });
        const delta = shortestAngleDelta(heading, bearing);
        return { ...target, bearing, distance, delta };
      })
      .filter((t) => Math.abs(t.delta) <= BEAM_HALF_ANGLE + 8)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 8);
  }, [userLocation, heading, targets]);

  if (!open) return null;

  const headingLabel =
    heading == null ? "—" : `${Math.round(normalizeDegrees(heading))}°`;
  const cardinal = heading == null ? "—" : cardinalFromHeading(heading);

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-navy-950">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity ${
            cameraReady ? "opacity-100" : "opacity-0"
          }`}
          playsInline
          muted
          autoPlay
        />
        {!cameraReady && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1a2430_0%,_#0a111a_70%)]" />
        )}

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="hogback-ar-flashlight" aria-hidden />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/20" />
        <div className="pointer-events-none absolute left-1/2 top-[42%] h-8 w-px -translate-x-1/2 bg-copper-400/80" />

        <div className="absolute inset-x-0 top-3 flex flex-col items-center gap-2 px-3">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-navy-950/75 px-4 py-2 backdrop-blur-md">
            <span className="font-display text-2xl font-semibold tabular-nums text-white">
              {headingLabel}
            </span>
            <span className="rounded-md bg-copper-500/20 px-2 py-0.5 text-xs font-semibold tracking-wider text-copper-300">
              {cardinal}
            </span>
          </div>
          {headingAccuracy != null && Number.isFinite(headingAccuracy) && (
            <p className="text-[11px] text-slate-400">
              Compass ±{Math.round(headingAccuracy)}°
            </p>
          )}
          {cameraError && (
            <p className="max-w-sm text-center text-[11px] text-amber-300/90">
              {cameraError}
            </p>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-24 overflow-hidden">
          <CompassStrip heading={heading} />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-28 top-36">
          {ranked.map((target) => {
            const x = 50 + (target.delta / BEAM_HALF_ANGLE) * 38;
            const y = 18 + Math.min(target.distance / 12000, 1) * 55;
            return (
              <div
                key={target.id}
                className="absolute -translate-x-1/2 rounded-lg border border-white/20 bg-navy-950/80 px-2.5 py-1.5 text-left shadow-lg backdrop-blur-sm"
                style={{
                  left: `${Math.max(8, Math.min(92, x))}%`,
                  top: `${y}%`,
                }}
              >
                <p className="max-w-[10rem] truncate text-xs font-semibold text-white">
                  {target.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  {target.kind} · {formatDistance(target.distance)} ·{" "}
                  {Math.round(target.bearing)}°
                </p>
              </div>
            );
          })}
          {userLocation && heading != null && ranked.length === 0 && (
            <p className="absolute inset-x-0 top-8 text-center text-xs text-slate-400">
              Point toward mapped fires or resources in your beam
            </p>
          )}
        </div>
      </div>

      <div className="z-10 border-t border-white/10 bg-navy-950/95 px-3 py-3 backdrop-blur-sm">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-copper-400">
              AR compass
            </p>
            <p className="text-xs text-slate-400">
              Hold phone upright and point to scan
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white hover:bg-white/5"
          >
            Close
          </button>
        </div>

        {!userLocation && (
          <p className="mb-2 text-xs text-amber-300">Waiting for GPS location…</p>
        )}

        {onManualHeading && (
          <label className="mt-1 flex items-center gap-2 text-xs text-slate-400">
            <span className="shrink-0">Manual heading</span>
            <input
              type="range"
              min={0}
              max={359}
              value={Math.round(heading ?? 0)}
              onChange={(e) => onManualHeading(Number(e.target.value))}
              className="w-full accent-copper-500"
              aria-label="Manual compass heading"
            />
          </label>
        )}

        <ul className="mt-2 max-h-28 space-y-1 overflow-auto text-xs">
          {ranked.map((target) => (
            <li
              key={`list-${target.id}`}
              className="flex items-center justify-between gap-2 rounded-md bg-white/5 px-2 py-1.5"
            >
              <span className="min-w-0 truncate text-slate-200">
                {target.name}
              </span>
              <span className="shrink-0 tabular-nums text-slate-400">
                {formatDistance(target.distance)} · {Math.round(target.bearing)}
                °
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CompassStrip({ heading }: { heading: number | null }) {
  const h = heading ?? 0;
  const marks = Array.from({ length: 72 }, (_, i) => i * 5);
  return (
    <div className="relative mx-auto h-10 w-full max-w-md overflow-hidden">
      <div
        className="absolute top-0 flex h-full items-end"
        style={{
          width: "200%",
          left: "50%",
          transform: `translateX(-${(h / 360) * 50}%)`,
        }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex w-1/2 justify-between">
            {marks.map((deg) => {
              const major = deg % 45 === 0;
              const label =
                deg === 0
                  ? "N"
                  : deg === 90
                    ? "E"
                    : deg === 180
                      ? "S"
                      : deg === 270
                        ? "W"
                        : major
                          ? String(deg)
                          : "";
              return (
                <div
                  key={`${copy}-${deg}`}
                  className="flex w-0 flex-col items-center"
                >
                  {label ? (
                    <span className="mb-0.5 text-[9px] font-semibold text-white/80">
                      {label}
                    </span>
                  ) : null}
                  <span
                    className={`w-px ${major ? "h-3 bg-white/70" : "h-1.5 bg-white/35"}`}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-copper-400" />
    </div>
  );
}

export async function requestOrientationPermission(): Promise<boolean> {
  const DOE = DeviceOrientationEvent as unknown as {
    requestPermission?: (absolute?: boolean) => Promise<"granted" | "denied">;
  };
  if (typeof DOE.requestPermission === "function") {
    try {
      const result = await DOE.requestPermission(true);
      return result === "granted";
    } catch {
      return false;
    }
  }
  return true;
}

export function readCompassHeading(
  event: DeviceOrientationEvent,
): { heading: number; accuracy: number | null } | null {
  const e = event as DeviceOrientationEventiOS;
  if (typeof e.webkitCompassHeading === "number") {
    return {
      heading: normalizeDegrees(e.webkitCompassHeading),
      accuracy:
        typeof e.webkitCompassAccuracy === "number"
          ? e.webkitCompassAccuracy
          : null,
    };
  }
  if (typeof event.alpha === "number") {
    return {
      heading: normalizeDegrees(360 - event.alpha),
      accuracy: null,
    };
  }
  return null;
}
