/** Editable homepage content + design tokens for the site admin. */

export type ProductCardContent = {
  id: string;
  name: string;
  badge: string;
  description: string;
  points: [string, string, string];
};

export type TextAlign = "left" | "center" | "right";
export type FontWeight = "400" | "500" | "600" | "700";

export type TextStyle = {
  fontSizePx: number;
  fontWeight: FontWeight;
  align: TextAlign;
  color: string;
};

export type BuiltinBlockType = "hero" | "products" | "about" | "contact";
export type CustomBlockType = "text" | "image" | "imageText" | "box";
export type BlockType = BuiltinBlockType | CustomBlockType;

type BlockBase = {
  id: string;
  type: BlockType;
  label: string;
};

export type BuiltinBlock = BlockBase & {
  type: BuiltinBlockType;
  titleStyle: TextStyle;
  bodyStyle: TextStyle;
};

export type TextBlock = BlockBase & {
  type: "text";
  title: string;
  body: string;
  titleStyle: TextStyle;
  bodyStyle: TextStyle;
  background: string;
};

export type ImageBlock = BlockBase & {
  type: "image";
  src: string;
  alt: string;
  caption: string;
};

export type ImageTextBlock = BlockBase & {
  type: "imageText";
  src: string;
  alt: string;
  title: string;
  body: string;
  titleStyle: TextStyle;
  bodyStyle: TextStyle;
  /** Text over the image, beside it, or underneath. */
  textPosition: "overlay" | "below" | "left" | "right";
};

export type BoxBlock = BlockBase & {
  type: "box";
  title: string;
  body: string;
  imageSrc: string;
  titleStyle: TextStyle;
  bodyStyle: TextStyle;
  background: string;
};

export type PageBlock =
  | BuiltinBlock
  | TextBlock
  | ImageBlock
  | ImageTextBlock
  | BoxBlock;

export type FontThemeId =
  | "ridge"
  | "modern"
  | "editorial"
  | "technical"
  | "friendly";

export type FontTheme = {
  id: FontThemeId;
  label: string;
  description: string;
  /** Google Fonts family query param pieces. */
  googleFamilies: string[];
  bodyFamily: string;
  displayFamily: string;
};

export const FONT_THEMES: FontTheme[] = [
  {
    id: "ridge",
    label: "Ridge (default)",
    description: "DM Sans body · Barlow headings",
    googleFamilies: [
      "DM+Sans:wght@400;500;600;700",
      "Barlow:wght@400;500;600;700",
    ],
    bodyFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    displayFamily: '"Barlow", ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: "modern",
    label: "Modern",
    description: "Outfit everywhere",
    googleFamilies: ["Outfit:wght@400;500;600;700"],
    bodyFamily: '"Outfit", ui-sans-serif, system-ui, sans-serif',
    displayFamily: '"Outfit", ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: "editorial",
    label: "Editorial",
    description: "Source Serif body · Libre Franklin headings",
    googleFamilies: [
      "Source+Serif+4:wght@400;600;700",
      "Libre+Franklin:wght@400;500;600;700",
    ],
    bodyFamily: '"Source Serif 4", ui-serif, Georgia, serif',
    displayFamily: '"Libre Franklin", ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: "technical",
    label: "Technical",
    description: "IBM Plex Sans",
    googleFamilies: ["IBM+Plex+Sans:wght@400;500;600;700"],
    bodyFamily: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
    displayFamily: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: "friendly",
    label: "Friendly",
    description: "Nunito",
    googleFamilies: ["Nunito:wght@400;500;600;700"],
    bodyFamily: '"Nunito", ui-sans-serif, system-ui, sans-serif',
    displayFamily: '"Nunito", ui-sans-serif, system-ui, sans-serif',
  },
];

