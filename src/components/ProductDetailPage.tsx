"use client";

import Image from "next/image";
import Link from "next/link";
import { HogbackFooter, HogbackHeader } from "@/components/HogbackLandingPage";
import { company, products } from "@/lib/content";
import { useSiteContent } from "@/lib/use-site-content";

type Product = (typeof products)[number];

export function ProductDetailPage({ product }: { product: Product }) {
  const { content } = useSiteContent();
  const others = products.filter((p) => p.id !== product.id);

  return (
    <div className="min-h-screen bg-[#eef2f6] text-slate-600">
      <HogbackHeader content={content} />
      <main className="mx-auto max-w-6xl space-y-12 px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-copper-600"
        >
          <span aria-hidden="true">←</span>
          Back to home
        </Link>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="overflow-hidden rounded-2xl border border-copper-500/40 bg-navy-950 shadow-[0_18px_50px_-28px_rgba(10,17,26,0.35)]">
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
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-copper-600">
                {product.subtitle}
              </p>
              <h1 className="font-display text-4xl font-semibold text-navy-950 sm:text-5xl">
                {product.name}
              </h1>
              <p className="text-base text-slate-600 sm:text-lg">{product.description}</p>
            </div>

            <ul className="space-y-2 text-sm text-slate-600">
              {product.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-copper-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_-24px_rgba(10,17,26,0.35)]">
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-copper-600">
                Pricing
              </p>
              <ul className="space-y-1 text-sm text-slate-700">
                {product.pricing.tiers.map((tier) => (
                  <li key={tier}>{tier}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-slate-500">
                Setup: {product.pricing.setup}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {product.id === "sat" && (
                <Link
                  href="/apps/sat"
                  className="inline-flex items-center gap-2 rounded-full bg-copper-500 px-6 py-2.5 text-sm font-semibold text-navy-950 hover:bg-copper-400"
                >
                  Open live feed
                  <span aria-hidden="true">↗</span>
                </Link>
              )}
              <a
                href={`mailto:${company.email}?subject=${encodeURIComponent(`${product.name} inquiry`)}`}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold ${
                  product.id === "sat"
                    ? "border border-slate-300 bg-white text-navy-950 hover:bg-slate-50"
                    : "bg-copper-500 text-navy-950 hover:bg-copper-400"
                }`}
              >
                Talk about {product.name}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>

        <section className="space-y-4 border-t border-slate-200 pt-10">
          <h2 className="font-display text-xl font-semibold text-navy-950">
            Explore other products
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {others.map((other) => (
              <Link
                key={other.id}
                href={`/products/${other.id}`}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-copper-500/50 hover:ring-1 hover:ring-copper-500/30"
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
      <HogbackFooter content={content} />
    </div>
  );
}
