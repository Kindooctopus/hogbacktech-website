"use client";

import Image from "next/image";
import Link from "next/link";
import { DocsSignupForm } from "@/components/DocsSignupForm";
import { HogbackFooter, HogbackHeader } from "@/components/HogbackLandingPage";
import { ProductCtaLink } from "@/components/ProductCtaLink";
import { ProductScreenshotGallery } from "@/components/ProductScreenshotGallery";
import { ProductSecuritySection } from "@/components/ProductSecuritySection";
import {
  company,
} from "@/lib/content";
import {
  defaultSiteContent,
  getProductCard,
  type ProductCardContent,
} from "@/lib/site-content";
import { fieldPageStyle } from "@/lib/field-theme";
import { useSiteContent } from "@/lib/use-site-content";
import { TacticalFrame } from "@/components/TacticalFrame";

export function ProductDetailPage({ productId }: { productId: string }) {
  const { content } = useSiteContent();
  const product =
    getProductCard(content, productId) ??
    getProductCard(defaultSiteContent, productId);

  if (!product) {
    return (
      <div className="field-surface min-h-screen p-8 text-bone">
        Product not found.
      </div>
    );
  }

  const others = content.products.cards.filter((p) => p.id !== product.id);
  const email = content.contact.email || company.email;

  return (
    <div
      className="field-surface min-h-screen text-bone/80"
      style={fieldPageStyle(content.design)}
    >
      <HogbackHeader content={content} />
      <main className="mx-auto max-w-6xl space-y-12 px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-sage transition hover:text-khaki"
        >
          <span aria-hidden="true">←</span>
          {content.products.backHomeLabel}
        </Link>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <TacticalFrame>
            <Image
              src={product.tileImage}
              alt={product.name}
              width={1024}
              height={1024}
              className="h-auto w-full object-contain"
              priority
            />
          </TacticalFrame>

          <ProductCopy product={product} email={email} content={content} />
        </div>

        <ProductSecuritySection
          product={product}
          eyebrow={content.products.securityEyebrow}
        />

        {product.screenshots.some((shot) => shot.src.trim().length > 0) ? (
          <section className="space-y-6 border-t border-khaki/25 pt-10">
            <h2 className="font-display text-3xl font-semibold uppercase tracking-wide text-bone">
              {product.screenshotsHeading || "App screenshots"}
            </h2>
            <ProductScreenshotGallery
              productName={product.name}
              screenshots={product.screenshots}
            />
          </section>
        ) : null}

        {product.signup?.enabled ? (
          <DocsSignupForm email={email} copy={product.signup} />
        ) : null}

        <section className="space-y-4 border-t border-khaki/25 pt-10">
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-bone">
            {content.products.exploreOthersLabel}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {others.map((other) => (
              <Link
                key={other.id}
                href={`/products/${other.id}`}
                className="group overflow-hidden rounded-xl border border-khaki/30 bg-dusk transition hover:border-khaki"
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
  const showSignup = Boolean(product.signup?.enabled);
  const signupHref = showSignup ? "#signup" : product.appHref;
  const hasApp = Boolean(
    (showSignup || product.appHref) && product.appCtaLabel,
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="kicker">
          {product.subtitle}
        </p>
        <h1 className="font-display text-4xl font-semibold uppercase tracking-wide text-bone sm:text-5xl">
          {product.name}
        </h1>
        <p className="text-base leading-relaxed text-bone/80 sm:text-lg">
          {product.pageDescription}
        </p>
      </div>

      <ul className="space-y-2 text-sm text-bone/75">
        {product.features
          .filter((feature) => feature.trim().length > 0)
          .map((feature) => (
            <li key={feature} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-copper-500" />
              <span>{feature}</span>
            </li>
          ))}
      </ul>

      <TacticalFrame>
        <div className="p-5">
        <p className="kicker mb-3">
          {content.products.pricingLabel}
        </p>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-khaki/25 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-sage">
              <th className="pb-2 pr-4 font-medium">
                {content.products.planColumnLabel || "Plan"}
              </th>
              <th className="pb-2 text-right font-medium">
                {content.products.priceColumnLabel || "Price"}
              </th>
            </tr>
          </thead>
          <tbody>
            {(product.pricingRows?.length ? product.pricingRows : [])
              .filter((row) => row.plan.trim() || row.price.trim())
              .map((row) => (
                <tr
                  key={`${row.plan}-${row.price}`}
                  className="border-b border-khaki/15 last:border-b-0"
                >
                  <td className="py-2.5 pr-4 font-medium text-bone">
                    {row.plan || "—"}
                  </td>
                  <td className="py-2.5 text-right font-mono tabular-nums text-khaki">
                    {row.price || "—"}
                  </td>
                </tr>
              ))}
            {product.pricingSetup.trim().length > 0 ? (
              <tr className="border-t border-khaki/25">
                <td className="pt-3 pr-4 text-sage">
                  {content.products.setupLabel.replace(/:$/, "") || "Setup"}
                </td>
                <td className="pt-3 text-right font-mono tabular-nums text-bone/80">
                  {product.pricingSetup}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        </div>
      </TacticalFrame>

      <div className="flex flex-wrap items-center gap-3">
        {hasApp ? (
          <ProductCtaLink
            href={signupHref || product.appHref}
            className="inline-flex items-center gap-2 rounded-md bg-khaki px-5 py-2.5 text-sm font-semibold tracking-wide text-ink hover:brightness-110"
          >
            {product.appCtaLabel}
            <span aria-hidden="true">{showSignup ? "↓" : "↗"}</span>
          </ProductCtaLink>
        ) : null}
        <a
          href={`mailto:${email}?subject=${encodeURIComponent(`${product.name} inquiry`)}`}
          className={`inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold ${
            hasApp
              ? "border border-khaki/45 text-bone hover:border-khaki hover:bg-khaki/10"
              : "bg-khaki text-ink hover:brightness-110"
          }`}
        >
          {product.talkCtaLabel}
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
