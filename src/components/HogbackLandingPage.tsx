"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  textStyleToCss,
  type BuiltinBlock,
  type PageBlock,
  type SiteContent,
} from "@/lib/site-content";
import { useSiteContent } from "@/lib/use-site-content";
import { fieldPageStyle } from "@/lib/field-theme";
import { FontThemeLoader } from "@/components/FontThemeLoader";
import { CapabilityTiles } from "@/components/CapabilityTiles";
import { HogbackLogo } from "@/components/HogbackLogo";
import { TacticalFrame } from "@/components/TacticalFrame";
import {
  BoxBlockSection,
  GroupBlockSection,
  ImageBlockSection,
  ImageTextBlockSection,
  TextBlockSection,
} from "@/components/CustomBlocks";

const primaryButton =
  "inline-flex items-center gap-2 rounded-md bg-khaki px-5 py-2.5 text-sm font-semibold tracking-wide text-ink transition hover:brightness-110";

export function HogbackLandingPage() {
  const { content } = useSiteContent();

  const pageStyle = fieldPageStyle(content.design);

  return (
    <div
      className="relative min-h-screen text-bone/85"
      style={{ ...pageStyle, backgroundColor: "transparent", backgroundImage: "none" }}
    >
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <Image
          src="/brand/topo-field.svg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[72%_center]"
        />
        <div className="absolute inset-0 bg-dusk/72" />
      </div>
      <div className="relative z-10">
        <FontThemeLoader themeId={content.design.fontTheme} />
        <HogbackHeader content={content} />
        <main
          className="flex flex-col pb-8"
          style={{ gap: content.design.sectionSpacingPx }}
        >
          {content.blocks.map((block) => (
            <PageBlockView key={block.id} block={block} content={content} />
          ))}
        </main>
        <HogbackFooter content={content} />
      </div>
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
      return null;
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

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export function HogbackHeader({ content }: { content: SiteContent }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-khaki/25 bg-dusk/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#top" aria-label="Hogback Ridge Technologies home" className="shrink-0">
          <HogbackLogo compact />
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-sage transition-colors hover:text-bone"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href="#contact" className={`${primaryButton} px-4 py-1.5`}>
            {content.header.ctaLabel}
          </a>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-khaki/40 text-bone md:hidden"
            aria-expanded={open}
            aria-label="Toggle menu"
            onClick={() => setOpen((value) => !value)}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-khaki/20 px-6 py-4 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-sage hover:text-bone"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      ) : null}
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

  return (
    <section id="top" className="scroll-mt-16">
      <div className="mx-auto max-w-6xl space-y-6 px-6 pt-6 lg:pt-8">
        <div className="max-w-xl space-y-4">
          <div className="flex items-center gap-4">
            <Image
              src="/brand/logo-ridge.png"
              alt=""
              width={671}
              height={270}
              priority
              className="h-14 w-auto sm:h-16"
            />
            <div className="leading-none">
              <p className="font-display text-3xl font-bold tracking-[0.14em] text-bone sm:text-4xl">
                HOGBACK
              </p>
              <p className="mt-1.5 text-[11px] font-semibold tracking-[0.32em] text-copper-600 sm:text-xs">
                TECHNOLOGIES
              </p>
            </div>
          </div>
          <h1
            className="font-display text-5xl font-semibold uppercase leading-[0.92] tracking-wide text-bone sm:text-6xl"
            style={titleStyle}
          >
            {content.hero.titleLine1}
            <br />
            <span className="text-khaki">{content.hero.titleLine2}</span>
          </h1>
          <p
            className="max-w-xl text-base leading-relaxed text-bone/80 sm:text-lg"
            style={bodyStyle}
          >
            {content.hero.body}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a href="#contact" className={primaryButton}>
              {content.hero.primaryCta}
            </a>
          </div>
        </div>
        <CapabilityTiles tiles={content.hero.capabilities || []} />
        <OffTheShelf content={content} />
      </div>
    </section>
  );
}

/** Custom builds stay with software development. Every other product is off the shelf. */
const customBuildIds = new Set(["ops", "forge"]);
const shelfLeadIds = ["docs", "geo"];

function shelfProducts(cards: SiteContent["products"]["cards"]) {
  const ready = cards.filter(
    (card) => !customBuildIds.has(card.id) && card.name.trim().length > 0,
  );
  return [
    ...shelfLeadIds.flatMap((id) => ready.filter((card) => card.id === id)),
    ...ready.filter((card) => !shelfLeadIds.includes(card.id)),
  ];
}

function OffTheShelf({ content }: { content: SiteContent }) {
  const products = shelfProducts(content.products.cards);

  if (products.length === 0) return null;

  return (
    <section id="products" className="scroll-mt-24 space-y-4 border-t border-khaki/20 pt-6">
      <div className="max-w-2xl space-y-2">
        <h2 className="font-display text-3xl font-semibold uppercase tracking-wide text-bone">
          Off the shelf products
        </h2>
        <p className="text-bone/75">
          Built and ready. We set them up for your organization.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {products.map((product) => (
          <TacticalFrame key={product.id}>
            <article className="flex h-full flex-col gap-3 p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-2xl font-semibold uppercase tracking-wide text-bone">
                  {product.name}
                </h3>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-khaki">
                  {product.badge}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-bone/75">{product.description}</p>
              <Link
                href={`/products/${product.id}`}
                className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-khaki hover:text-bone"
              >
                Learn about {product.name}
                <span aria-hidden="true">↗</span>
              </Link>
            </article>
          </TacticalFrame>
        ))}
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
      <div className="mx-auto grid max-w-6xl items-start gap-6 px-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.7fr)]">
        <div className="space-y-4 text-bone/80" style={bodyStyle}>
          <p className="kicker">The company</p>
          <h2
            className="font-display text-4xl font-semibold uppercase tracking-wide text-bone"
            style={titleStyle}
          >
            {content.about.title}
          </h2>
          <p>{content.about.paragraphs[0]}</p>
          <p>{content.about.paragraphs[1]}</p>
          <p>
            {content.about.paragraphs[2]}{" "}
            <span className="text-khaki">{content.about.highlight}</span>
          </p>

          <TacticalFrame>
            <div className="p-5">
              <h3 className="mb-3 font-display text-lg font-semibold uppercase tracking-wide text-bone">
                {content.about.caresTitle}
              </h3>
              <ul className="space-y-2 text-sm text-bone/75">
                {content.about.cares.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-khaki" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TacticalFrame>
        </div>

        <TacticalFrame>
          <div className="p-5">
            <p className="kicker">{content.about.locationLabel}</p>
            <p className="mt-2 text-sm text-bone/80">{content.about.locationBody}</p>
          </div>
        </TacticalFrame>
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
      <div className="mx-auto grid max-w-6xl items-start gap-6 px-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4 text-bone/80" style={bodyStyle}>
          <p className="kicker">Contact</p>
          <h2
            className="font-display text-4xl font-semibold uppercase tracking-wide text-bone"
            style={titleStyle}
          >
            {content.contact.title}
          </h2>
          <p>{content.contact.paragraphs[0]}</p>
          <p>{content.contact.paragraphs[1]}</p>

          <div className="space-y-3 text-sm">
            <p>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-sage">
                {content.contact.emailLabel}
              </span>{" "}
              <a
                href={`mailto:${content.contact.email}`}
                className="text-khaki hover:text-bone"
              >
                {content.contact.email}
              </a>
            </p>
            <p>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-sage">
                {content.contact.websiteLabel}
              </span>{" "}
              <a
                href={`https://${content.contact.website}`}
                className="text-khaki hover:text-bone"
              >
                {content.contact.website}
              </a>
            </p>
          </div>
        </div>

        <TacticalFrame>
          <div className="space-y-4 p-5">
            <p className="text-sm text-bone/80">{content.contact.tipsTitle}</p>
            <ul className="space-y-2 text-sm text-bone/75">
              {content.contact.tips.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-khaki" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <a
                href={`mailto:${content.contact.email}?subject=Hogback%20Ridge%20Technologies%20Inquiry`}
                className={primaryButton}
              >
                {content.contact.ctaLabel} {content.contact.email}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </TacticalFrame>
      </div>
    </section>
  );
}

export function HogbackFooter({ content }: { content: SiteContent }) {
  return (
    <footer className="border-t border-khaki/25">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-6 font-mono text-[11px] uppercase tracking-[0.14em] text-sage sm:flex-row sm:items-center">
        <p>
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span>{" "}
          Hogback Ridge Technologies · {content.footer.tagline}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/privacy" className="hover:text-khaki">
            Privacy
          </Link>
          <p>{content.footer.brandLine}</p>
        </div>
      </div>
    </footer>
  );
}
