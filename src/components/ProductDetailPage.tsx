"use client";

import Image from "next/image";
import Link from "next/link";
import { DocsSignupForm } from "@/components/DocsSignupForm";
import { HogbackFooter, HogbackHeader } from "@/components/HogbackLandingPage";
import { ProductCtaLink } from "@/components/ProductCtaLink";
import { ProductScreenshotGallery } from "@/components/ProductScreenshotGallery";
import { ProductSecuritySection } from "@/components/ProductSecuritySection";
import { company } from "@/lib/content";
import {
  defaultSiteContent,
  getProductCard,
  type ProductCardContent,
} from "@/lib/site-content";
import { useSiteContent } from "@/lib/use-site-content";

export function ProductDetailPage({ productId }: { productId: string }) {
  const { content } = useSiteContent();
  const product =
    getProductCard(content, productId) ??
    getProductCard(defaultSiteContent, productId);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#eef2f6] p-8 text-slate-600">
        Product not found.
      </div>
    );
  }

  const others = content.products.cards.filter((p) => p.id !== product.id);
  const email = content.contact.email || company.email;

  return (
    <div
      className="min-h-screen text-slate-600"
      style={{ backgroundColor: content.design.pageBackground }}
    >
      <HogbackHeader content={content} />
      <main className="mx-auto max-w-6xl space-y-12 px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-copper-600"
        >
          <span aria-hidden="true">←</span>
          {content.products.backHomeLabel}
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

          <ProductCopy product={product} email={email} content={content} />
        </div>

        <ProductSecuritySection product={product} />

        {product.screenshots.some((shot) => shot.src.trim().length > 0) ? (
          <section className="space-y-6 border-t border-slate-200 pt-10">
            <h2 className="font-display text-2xl font-semibold text-navy-950">
              {product.screenshotsHeading || "App screenshots"}
            </h2>
            <ProductScreenshotGallery
              productName={product.name}
              screenshots={product.screenshots}
            />
          </section>
        ) : null}

        {product.id === "docs" ? <DocsSignupForm email={email} /> : null}

        <section className="space-y-4 border-t border-slate-200 pt-10">
          <h2 className="font-display text-xl font-semibold text-navy-950">
            {content.products.exploreOthersLabel}
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

function ProductCopy({
  product,
  email,
  content,
}: {
  product: ProductCardContent;
  email: string;
  content: ReturnType<typeof useSiteContent>["content"];
}) {
  const isDocs = product.id === "docs";
  const signupHref = isDocs ? "#signup" : product.appHref;
  const hasApp = Boolean(
    (isDocs || product.appHref) && product.appCtaLabel,
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-copper-600">
          {product.subtitle}
        </p>
        <h1 className="font-display text-4xl font-semibold text-navy-950 sm:text-5xl">
          {product.name}
        </h1>
        <p className="text-base text-slate-600 sm:text-lg">
          {product.pageDescription}
        </p>
      </div>

      <ul className="space-y-2 text-sm text-slate-600">
        {product.features
          .filter((feature) => feature.trim().length > 0)
          .map((feature) => (
            <li key={feature} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-copper-500" />
              <span>{feature}</span>
            </li>
          ))}
      </ul>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_-24px_rgba(10,17,26,0.35)]">
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-copper-600">
          {content.products.pricingLabel}
        </p>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.14em] text-slate-500">
              <th className="pb-2 pr-4 font-medium">Plan</th>
              <th className="pb-2 text-right font-medium">Price</th>
            </tr>
          </thead>
          <tbody>
            {(product.pricingRows?.length
              ? product.pricingRows
              : []
            )
              .filter((row) => row.plan.trim() || row.price.trim())
              .map((row) => (
                  <tr
                    key={`${row.plan}-${row.price}`}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="py-2.5 pr-4 font-medium text-navy-950">
                      {row.plan || "—"}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-slate-700">
                      {row.price || "—"}
                    </td>
                  </tr>
                ))}
            {product.pricingSetup.trim().length > 0 ? (
              <tr className="border-t border-slate-200">
                <td className="pt-3 pr-4 text-slate-500">
                  {content.products.setupLabel.replace(/:$/, "") || "Setup"}
                </td>
                <td className="pt-3 text-right tabular-nums text-slate-600">
                  {product.pricingSetup}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {hasApp ? (
          <ProductCtaLink
            href={signupHref || product.appHref}
            className="inline-flex items-center gap-2 rounded-full bg-copper-500 px-6 py-2.5 text-sm font-semibold text-navy-950 hover:bg-copper-400"
          >
            {product.appCtaLabel}
            <span aria-hidden="true">{isDocs ? "↓" : "↗"}</span>
          </ProductCtaLink>
        ) : null}
        <a
          href={`mailto:${email}?subject=${encodeURIComponent(`${product.name} inquiry`)}`}
          className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold ${
            hasApp
              ? "border border-slate-300 bg-white text-navy-950 hover:bg-slate-50"
              : "bg-copper-500 text-navy-950 hover:bg-copper-400"
          }`}
        >
          {product.talkCtaLabel}
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
