import { products } from "@/lib/content";

const accentStyles: Record<string, string> = {
  ops: "text-ops border-ops/30 bg-ops/5 hover:border-ops/50",
  geo: "text-geo border-geo/30 bg-geo/5 hover:border-geo/50",
  docs: "text-docs border-docs/30 bg-docs/5 hover:border-docs/50",
  forge: "text-forge border-forge/30 bg-forge/5 hover:border-forge/50",
};

const badgeStyles: Record<string, string> = {
  ops: "bg-ops/15 text-ops",
  geo: "bg-geo/15 text-geo",
  docs: "bg-docs/15 text-docs",
  forge: "bg-forge/15 text-forge",
};

export function Products() {
  return (
    <section id="products" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-copper-400">Product Ecosystem</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Four platforms. One rugged foundation.
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Integrated operational platforms built on modern cloud architecture — inspired by the
            geological strength of the Pacific Northwest.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {products.map((product) => (
            <article
              key={product.id}
              className={`rounded-2xl border p-8 transition-colors ${accentStyles[product.accent]}`}
            >
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeStyles[product.accent]}`}>
                {product.subtitle}
              </span>
              <h3 className="mt-4 font-display text-2xl font-semibold text-white">{product.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{product.description}</p>
              <ul className="mt-6 space-y-2">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                    <svg className="h-4 w-4 shrink-0 text-copper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-white/5 pt-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Starting at</p>
                <p className="mt-1 text-sm font-medium text-slate-300">{product.pricing.tiers[0]}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