export const BRAND_IMAGE_OPTIONS = [
  "/brand/hero-ridge.png",
  "/brand/hero-banner.png",
  "/brand/top-logo.png",
  "/brand/logo-mark.png",
  "/brand/logo-with-name.png",
  "/brand/products/ops.png",
  "/brand/products/geo.png",
  "/brand/products/docs.png",
  "/brand/products/forge.png",
  "/brand/products/sat.png",
] as const;

export type SiteContent = {
  version: 2;
  header: {
    ctaLabel: string;
  };
  hero: {
    titleLine1: string;
    titleLine2: string;
    body: string;
    primaryCta: string;
    secondaryCta: string;
  };
  products: {
    sectionTitle: string;
    sectionBody: string;
    cards: ProductCardContent[];
  };
  about: {
    title: string;
    paragraphs: [string, string, string];
    highlight: string;
    caresTitle: string;
    cares: [string, string, string];
    locationLabel: string;
    locationBody: string;
  };
  contact: {
    title: string;
    paragraphs: [string, string];
    emailLabel: string;
    email: string;
    websiteLabel: string;
    website: string;
    tipsTitle: string;
    tips: [string, string, string];
    ctaLabel: string;
  };
  footer: {
    tagline: string;
    brandLine: string;
  };
  /** Ordered page sections — drag to reorder in /admin. */
  blocks: PageBlock[];
  design: {
    pageBackground: string;
    sectionSpacingPx: number;
    cardGapPx: number;
    copper: string;
    navy: string;
    fontTheme: FontThemeId;
    bodySizePx: number;
    headingScale: number;
  };
};

export const defaultTitleStyle: TextStyle = {
  fontSizePx: 36,
  fontWeight: "600",
  align: "left",
  color: "",
};

export const defaultBodyStyle: TextStyle = {
  fontSizePx: 16,
  fontWeight: "400",
  align: "left",
  color: "",
};

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createBuiltinBlock(type: BuiltinBlockType): BuiltinBlock {
  const labels: Record<BuiltinBlockType, string> = {
    hero: "Hero",
    products: "Products",
    about: "About",
    contact: "Contact",
  };
  return {
    id: type,
    type,
    label: labels[type],
    titleStyle: { ...defaultTitleStyle },
    bodyStyle: { ...defaultBodyStyle },
  };
}

export function createTextBlock(): TextBlock {
  return {
    id: newId("text"),
    type: "text",
    label: "Text box",
    title: "New text section",
    body: "Write your message here.",
    titleStyle: { ...defaultTitleStyle, fontSizePx: 32 },
    bodyStyle: { ...defaultBodyStyle, fontSizePx: 17 },
    background: "#ffffff",
  };
}

export function createImageBlock(): ImageBlock {
  return {
    id: newId("image"),
    type: "image",
    label: "Image",
    src: "/brand/hero-ridge.png",
    alt: "Hogback Ridge",
    caption: "",
  };
}

export function createImageTextBlock(): ImageTextBlock {
  return {
    id: newId("imagetext"),
    type: "imageText",
    label: "Image + text",
    src: "/brand/hero-ridge.png",
    alt: "Hogback Ridge",
    title: "Headline over the image",
    body: "Supporting text sits in front of or beside the picture.",
    titleStyle: {
      fontSizePx: 40,
      fontWeight: "700",
      align: "left",
      color: "#ffffff",
    },
    bodyStyle: {
      fontSizePx: 18,
      fontWeight: "400",
      align: "left",
      color: "#ffffff",
    },
    textPosition: "overlay",
  };
}

export function createBoxBlock(): BoxBlock {
  return {
    id: newId("box"),
    type: "box",
    label: "Content box",
    title: "New box",
    body: "A standalone card you can place anywhere on the page.",
    imageSrc: "",
    titleStyle: { ...defaultTitleStyle, fontSizePx: 24 },
    bodyStyle: { ...defaultBodyStyle },
    background: "#ffffff",
  };
}

export function getFontTheme(id: FontThemeId | string | undefined): FontTheme {
  return FONT_THEMES.find((t) => t.id === id) ?? FONT_THEMES[0];
}

