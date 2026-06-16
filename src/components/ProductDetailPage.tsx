import Image from "next/image";
import Link from "next/link";
import { HogbackFooter, HogbackHeader } from "@/components/HogbackLandingPage";
import { company, products } from "@/lib/content";

type Product = (typeof products)[number];

export function ProductDetailPage({ product }: { product: Product }) {
  const others = products.filter((p) => p.id !== product.id);

  return (
    <div className="min-h-screen bg-[#0a111a] text-slate-400">
      <HogbackHeader />
      <main className="mx-auto max-w-6xl space-y-12 px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-copper-400"
        >
          <span aria-hidden="true">←</span>
          Back to home
        </Link>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="overflow-hidden rounded-2xl border border-copper-500/40 bg-black/40">
            <Image
              src={product.tileImage}
              alt={product.name}
              width={1024}
              height={1024}
              className="h-auto w-full object-contain"
              priority
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-copper-400">
                {product.subtitle}
              </p>
              <h1 className="font-display text-4xl font-semibold text-white sm:text-5xl">
                {product.name}
              </h1>
              <p className="text-base text-slate-300 sm:text-lg">{product.description}</p>
            </div>

            <ul className="space-y-2 text-sm text-slate-300">
              {product.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-copper-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-copper-300">
                Pricing
              </p>
              <ul className="space-y-1 text-sm text-slate-200">
                {product.pricing.tiers.map((tier) => (
                  <li key={tier}>{tier}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-slate-400">
                Setup: {product.pricing.setup}
              </p>
            </div>

            <a
              href={`mailto:${company.email}?subject=${encodeURIComponent(`${product.name} inquiry`)}`}
              className="inline-flex items-center gap-2 rounded-full bg-copper-500 px-6 py-2.5 text-sm font-semibold text-navy-950 hover:bg-copper-400"
            >
              Talk about {product.name}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <section className="space-y-4 border-t border-white/10 pt-10">
          <h2 className="font-display text-xl font-semibold text-white">
            Explore other products
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {others.map((other) => (
              <Link
                key={other.id}
                href={`/products/${other.id}`}
                className="group overflow-hidden rounded-xl border border-white/10 transition hover:border-copper-500/50 hover:ring-1 hover:ring-copper-500/30"
              >
                <Image
                  src={other.tileImage}
                  alt={other.name}
                  width={1024}
                  height={1024}
                  className="h-auto w-full object-contain transition duration-200 group-hover:scale-[1.02]"
                />
              </Link>
            ))}
          </div>
        </section>
      </main>
      <HogbackFooter />
    </div>
  );
}
