"use client";

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

        <ProductCopy product={product} email={email} />

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
          <div className="flex flex-wrap gap-3">
            {others.map((other) => (
              <Link
                key={other.id}
                href={`/products/${other.id}`}
                className="rounded-md border border-khaki/35 px-4 py-2 text-sm font-semibold text-bone transition hover:border-khaki hover:text-khaki"
              >
                {other.name}
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
}: {
  product: ProductCardContent;
  email: string;
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

      <div className="flex flex-wrap items-center gap-3">
        <a
          href={`mailto:${email}?subject=${encodeURIComponent(`${product.name} inquiry`)}`}
          className="inline-flex items-center gap-2 rounded-md bg-khaki px-5 py-2.5 text-sm font-semibold tracking-wide text-ink hover:brightness-110"
        >
          {product.talkCtaLabel}
          <span aria-hidden="true">↗</span>
        </a>
        {hasApp ? (
          <ProductCtaLink
            href={signupHref || product.appHref}
            className="inline-flex items-center gap-2 rounded-md border border-khaki/45 px-5 py-2.5 text-sm font-semibold text-bone hover:border-khaki hover:bg-khaki/10"
          >
            {product.appCtaLabel}
            <span aria-hidden="true">{showSignup ? "↓" : "↗"}</span>
          </ProductCtaLink>
        ) : null}
      </div>
    </div>
  );
}
