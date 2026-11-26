"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { contactEntryHref, type CapabilityTile } from "@/lib/site-content";
import { TacticalFrame } from "@/components/TacticalFrame";

export function CapabilityTiles({ tiles }: { tiles: CapabilityTile[] }) {
  const visible = tiles.filter(
    (tile) => tile.label.trim().length > 0 || tile.title.trim().length > 0,
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const baseId = useId();
  const active = visible[activeIndex] ?? visible[0];

  if (!active) return null;

  return (
    <div className="grid items-stretch gap-4 pt-2 lg:grid-cols-[minmax(16rem,0.86fr)_minmax(0,1.35fr)]">
      <div
        role="tablist"
        aria-label="Capabilities"
        className="flex flex-col gap-2"
        onKeyDown={(event) => {
          let next = activeIndex;
          if (event.key === "ArrowDown" || event.key === "ArrowRight") {
            next = activeIndex + 1;
          } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
            next = activeIndex - 1;
          } else if (event.key === "Home") {
            next = 0;
          } else if (event.key === "End") {
            next = visible.length - 1;
          } else {
            return;
          }
          event.preventDefault();
          const resolved = (next + visible.length) % visible.length;
          setActiveIndex(resolved);
          document.getElementById(`${baseId}-tab-${resolved}`)?.focus();
        }}
      >
        {visible.map((capability, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={`${capability.label}-${capability.image}`}
              id={`${baseId}-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${baseId}-panel`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setActiveIndex(index);
              }}
              onFocus={() => setActiveIndex(index)}
              className={`tactical-tab w-full ${isActive ? "tactical-tab-active" : ""}`}
            >
              <span className="font-mono text-[10px] font-semibold tracking-[0.18em]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-sm font-semibold uppercase tracking-[0.12em]">
                {capability.label}
              </span>
            </button>
          );
        })}
      </div>

      <TacticalFrame className="min-h-full">
        <div
          key={activeIndex}
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${activeIndex}`}
          className="capability-panel flex h-full flex-col justify-between gap-6 p-6 sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="kicker">Capability</p>
              <h3 className="font-display text-3xl font-semibold uppercase leading-none tracking-wide text-bone sm:text-4xl">
                {active.title.trim() || active.label}
              </h3>
            </div>
          </div>
          {active.body.trim() ? (
            <p className="max-w-xl text-base leading-relaxed text-bone/80">
              {active.body}
            </p>
          ) : null}
          {active.ctaLabel.trim() && active.ctaHref.trim() ? (
            <div>
              <CapabilityCta
                href={contactEntryHref(active.ctaHref)}
                label={active.ctaLabel}
              />
            </div>
          ) : null}
        </div>
      </TacticalFrame>
    </div>
  );
}

function CapabilityCta({ href, label }: { href: string; label: string }) {
  const className =
    "inline-flex items-center gap-2 rounded-md bg-khaki px-4 py-2 text-sm font-semibold tracking-wide text-ink transition hover:brightness-110";
  const mark = href.startsWith("#") ? "↓" : "↗";
  const external =
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//");

  if (href.startsWith("#") || href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {label}
        <span aria-hidden="true">{mark}</span>
      </Link>
    );
  }

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={className}
    >
      {label}
      <span aria-hidden="true">↗</span>
    </a>
  );
}
