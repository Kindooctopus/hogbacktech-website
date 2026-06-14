import { markets } from "@/lib/content";

export function Markets() {
  return (
    <section id="markets" className="border-y border-white/5 bg-navy-900/50 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-copper-400">Market Focus</p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-white sm:text-5xl">
            Built for agencies that can&apos;t afford to fail
          </h2>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {markets.map((market) => (
            <div
              key={market.title}
              className="rounded-xl border border-white/5 bg-navy-950/40 p-8 transition-colors hover:border-copper-500/20"
            >
              <h3 className="font-display text-xl font-semibold text-white">{market.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{market.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