export const defaultSiteContent: SiteContent = {
  version: 2,
  header: {
    ctaLabel: "Talk with us",
  },
  hero: {
    titleLine1: "Solid Foundation.",
    titleLine2: "Smart Solutions.",
    body: "Hogback Ridge Technologies builds software for the people who keep communities moving—public safety, fleets, and field operations. Grounded in real-world experience, engineered for what comes next.",
    primaryCta: "Explore products",
    secondaryCta: "Schedule a conversation",
  },
  products: {
    sectionTitle: "Products built on the ridge",
    sectionBody:
      "Each Hogback product is designed to feel like solid ground under your feet—clear, dependable, and ready when the work gets real.",
    cards: [
      {
        id: "ops",
        name: "Hogback Ops",
        badge: "Public Safety",
        description:
          "Incident‑ready software for fire, EMS, and public safety teams that need clarity when seconds matter.",
        points: [
          "Operational dashboards for command staff",
          "Incident timelines and activity views",
          "Built with frontline experience in mind",
        ],
      },
      {
        id: "geo",
        name: "Hogback Geo",
        badge: "Fleet & Field",
        description:
          "Location‑aware tools for fleets, apparatus, and field units—so you always know what's moving and why.",
        points: [
          "Fleet and asset visibility",
          "Route and coverage insights",
          "Supports mixed public & contract fleets",
        ],
      },
      {
        id: "docs",
        name: "Hogback Docs",
        badge: "Documents",
        description:
          "Document workflows that match how agencies actually work—policies, inspections, and records in one place.",
        points: [
          "Policy and SOP management",
          "Inspection and checklist flows",
          "Audit‑friendly, field‑friendly design",
        ],
      },
      {
        id: "forge",
        name: "Hogback Forge",
        badge: "Custom Development",
        description:
          "When the off‑the‑shelf tools don't fit, Forge builds exactly what your organization needs.",
        points: [
          "Custom integrations and data bridges",
          "Purpose‑built internal tools",
          "Long‑term partnership, not one‑off code",
        ],
      },
      {
        id: "sat",
        name: "Hogback Sat",
        badge: "Satellite",
        description:
          "Near-real-time satellite imagery for wildfire smoke, thermal hotspots, and field situational awareness.",
        points: [
          "NASA GIBS live map feed",
          "True color, fire, and night layers",
          "Open the app and scrub recent passes",
        ],
      },
    ],
  },
  about: {
    title: "Built from the ridge line up",
    paragraphs: [
      "Hogback Ridge Technologies is rooted in the Pacific Northwest—where steep ridges, real weather, and real work shape how people think about reliability. Our software carries that same mindset.",
      "We focus on public safety, fleets, and field operations because that's where downtime isn't an option. Every screen, workflow, and integration is designed to support the people doing the work, not get in their way.",
      "The ridge in our name isn't just a logo. It's a reminder:",
    ],
    highlight: "build on solid ground, and you can go higher.",
    caresTitle: "What we care about",
    cares: [
      "Clarity under pressure for public safety and operations teams",
      "Long‑term partnerships instead of short‑term projects",
      "Software that respects budgets, time, and the realities of the field",
    ],
    locationLabel: "Location",
    locationBody:
      "Hogback Ridge Technologies · Pacific Northwest · Serving agencies and organizations across the region and beyond.",
  },
  contact: {
    title: "Start a conversation from solid ground",
    paragraphs: [
      "Whether you're exploring Hogback Ops, Geo, Docs, Forge—or you're not sure where to start—the first step is a simple conversation about what you're trying to solve.",
      "Share a bit about your agency, fleet, or organization, and we'll talk through what a practical, grounded path forward could look like.",
    ],
    emailLabel: "Email:",
    email: "developer@hogbacktech.com",
    websiteLabel: "Website:",
    website: "hogbacktech.com",
    tipsTitle: "When you reach out, it helps to include:",
    tips: [
      "Your role and organization",
      'Which areas you\'re exploring (Ops, Geo, Docs, Forge, or "not sure yet")',
      "Any systems you already use that we should be aware of",
    ],
    ctaLabel: "Email",
  },
  footer: {
    tagline: "Solid Foundation. Smart Solutions.",
    brandLine: "Brand & site: hogbacktech.com",
  },
  blocks: [
    createBuiltinBlock("hero"),
    createBuiltinBlock("products"),
    createBuiltinBlock("about"),
    createBuiltinBlock("contact"),
  ],
  design: {
    pageBackground: "#eef2f6",
    sectionSpacingPx: 96,
    cardGapPx: 24,
    copper: "#b87333",
    navy: "#0a111a",
    fontTheme: "ridge",
    bodySizePx: 16,
    headingScale: 1,
  },
};

