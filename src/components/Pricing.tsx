import { products, supportPlans } from "@/lib/content";

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-copper-400">Pricing</p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-white sm:text-5xl">
            Transparent tiers. Scoped setup.
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Flexible pricing designed for agencies and organizations of every size. Contact us for
            a tailored quote.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl border border-white/5 bg-navy-900/30 p-8"
            >
              <h3 className="font-display text-xl font-semibold text-copper-400">{product.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{product.subtitle}</p>
              <ul className="mt-6 space-y-3">
                {product.pricing.tiers.map((tier) => (
                  <li key={tier} className="border-b border-white/5 pb-3 text-sm text-slate-300">
                    {tier}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-slate-500">
                Setup: <span className="text-slate-400">{product.pricing.setup}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-copper-500/20 bg-copper-500/5 p-8">
          <h3 className="font-display text-lg font-semibold text-white">Support Plans</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {supportPlans.map((plan) => (
              <div key={plan.name} className="rounded-lg border border-white/5 bg-navy-950/50 px-4 py-3 text-center">
                <p className="text-sm font-medium text-slate-300">{plan.name}</p>
                <p className="mt-1 text-lg font-semibold text-copper-400">{plan.price}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-500">
            Add-ons available: Android App, GIS Layers, ICS Web Editor, Drone Integration.{" "}
            <a href="#contact" className="text-copper-400 hover:underline">Contact us for details.</a>
          </p>
        </div>
      </div>
    </section>
  );
}
