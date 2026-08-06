"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

type HogbackMapAppShellProps = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  footer: ReactNode;
};

/** Shell for the Hogback Geo map (`/apps/geo`). */
export function HogbackMapAppShell({
  title,
  eyebrow = "Hogback Geo",
  children,
  footer,
}: HogbackMapAppShellProps) {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="flex h-dvh flex-col bg-navy-950 text-slate-300">
      <header className="z-20 border-b border-white/10 bg-navy-950/95 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 px-3 py-2 sm:px-5 sm:py-2.5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-copper-400">
              {eyebrow}
            </p>
            <h1 className="truncate font-display text-base font-semibold text-white sm:text-lg">
              {title}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-sm">
            <Link
              href="/products/geo"
              className="hidden text-slate-400 transition hover:text-white sm:inline"
            >
              Product
            </Link>
            <Link
              href="/"
              className="rounded-full border border-white/15 px-3 py-1 text-white hover:bg-white/5"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1">{children}</main>

      <footer className="z-20 border-t border-white/10 bg-navy-950/95">
        <button
          type="button"
          onClick={() => setInfoOpen((open) => !open)}
          aria-expanded={infoOpen}
          className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-[11px] text-slate-400 hover:bg-white/5 sm:px-5"
        >
          <span>
            <span className="font-medium text-slate-300">Sources &amp; disclaimer</span>
            <span className="ml-2 text-slate-500">Informational only</span>
          </span>
          <span className="shrink-0 text-slate-500" aria-hidden>
            {infoOpen ? "▾" : "▸"}
          </span>
        </button>
        {infoOpen ? (
          <div className="max-h-[30dvh] overflow-y-auto border-t border-white/10 px-3 py-2 text-[11px] leading-relaxed text-slate-500 sm:px-5">
            {footer}
          </div>
        ) : null}
      </footer>
    </div>
  );
}
