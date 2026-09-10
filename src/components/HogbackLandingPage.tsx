"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { capabilities } from "@/lib/content";
import {
  textStyleToCss,
  type BuiltinBlock,
  type PageBlock,
  type SiteContent,
} from "@/lib/site-content";
import { useSiteContent } from "@/lib/use-site-content";
import { FontThemeLoader } from "@/components/FontThemeLoader";
import { ProductCtaLink } from "@/components/ProductCtaLink";
import {
  BoxBlockSection,
  GroupBlockSection,
  ImageBlockSection,
  ImageTextBlockSection,
  TextBlockSection,
} from "@/components/CustomBlocks";

export function HogbackLandingPage() {
  const { content } = useSiteContent();
  const d = content.design;

  const pageStyle = {
    backgroundColor: d.pageBackground,
    fontSize: d.bodySizePx,
    ["--color-copper-500" as string]: d.copper,
    ["--color-copper-600" as string]: d.copper,
    ["--color-copper-400" as string]: d.copper,
    ["--color-navy-950" as string]: d.navy,
    ["--heading-scale" as string]: String(d.headingScale),
  } as CSSProperties;

  return (
    <div className="min-h-screen text-slate-600" style={pageStyle}>
      <FontThemeLoader themeId={d.fontTheme} />
      <HogbackHeader content={content} />
      <main
        className="flex flex-col pb-24"
        style={{ gap: d.sectionSpacingPx }}
      >
        {content.blocks.map((block) => (
          <PageBlockView key={block.id} block={block} content={content} />
        ))}
      </main>
      <HogbackFooter content={content} />
    </div>
  );
}

function PageBlockView({
  block,
  content,
}: {
  block: PageBlock;
  content: SiteContent;
}) {
  switch (block.type) {
    case "hero":
      return <HogbackHero content={content} block={block} />;
    case "products":
      return <HogbackProducts content={content} block={block} />;
    case "about":
      return <HogbackAbout content={content} block={block} />;
    case "contact":
      return <HogbackContact content={content} block={block} />;
    case "text":
      return <TextBlockSection block={block} />;
    case "image":
      return <ImageBlockSection block={block} />;
    case "imageText":
      return <ImageTextBlockSection block={block} />;
    case "box":
      return <BoxBlockSection block={block} />;
    case "group":
      return (
        <GroupBlockSection
          block={block}
          cardGapPx={content.design.cardGapPx}
        />
      );
    default:
      return null;
  }
}