function mergeTextStyle(
  base: TextStyle,
  incoming?: Partial<TextStyle> | null,
): TextStyle {
  return { ...base, ...(incoming ?? {}) };
}

function normalizeBlock(raw: unknown, fallbackIndex: number): PageBlock | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Partial<PageBlock> & { type?: string };
  if (!b.type) return null;

  if (
    b.type === "hero" ||
    b.type === "products" ||
    b.type === "about" ||
    b.type === "contact"
  ) {
    const def = createBuiltinBlock(b.type);
    return {
      ...def,
      id: typeof b.id === "string" ? b.id : def.id,
      label: typeof b.label === "string" ? b.label : def.label,
      titleStyle: mergeTextStyle(def.titleStyle, (b as BuiltinBlock).titleStyle),
      bodyStyle: mergeTextStyle(def.bodyStyle, (b as BuiltinBlock).bodyStyle),
    };
  }

  if (b.type === "text") {
    const def = createTextBlock();
    const t = b as Partial<TextBlock>;
    return {
      ...def,
      id: typeof t.id === "string" ? t.id : `${def.id}-${fallbackIndex}`,
      label: typeof t.label === "string" ? t.label : def.label,
      title: typeof t.title === "string" ? t.title : def.title,
      body: typeof t.body === "string" ? t.body : def.body,
      background: typeof t.background === "string" ? t.background : def.background,
      titleStyle: mergeTextStyle(def.titleStyle, t.titleStyle),
      bodyStyle: mergeTextStyle(def.bodyStyle, t.bodyStyle),
    };
  }

  if (b.type === "image") {
    const def = createImageBlock();
    const t = b as Partial<ImageBlock>;
    return {
      ...def,
      id: typeof t.id === "string" ? t.id : `${def.id}-${fallbackIndex}`,
      label: typeof t.label === "string" ? t.label : def.label,
      src: typeof t.src === "string" ? t.src : def.src,
      alt: typeof t.alt === "string" ? t.alt : def.alt,
      caption: typeof t.caption === "string" ? t.caption : def.caption,
    };
  }

  if (b.type === "imageText") {
    const def = createImageTextBlock();
    const t = b as Partial<ImageTextBlock>;
    const pos = t.textPosition;
    return {
      ...def,
      id: typeof t.id === "string" ? t.id : `${def.id}-${fallbackIndex}`,
      label: typeof t.label === "string" ? t.label : def.label,
      src: typeof t.src === "string" ? t.src : def.src,
      alt: typeof t.alt === "string" ? t.alt : def.alt,
      title: typeof t.title === "string" ? t.title : def.title,
      body: typeof t.body === "string" ? t.body : def.body,
      textPosition:
        pos === "overlay" || pos === "below" || pos === "left" || pos === "right"
          ? pos
          : def.textPosition,
      titleStyle: mergeTextStyle(def.titleStyle, t.titleStyle),
      bodyStyle: mergeTextStyle(def.bodyStyle, t.bodyStyle),
    };
  }

  if (b.type === "box") {
    const def = createBoxBlock();
    const t = b as Partial<BoxBlock>;
    return {
      ...def,
      id: typeof t.id === "string" ? t.id : `${def.id}-${fallbackIndex}`,
      label: typeof t.label === "string" ? t.label : def.label,
      title: typeof t.title === "string" ? t.title : def.title,
      body: typeof t.body === "string" ? t.body : def.body,
      imageSrc: typeof t.imageSrc === "string" ? t.imageSrc : def.imageSrc,
      background: typeof t.background === "string" ? t.background : def.background,
      titleStyle: mergeTextStyle(def.titleStyle, t.titleStyle),
      bodyStyle: mergeTextStyle(def.bodyStyle, t.bodyStyle),
    };
  }

  return null;
}

