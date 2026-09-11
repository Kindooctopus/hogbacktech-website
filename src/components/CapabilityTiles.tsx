"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CapabilityTile } from "@/lib/site-content";

export function CapabilityTiles({ tiles }: { tiles: CapabilityTile[] }) {
  const visible = tiles.filter((tile) => tile.image.trim().length > 0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const active = activeIndex === null ? null : visible[activeIndex];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (active) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [active]);

  if (visible.length === 0) return null;

  return (
    <>
      <ul className="hidden grid-cols-2 gap-3 pt-2 sm:grid-cols-3 md:grid lg:grid-cols-5">
        {visible.map((capability, index) => {
          const isActive = activeIndex === index;
          return (
            <li
              key={`${capability.label}-${capability.image}`}
              className="flex justify-center"
            >
              <button
                type="button"
                aria-pressed={isActive}
                aria-haspopup="dialog"
                onClick={() => setActiveIndex(index)}
                className={`group rounded-md p-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper-500 ${
                  isActive
                    ? "ring-2 ring-copper-500/70"
                    : "hover:ring-1 hover:ring-copper-500/40"
                }`}
              >
                <Image
                  src={capability.image}
                  alt={capability.label}
                  width={512}
                  height={512}
                  className="h-24 w-auto object-contain transition duration-200 group-hover:scale-[1.03] sm:h-28 lg:h-32"
                />
                <span className="sr-only">
                  Learn more about {capability.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto w-[min(100%,28rem)] max-w-[calc(100vw-2rem)] rounded-lg border border-slate-200 bg-white p-0 text-slate-600 shadow-[0_24px_60px_-28px_rgba(10,17,26,0.45)] backdrop:bg-navy-950/45"
        onClose={() => setActiveIndex(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setActiveIndex(null);
        }}
      >
        {active ? (
          <div className="space-y-4 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Image
                  src={active.image}
                  alt=""
                  width={96}
                  height={96}
                  className="h-14 w-auto object-contain"
                  aria-hidden
                />
                <h2
                  id={titleId}
                  className="font-display text-xl font-semibold text-navy-950 sm:text-2xl"
                >
                  {active.title.trim() || active.label}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 hover:text-navy-950"
                aria-label="Close"
              >
                Close
              </button>
            </div>
            {active.body.trim() ? (
              <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                {active.body}
              </p>
            ) : null}
            {active.ctaLabel.trim() && active.ctaHref.trim() ? (
              <div className="pt-1">
                {active.ctaHref.startsWith("#") ||
                active.ctaHref.startsWith("/") ? (
                  <Link
                    href={active.ctaHref}
                    onClick={() => setActiveIndex(null)}
                    className="inline-flex items-center gap-2 rounded-md bg-copper-500 px-4 py-2 text-sm font-semibold text-navy-950 hover:bg-copper-400"
                  >
                    {active.ctaLabel}
                    <span aria-hidden="true">
                      {active.ctaHref.startsWith("#") ? "↓" : "↗"}
                    </span>
                  </Link>
                ) : (
                  <a
                    href={active.ctaHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-copper-500 px-4 py-2 text-sm font-semibold text-navy-950 hover:bg-copper-400"
                  >
                    {active.ctaLabel}
                    <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </>
  );
}
