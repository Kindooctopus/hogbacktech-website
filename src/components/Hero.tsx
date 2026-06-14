import Image from "next/image";
import type { ReactNode } from "react";
import { capabilities, company } from "@/lib/content";

const iconMap: Record<string, ReactNode> = {
  code: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M8 6L2 12L8 18M16 6L22 12L16 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  mobile: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  puzzle: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M12 2C10.5 2 10 3 10 4C10 5 9 6 8 6C7 6 6 7 6 8C6 9 7 10 8 10H10V12H8C7 12 6 13 6 14C6 15 7 16 8 16C9 16 10 17 10 18C10 19 10.5 20 12 20C13.5 20 14 19 14 18C14 17 15 16 16 16C17 16 18 15 18 14C18 13 17 12 16 12H14V10H16C17 10 18 9 18 8C18 7 17 6 16 6C15 6 14 5 14 4C14 3 13.5 2 12 2Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M12 2L4 6V12C4 17 8 21 12 22C16 21 20 17 20 12V6L12 2Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  strategy: (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M4 18V14M8 18V10M12 18V6M16 18V12M20 18V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

export function Hero() {
  return (
    <section className="bg-navy-950 pt-[3.25rem]">
      {/* Full banner scaled to fit — no crop, no overlay */}
      <div className="mx-auto w-full max-w-3xl px-4 sm:max-w-4xl">
        <Image
          src="/brand/hero-ridge.png"
          alt={company.name}
          width={1024}
          height={1024}
          className="h-auto w-full"
          priority
        />
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-8 pt-6">
        <div className="max-w-3xl">
          <h1 className="font-display text-xl font-semibold leading-snug text-white sm:text-2xl lg:text-3xl">
            Rugged, mission-critical software for{" "}
            <span className="gradient-copper">public safety, fleet intelligence,</span>{" "}
            and enterprise operations
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
            {company.mission}
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <a
              href="#products"
              className="inline-flex items-center justify-center rounded-full bg-copper-500 px-6 py-2.5 text-sm font-semibold text-navy-950 transition-colors hover:bg-copper-400"
            >
              Explore Products
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:border-copper-500/40 hover:bg-white/5"
            >
              Request a Demo
            </a>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 border-t border-white/5 pt-5 sm:grid-cols-5">
          {capabilities.map((cap, i) => (
            <div
              key={cap.label}
              className={`flex items-center gap-1.5 sm:flex-col sm:text-center ${i === 4 ? "col-span-2 sm:col-span-1" : ""}`}
            >
              <div className={`shrink-0 ${i % 2 === 0 ? "text-copper-400" : "text-slate-500"}`}>
                {iconMap[cap.icon]}
              </div>
              <p className="text-[10px] uppercase leading-tight tracking-wide text-slate-500 sm:text-[11px]">
                {cap.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
