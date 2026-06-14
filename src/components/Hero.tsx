import Image from "next/image";
import { company } from "@/lib/content";

export function Hero() {
  return (
    <section className="pt-[3.25rem]">
      {/* Brand strip — your logo asset uses dark text, needs a light surface */}
      <div className="border-b border-black/5 bg-[#f2f0ec]">
        <div className="mx-auto w-full max-w-2xl px-4 py-3 sm:max-w-3xl sm:py-4">
          <Image
            src="/brand/logo-full.png"
            alt={company.name}
            width={1024}
            height={1024}
            className="hidden h-auto w-full sm:block"
            priority
          />
          <Image
            src="/brand/logo-mobile.png"
            alt={company.name}
            width={1024}
            height={1024}
            className="mx-auto h-auto w-full max-w-xs sm:hidden"
            priority
          />
        </div>
        <p className="pb-3 text-center text-[10px] uppercase tracking-[0.2em] text-slate-500 sm:hidden">
          {company.motto}
        </p>
      </div>

      {/* Main hero content */}
      <div className="bg-navy-950 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <h1 className="font-display text-xl font-semibold leading-snug text-white sm:text-2xl lg:text-3xl">
              Rugged, mission-critical software for{" "}
              <span className="gradient-copper">public safety, fleet intelligence,</span>{" "}
              and enterprise operations
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
              {company.mission}
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
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

          {/* Ridge photo below branding — scaled, no overlay */}
          <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-xl border border-white/5">
            <Image
              src="/brand/hero-ridge.png"
              alt="Hogback ridge — Columbia River Gorge"
              width={1024}
              height={1024}
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