export function mergeSiteContent(partial: unknown): SiteContent {
  if (!partial || typeof partial !== "object") return defaultSiteContent;
  const incoming = partial as Partial<SiteContent>;

  const mergedBlocks =
    Array.isArray(incoming.blocks) && incoming.blocks.length > 0
      ? incoming.blocks
          .map((b, i) => normalizeBlock(b, i))
          .filter((b): b is PageBlock => b !== null)
      : defaultSiteContent.blocks;

  return {
    ...defaultSiteContent,
    ...incoming,
    version: 2,
    header: { ...defaultSiteContent.header, ...incoming.header },
    hero: { ...defaultSiteContent.hero, ...incoming.hero },
    products: {
      ...defaultSiteContent.products,
      ...incoming.products,
      cards:
        incoming.products?.cards && incoming.products.cards.length > 0
          ? incoming.products.cards.map((card, i) => {
              const fallback =
                defaultSiteContent.products.cards[
                  Math.min(i, defaultSiteContent.products.cards.length - 1)
                ];
              return {
                ...fallback,
                ...card,
                points: [
                  card.points?.[0] ?? fallback.points[0],
                  card.points?.[1] ?? fallback.points[1],
                  card.points?.[2] ?? fallback.points[2],
                ] as [string, string, string],
              };
            })
          : defaultSiteContent.products.cards,
    },
    about: {
      ...defaultSiteContent.about,
      ...incoming.about,
      paragraphs: [
        incoming.about?.paragraphs?.[0] ?? defaultSiteContent.about.paragraphs[0],
        incoming.about?.paragraphs?.[1] ?? defaultSiteContent.about.paragraphs[1],
        incoming.about?.paragraphs?.[2] ?? defaultSiteContent.about.paragraphs[2],
      ],
      cares: [
        incoming.about?.cares?.[0] ?? defaultSiteContent.about.cares[0],
        incoming.about?.cares?.[1] ?? defaultSiteContent.about.cares[1],
        incoming.about?.cares?.[2] ?? defaultSiteContent.about.cares[2],
      ],
    },
    contact: {
      ...defaultSiteContent.contact,
      ...incoming.contact,
      paragraphs: [
        incoming.contact?.paragraphs?.[0] ?? defaultSiteContent.contact.paragraphs[0],
        incoming.contact?.paragraphs?.[1] ?? defaultSiteContent.contact.paragraphs[1],
      ],
      tips: [
        incoming.contact?.tips?.[0] ?? defaultSiteContent.contact.tips[0],
        incoming.contact?.tips?.[1] ?? defaultSiteContent.contact.tips[1],
        incoming.contact?.tips?.[2] ?? defaultSiteContent.contact.tips[2],
      ],
    },
    footer: { ...defaultSiteContent.footer, ...incoming.footer },
    blocks: mergedBlocks.length > 0 ? mergedBlocks : defaultSiteContent.blocks,
    design: {
      ...defaultSiteContent.design,
      ...incoming.design,
      fontTheme: getFontTheme(incoming.design?.fontTheme).id,
    },
  };
}

export function textStyleToCss(style: TextStyle): {
  fontSize: number;
  fontWeight: number;
  textAlign: TextAlign;
  color?: string;
} {
  return {
    fontSize: style.fontSizePx,
    fontWeight: Number(style.fontWeight),
    textAlign: style.align,
    ...(style.color ? { color: style.color } : {}),
  };
}
