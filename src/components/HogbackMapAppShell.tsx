import Link from "next/link";
import type { ReactNode } from "react";

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
  return (
    <div className="flex h-dvh flex-col bg-navy-950 text-slate-300">
      <header className="z-20 border-b border-white/10 bg-navy-950/95 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-copper-400">
              {eyebrow}
            </p>
            <h1 className="truncate font-display text-lg font-semibold text-white sm:text-xl">
              {title}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-sm">
            <Link
              href="/products/geo"
              className="hidden text-slate-400 transition hover:text-white sm:inline"
            >
              Product
            </Link>
            <Link
              href="/"
              className="rounded-full border border-white/15 px-3 py-1.5 text-white hover:bg-white/5"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1">{children}</main>

      <footer className="border-t border-white/10 px-4 py-2 text-[11px] leading-relaxed text-slate-500 sm:px-6">
        {footer}
      </footer>
    </div>
  );
}