export function HogbackHeader({ content }: { content: SiteContent }) {
  return (
    <header
      className="sticky top-0 z-30 border-b border-slate-200/80 backdrop-blur-sm"
      style={{ backgroundColor: `${content.design.pageBackground}e6` }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#top" aria-label="Hogback Ridge Technologies home" className="shrink-0">
          <Image
            src="/brand/logo-mark.png"
            alt="Hogback Ridge Technologies"
            width={1024}
            height={1024}
            className="h-10 w-auto sm:h-11"
            priority
          />
        </a>

        <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
          <a href="#products" className="transition-colors hover:text-navy-950">
            Products
          </a>
          <a href="#about" className="transition-colors hover:text-navy-950">
            About
          </a>
          <a href="#contact" className="transition-colors hover:text-navy-950">
            Contact
          </a>
        </nav>

        <a
          href="#contact"
          className="shrink-0 rounded-full bg-copper-500 px-4 py-1.5 text-sm font-semibold text-navy-950 hover:bg-copper-400"
        >
          {content.header.ctaLabel}
        </a>
      </div>
    </header>
  );
}

export function HogbackHero({
  content,
  block,
}: {
  content: SiteContent;
  block?: BuiltinBlock;
}) {
  const titleStyle = block
    ? textStyleToCss({
        ...block.titleStyle,
        fontSizePx: Math.round(
          block.titleStyle.fontSizePx * content.design.headingScale,
        ),
      })
    : undefined;
  const bodyStyle = block ? textStyleToCss(block.bodyStyle) : undefined;
  const titlesFirst = content.hero.bannerPosition === "below-titles";

  const banner = (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="overflow-hidden rounded-sm border-y border-copper-500/70 bg-navy-950 shadow-[0_18px_50px_-28px_rgba(10,17,26,0.45)]">
        <div className="relative">
          <Image
            src="/brand/top-logo.png"
            alt="Hogback Technologies — Solid Foundation. Smart Solutions."
            width={1022}
            height={694}
            className="block h-auto w-full object-contain"
            priority
          />

          <div className="absolute inset-y-5 right-2 z-10 hidden w-[13%] max-w-[8.75rem] grid-rows-5 gap-2 sm:right-3 md:grid lg:right-4 lg:w-[14%] xl:max-w-[9.75rem]">
            {content.products.cards.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group relative min-h-0 overflow-hidden rounded-md ring-1 ring-white/25 transition duration-200 hover:ring-copper-400/70 hover:opacity-95"
                aria-label={`Learn more about ${product.name}`}
              >
                <Image
                  src={`/brand/products/${product.id}.png`}
                  alt={product.name}
                  fill
                  sizes="156px"
                  className="object-contain object-center"
                />
              </Link>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 grid grid-cols-5 gap-1 p-1.5 sm:gap-1.5 sm:p-2 md:hidden">
            {content.products.cards.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group flex flex-col items-center gap-1 rounded-lg px-0.5 py-1 text-center transition hover:bg-black/25"
                aria-label={`Learn more about ${product.name}`}
              >
                <Image
                  src={`/brand/products/${product.id}.png`}
                  alt=""
                  width={1024}
                  height={1024}
                  aria-hidden
                  className="h-[5.221125rem] w-[5.221125rem] object-contain sm:h-[5.967rem] sm:w-[5.967rem]"
                />
                <span className="text-[7px] font-semibold uppercase leading-tight tracking-wide text-white drop-shadow-sm group-hover:text-copper-300 sm:text-[8px]">
                  {product.name.replace("Hogback ", "")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const copy = (
    <div
      className={`mx-auto max-w-6xl space-y-5 px-6 pb-6 lg:pb-8 ${
        titlesFirst ? "pt-6" : "pt-6"
      }`}
    >
      <h1
        className="font-display text-4xl font-semibold leading-tight text-navy-950 sm:text-5xl lg:text-6xl"
        style={titleStyle}
      >
        {content.hero.titleLine1}
        <br />
        <span className="text-copper-600">{content.hero.titleLine2}</span>
      </h1>
      <p
        className="max-w-xl text-base text-slate-600 sm:text-lg"
        style={bodyStyle}
      >
        {content.hero.body}
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <a
          href="#products"
          className="rounded-full bg-copper-500 px-6 py-2.5 text-sm font-semibold text-navy-950 hover:bg-copper-400 sm:text-base"
        >
          {content.hero.primaryCta}
        </a>
        <a
          href="#contact"
          className="rounded-full border border-slate-300 bg-white/70 px-6 py-2.5 text-sm text-navy-950 hover:bg-white sm:text-base"
        >
          {content.hero.secondaryCta}
        </a>
      </div>

      <ul className="hidden grid-cols-2 gap-3 pt-2 sm:grid-cols-3 md:grid lg:grid-cols-5">
        {capabilities.map((capability) => (
          <li key={capability.label} className="flex justify-center">
            <Image
              src={capability.image}
              alt={capability.label}
              width={512}
              height={512}
              className="h-24 w-auto object-contain sm:h-28 lg:h-32"
            />
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <section id="top" className="scroll-mt-16">
      {titlesFirst ? (
        <>
          {copy}
          {banner}
        </>
      ) : (
        <>
          {banner}
          {copy}
        </>
      )}
    </section>
  );
}

export function HogbackProducts({
  content,
  block,
}: {
  content: SiteContent;
  block?: BuiltinBlock;
}) {
  const titleStyle = block
    ? textStyleToCss({
        ...block.titleStyle,
        fontSizePx: Math.round(
          block.titleStyle.fontSizePx * content.design.headingScale,
        ),
      })
    : undefined;
  const bodyStyle = block ? textStyleToCss(block.bodyStyle) : undefined;

  return (
    <section id="products" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl space-y-8 px-6">
        <div className="space-y-3">
          <h2
            className="font-display text-3xl font-semibold text-navy-950"
            style={titleStyle}
          >
            {content.products.sectionTitle}
          </h2>
          <p className="max-w-2xl text-slate-600" style={bodyStyle}>
            {content.products.sectionBody}
          </p>
        </div>

        <div
          className="grid md:grid-cols-2"
          style={{ gap: content.design.cardGapPx }}
        >
          {content.products.cards.map((product) => (
            <article
              key={product.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_-24px_rgba(10,17,26,0.35)]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold text-navy-950">
                    {product.name}
                  </h3>
                  <span className="rounded-full border border-copper-500/30 bg-copper-500/10 px-3 py-1 text-xs font-medium text-copper-600">
                    {product.badge}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{product.description}</p>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                  {product.points
                    .filter((point) => point.trim().length > 0)
                    .map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-copper-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Link
                  href={`/products/${product.id}`}
                  className="inline-flex items-center gap-2 text-sm text-copper-600 hover:text-copper-500"
                >
                  Learn about {product.name}
                  <span aria-hidden="true">↗</span>
                </Link>
                {product.appHref && product.appCtaLabel ? (
                  <ProductCtaLink
                    href={product.appHref}
                    className="inline-flex items-center gap-2 text-sm text-navy-800 hover:text-copper-600"
                  >
                    {product.appCtaLabel}
                    <span aria-hidden="true">↗</span>
                  </ProductCtaLink>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HogbackAbout({
  content,
  block,
}: {
  content: SiteContent;
  block?: BuiltinBlock;
}) {
  const titleStyle = block
    ? textStyleToCss({
        ...block.titleStyle,
        fontSizePx: Math.round(
          block.titleStyle.fontSizePx * content.design.headingScale,
        ),
      })
    : undefined;
  const bodyStyle = block ? textStyleToCss(block.bodyStyle) : undefined;

  return (
    <section id="about" className="scroll-mt-24">
      <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 lg:grid-cols-2">
        <div className="space-y-4" style={bodyStyle}>
          <h2
            className="font-display text-3xl font-semibold text-navy-950"
            style={titleStyle}
          >
            {content.about.title}
          </h2>
          <p>{content.about.paragraphs[0]}</p>
          <p>{content.about.paragraphs[1]}</p>
          <p>
            {content.about.paragraphs[2]}{" "}
            <span className="text-navy-900">{content.about.highlight}</span>
          </p>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-copper-500/15 to-white p-5">
            <h3 className="mb-3 font-display text-lg font-semibold text-navy-950">
              {content.about.caresTitle}
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {content.about.cares.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-copper-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-[0_14px_40px_-28px_rgba(10,17,26,0.4)]">
            <Image
              src="/brand/hero-ridge.png"
              alt="Hogback Ridge geological formation"
              width={800}
              height={600}
              className="h-auto w-full object-cover"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-copper-500/15 to-white p-5">
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-copper-600">
              {content.about.locationLabel}
            </p>
            <p className="text-sm text-slate-700">{content.about.locationBody}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HogbackContact({
  content,
  block,
}: {
  content: SiteContent;
  block?: BuiltinBlock;
}) {
  const titleStyle = block
    ? textStyleToCss({
        ...block.titleStyle,
        fontSizePx: Math.round(
          block.titleStyle.fontSizePx * content.design.headingScale,
        ),
      })
    : undefined;
  const bodyStyle = block ? textStyleToCss(block.bodyStyle) : undefined;

  return (
    <section id="contact" className="scroll-mt-24">
      <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4" style={bodyStyle}>
          <h2
            className="font-display text-3xl font-semibold text-navy-950"
            style={titleStyle}
          >
            {content.contact.title}
          </h2>
          <p>{content.contact.paragraphs[0]}</p>
          <p>{content.contact.paragraphs[1]}</p>

          <div className="space-y-3 text-sm">
            <p className="text-slate-700">
              <span className="text-slate-500">{content.contact.emailLabel}</span>{" "}
              <a
                href={`mailto:${content.contact.email}`}
                className="text-copper-600 hover:text-copper-500"
              >
                {content.contact.email}
              </a>
            </p>
            <p className="text-slate-700">
              <span className="text-slate-500">{content.contact.websiteLabel}</span>{" "}
              <a
                href={`https://${content.contact.website}`}
                className="text-copper-600 hover:text-copper-500"
              >
                {content.contact.website}
              </a>
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_-24px_rgba(10,17,26,0.35)]">
          <p className="text-sm text-slate-600">{content.contact.tipsTitle}</p>
          <ul className="space-y-2 text-sm text-slate-600">
            {content.contact.tips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-copper-500" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <a
              href={`mailto:${content.contact.email}?subject=Hogback%20Ridge%20Technologies%20Inquiry`}
              className="inline-flex items-center gap-2 rounded-full bg-copper-500 px-5 py-2 text-sm font-semibold text-navy-950 hover:bg-copper-400"
            >
              {content.contact.ctaLabel} {content.contact.email}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HogbackFooter({ content }: { content: SiteContent }) {
  return (
    <footer className="mt-16 border-t border-slate-200">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-6 text-xs text-slate-500 sm:flex-row sm:items-center">
        <p>
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span>{" "}
          Hogback Ridge Technologies · {content.footer.tagline}
        </p>
        <p>{content.footer.brandLine}</p>
      </div>
    </footer>
  );
}
