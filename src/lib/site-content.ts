/** Editable homepage content + design tokens for the site admin. */

export type ProductCardContent = {
  id: string;
  name: string;
  /** Homepage card badge (short label). */
  badge: string;
  /** Homepage card description. */
  description: string;
  /** Homepage card bullets. */
  points: string[];
  /** Product detail page eyebrow / subtitle. */
  subtitle: string;
  /** Full description on `/products/[id]`. */
  pageDescription: string;
  /** Feature list on the product detail page. */
  features: string[];
  tileImage: string;
  /** Structured pricing table rows (Plan | Price). Preferred over pricingTiers. */
  pricingRows: PricingRow[];
  /** Legacy single-string tiers; kept in sync from pricingRows for older content. */
  pricingTiers: string[];
  pricingSetup: string;
  /** Optional in-app CTA, e.g. `/apps/sat` or `/apps/geo`. */
  appHref: string;
  appCtaLabel: string;
  talkCtaLabel: string;
  /** Product page screenshot gallery. */
  screenshots: ProductScreenshot[];
  screenshotsHeading: string;
  /** Optional Security & Privacy section on the product page. */
  securityHeading: string;
  securityIntro: string;
  securityItems: string[];
  securityFootnote: string;
  privacyHref: string;
  privacyLabel: string;
};

export type ProductScreenshot = {
  src: string;
  caption: string;
};

export type PricingRow = {
  plan: string;
  price: string;
};

/** Split stored tier strings like "Core $49/mo" into table columns. */
export function splitPricingTier(tier: string): PricingRow {
  const trimmed = tier.trim();
  if (!trimmed) return { plan: "", price: "" };
  if (trimmed.includes("||")) {
    const [plan, ...rest] = trimmed.split("||");
    return { plan: plan.trim(), price: rest.join("||").trim() };
  }
  const match = trimmed.match(/^(.+?)\s+(\$[\d$.,–\-—+/a-zA-Z\s]+)$/);
  if (match) {
    return { plan: match[1].trim(), price: match[2].trim() };
  }
  if (trimmed.startsWith("$")) {
    return { plan: "", price: trimmed };
  }
  return { plan: trimmed, price: "" };
}

/** Join plan + price columns back into a legacy tier string. */
export function joinPricingTier(plan: string, price: string): string {
  const label = plan.trim();
  const amount = price.trim();
  if (label && amount) return `${label} ${amount}`;
  return label || amount;
}

export function pricingRowsFromTiers(tiers: string[]): PricingRow[] {
  return tiers.map((tier) => splitPricingTier(tier));
}

export function pricingTiersFromRows(rows: PricingRow[]): string[] {
  return rows.map((row) => joinPricingTier(row.plan, row.price));
}

export function normalizePricingRows(
  rows: unknown,
  fallbackTiers: string[],
): PricingRow[] {
  if (Array.isArray(rows) && rows.length > 0) {
    return rows.map((row) => {
      if (!row || typeof row !== "object") return { plan: "", price: "" };
      const r = row as Partial<PricingRow>;
      return {
        plan: typeof r.plan === "string" ? r.plan : "",
        price: typeof r.price === "string" ? r.price : "",
      };
    });
  }
  return pricingRowsFromTiers(fallbackTiers);
}


export type TextAlign = "left" | "center" | "right";
export type FontWeight = "400" | "500" | "600" | "700";

export type TextStyle = {
  fontSizePx: number;
  fontWeight: FontWeight;
  align: TextAlign;
  color: string;
};

export type BuiltinBlockType = "hero" | "products" | "about" | "contact";
export type CustomBlockType = "text" | "image" | "imageText" | "box" | "group";
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

/** Nested boxes that live inside a group section. */
export type NestedBox = TextBlock | ImageBlock | ImageTextBlock | BoxBlock;

export type GroupBlock = BlockBase & {
  type: "group";
  title: string;
  layout: "stack" | "grid";
  children: NestedBox[];
};

export type PageBlock =
  | BuiltinBlock
  | TextBlock
  | ImageBlock
  | ImageTextBlock
  | BoxBlock
  | GroupBlock;

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
    /**
     * Where the heading picture sits relative to title 1 / title 2.
     * - above-titles: banner first (default)
     * - below-titles: titles first, then banner
     */
    bannerPosition: "above-titles" | "below-titles";
  };
  products: {
    sectionTitle: string;
    sectionBody: string;
    backHomeLabel: string;
    pricingLabel: string;
    setupLabel: string;
    exploreOthersLabel: string;
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

export function createGroupBlock(): GroupBlock {
  return {
    id: newId("group"),
    type: "group",
    label: "Box section",
    title: "New section",
    layout: "grid",
    children: [createBoxBlock(), createBoxBlock()],
  };
}

/** Short title shown on admin drag previews. */
export function blockPreviewTitle(block: PageBlock | NestedBox): string {
  if ("title" in block && typeof block.title === "string" && block.title.trim()) {
    return block.title;
  }
  if (block.type === "image" && block.caption) return block.caption;
  if (block.type === "hero") return "Hero";
  if (block.type === "products") return "Products";
  if (block.type === "about") return "About";
  if (block.type === "contact") return "Contact";
  return block.label;
}

export function blockPreviewImage(block: PageBlock | NestedBox): string | null {
  if (block.type === "image" || block.type === "imageText") return block.src;
  if (block.type === "box" && block.imageSrc) return block.imageSrc;
  if (block.type === "hero") return "/brand/top-logo.png";
  if (block.type === "about") return "/brand/hero-ridge.png";
  return null;
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
    bannerPosition: "above-titles",
  },
  products: {
    sectionTitle: "Products built on the ridge",
    sectionBody:
      "Each Hogback product is designed to feel like solid ground under your feet—clear, dependable, and ready when the work gets real.",
    backHomeLabel: "Back to home",
    pricingLabel: "Pricing",
    setupLabel: "Setup:",
    exploreOthersLabel: "Explore other products",
    cards: [
      {
        id: "ops",
        name: "Hogback Ops",
        badge: "Public Safety",
        description:
          "A unified operations hub for Fire, EMS, and emergency services — consolidating CAD, AVL, ICS, staffing, and protocols into a single platform.",
        points: [
          "CAD ingestion & AVL",
          "ICS tools & weather overlays",
          "Staffing integration",
          "Document libraries & situational feeds",
        ],
        subtitle: "Public Safety Operations Platform",
        pageDescription:
          "A unified operations hub for Fire, EMS, and emergency services — consolidating CAD, AVL, ICS, staffing, and protocols into a single platform.",
        features: [
          "CAD ingestion & AVL",
          "ICS tools & weather overlays",
          "Staffing integration",
          "Document libraries & situational feeds",
        ],
        tileImage: "/brand/products/ops.png",
        pricingRows: [
          { plan: "Core", price: "$3,500/yr" },
          { plan: "Standard", price: "$7,500/yr" },
          { plan: "Pro", price: "$12,000–$18,000/yr" },
        ],
        pricingTiers: [
          "Core $3,500/yr",
          "Standard $7,500/yr",
          "Pro $12,000–$18,000/yr",
        ],
        pricingSetup: "$2,000–$6,000",
        appHref: "",
        appCtaLabel: "",
        talkCtaLabel: "Talk about Hogback Ops",
        screenshotsHeading: "App screenshots",
        screenshots: [],
        securityHeading: "",
        securityIntro: "",
        securityItems: [],
        securityFootnote: "",
        privacyHref: "",
        privacyLabel: "",
      },
      {
        id: "geo",
        name: "Hogback Geo",
        badge: "Fleet & Field",
        description:
          "Real-time tracking and intelligence for fleet operators, utilities, public works, and public safety — Cradlepoint integrations plus the Geo map with live fire layers, AVL, and GIS overlays.",
        points: [
          "Geo map with live NIFC fire & perimeter layers",
          "VIIRS, MODIS & Landsat heat signatures",
          "Surface wind lines & speed (mph)",
          "Evacuations, engines, crews & unit locations",
        ],
        subtitle: "Fleet Tracking & Situational Awareness",
        pageDescription:
          "Real-time tracking and intelligence for fleet operators, utilities, public works, and public safety — Cradlepoint integrations plus the Geo map with live fire layers, AVL, and GIS overlays.",
        features: [
          "Geo map with live NIFC fire & perimeter layers",
          "VIIRS, MODIS & Landsat heat signatures",
          "Surface wind lines & speed (mph)",
          "Evacuations, engines, crews & unit locations",
        ],
        tileImage: "/brand/products/geo.png",
        pricingRows: [
          { plan: "Core", price: "$1,500/yr" },
          { plan: "Standard", price: "$3,000/yr" },
          { plan: "Pro", price: "$6,000/yr" },
        ],
        pricingTiers: ["Core $1,500/yr", "Standard $3,000/yr", "Pro $6,000/yr"],
        pricingSetup: "$1,000–$3,000",
        appHref: "/apps/geo",
        appCtaLabel: "Open Geo map",
        talkCtaLabel: "Talk about Hogback Geo",
        screenshotsHeading: "App screenshots",
        screenshots: [],
        securityHeading: "",
        securityIntro: "",
        securityItems: [],
        securityFootnote: "",
        privacyHref: "",
        privacyLabel: "",
      },
      {
        id: "docs",
        name: "Hogback Docs",
        badge: "Documents",
        description:
          "A lightweight, high-performance document system with full-text search, categories, workflows, and training modules — without enterprise bloat.",
        points: [
          "Full-text search",
          "Categories & workflows",
          "Training modules",
          "Admin upload & user access",
        ],
        subtitle: "Document Management & Search",
        pageDescription:
          "A lightweight, high-performance document system with full-text search, categories, workflows, and training modules — without enterprise bloat.",
        features: [
          "Full-text search",
          "Categories & workflows",
          "Training modules",
          "Admin upload & user access",
        ],
        tileImage: "/brand/products/docs.png",
        pricingRows: [
          { plan: "Core", price: "$49/mo" },
          { plan: "Standard", price: "$99/mo" },
          { plan: "Pro", price: "$199/mo" },
        ],
        pricingTiers: ["Core $49/mo", "Standard $99/mo", "Pro $199/mo"],
        pricingSetup: "$250–$750",
        appHref: "/products/docs#signup",
        appCtaLabel: "Sign up your organization",
        talkCtaLabel: "Talk about Hogback Docs",
        screenshotsHeading: "App screenshots",
        screenshots: [
          {
            src: "/brand/products/docs/ios-signin.png",
            caption: "Sign in with your organization code — or try the demo",
          },
          {
            src: "/brand/products/docs/ios-home.png",
            caption: "Browse policies, forms, plans, recents, and favorites",
          },
          {
            src: "/brand/products/docs/ios-search.png",
            caption: "Keyword search across your document library",
          },
          {
            src: "/brand/products/docs/ios-policy-compass.png",
            caption: "Policy Compass AI answers questions from your policies",
          },
          {
            src: "/brand/products/docs/ios-summary.png",
            caption: "AI policy summaries with links back to source documents",
          },
        ],
        securityHeading: "Security & Privacy",
        securityIntro:
          "Built for agencies and organizations that need practical control over sensitive documents—without enterprise theater.",
        securityItems: [
          "AES-256 encryption at rest (Google Cloud / Firebase defaults)",
          "TLS 1.2+ encryption in transit",
          "U.S. cloud infrastructure (Google Cloud us-west1 & Cloudflare)",
          "Organization-scoped access with admin-controlled uploads",
          "Role separation: administrators manage orgs; users access their library",
          "No ads, no tracking pixels, and we do not sell your data",
        ],
        securityFootnote:
          "Need a formal security review, data processing terms, or agency-specific compliance discussion? Contact us—we will walk through your requirements honestly.",
        privacyHref: "/privacy",
        privacyLabel: "Read our privacy policy",
      },
      {
        id: "forge",
        name: "Hogback Forge",
        badge: "Custom Development",
        description:
          "Custom software engineering, integrations, mobile apps, dashboards, GIS tools, and automation workflows tailored to your organization.",
        points: [
          "Custom software & mobile apps",
          "GIS tools & dashboards",
          "System integrations",
          "Automation workflows",
        ],
        subtitle: "Custom Development & Integrations",
        pageDescription:
          "Custom software engineering, integrations, mobile apps, dashboards, GIS tools, and automation workflows tailored to your organization.",
        features: [
          "Custom software & mobile apps",
          "GIS tools & dashboards",
          "System integrations",
          "Automation workflows",
        ],
        tileImage: "/brand/products/forge.png",
        pricingRows: [
          { plan: "", price: "$125–$200/hr" },
          { plan: "Projects", price: "$5,000–$200,000+" },
        ],
        pricingTiers: ["$125–$200/hr", "Projects $5,000–$200,000+"],
        pricingSetup: "Scoped per project",
        appHref: "",
        appCtaLabel: "",
        talkCtaLabel: "Talk about Hogback Forge",
        screenshotsHeading: "App screenshots",
        screenshots: [],
        securityHeading: "",
        securityIntro: "",
        securityItems: [],
        securityFootnote: "",
        privacyHref: "",
        privacyLabel: "",
      },
      {
        id: "sat",
        name: "Hogback Sat",
        badge: "Satellite",
        description:
          "Near-real-time satellite imagery for public safety and field ops — true color, thermal/fire hotspots, and night lights powered by NASA GIBS.",
        points: [
          "Live satellite map feed",
          "True color & thermal/fire layers",
          "Date scrubbing for recent passes",
          "Built for PNW situational awareness",
        ],
        subtitle: "Live Satellite Situational Awareness",
        pageDescription:
          "Near-real-time satellite imagery for public safety and field ops — true color, thermal/fire hotspots, and night lights powered by NASA GIBS.",
        features: [
          "Live satellite map feed",
          "True color & thermal/fire layers",
          "Date scrubbing for recent passes",
          "Built for PNW situational awareness",
        ],
        tileImage: "/brand/products/sat.png",
        pricingRows: [
          { plan: "Core", price: "$1,200/yr" },
          { plan: "Standard", price: "$2,500/yr" },
          { plan: "Pro", price: "$5,000/yr" },
        ],
        pricingTiers: [
          "Core $1,200/yr",
          "Standard $2,500/yr",
          "Pro $5,000/yr",
        ],
        pricingSetup: "$500–$2,000",
        appHref: "/apps/sat",
        appCtaLabel: "Open live feed",
        talkCtaLabel: "Talk about Hogback Sat",
        screenshotsHeading: "App screenshots",
        screenshots: [],
        securityHeading: "",
        securityIntro: "",
        securityItems: [],
        securityFootnote: "",
        privacyHref: "",
        privacyLabel: "",
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

  if (b.type === "group") {
    const def = createGroupBlock();
    const t = b as Partial<GroupBlock>;
    const children = Array.isArray(t.children)
      ? t.children
          .map((child, i) => normalizeBlock(child, i))
          .filter((child): child is NestedBox =>
            Boolean(
              child &&
                (child.type === "text" ||
                  child.type === "image" ||
                  child.type === "imageText" ||
                  child.type === "box"),
            ),
          )
      : def.children;
    return {
      ...def,
      id: typeof t.id === "string" ? t.id : `${def.id}-${fallbackIndex}`,
      label: typeof t.label === "string" ? t.label : def.label,
      title: typeof t.title === "string" ? t.title : def.title,
      layout: t.layout === "stack" || t.layout === "grid" ? t.layout : def.layout,
      children: children.length > 0 ? children : def.children,
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
    hero: {
      ...defaultSiteContent.hero,
      ...incoming.hero,
      bannerPosition:
        incoming.hero?.bannerPosition === "below-titles" ||
        incoming.hero?.bannerPosition === "above-titles"
          ? incoming.hero.bannerPosition
          : defaultSiteContent.hero.bannerPosition,
    },
    products: {
      ...defaultSiteContent.products,
      ...incoming.products,
      cards: defaultSiteContent.products.cards.map((fallback, i) => {
        const card =
          incoming.products?.cards?.find((c) => c.id === fallback.id) ??
          incoming.products?.cards?.[i];
        if (!card) return fallback;
        return {
          ...fallback,
          ...card,
          id: fallback.id,
          points:
            Array.isArray(card.points) && card.points.length > 0
              ? card.points.map((p) => (typeof p === "string" ? p : ""))
              : [...fallback.points],
          features:
            Array.isArray(card.features) && card.features.length > 0
              ? card.features.map((p) => (typeof p === "string" ? p : ""))
              : [...fallback.features],
          pricingRows: (() => {
            const fromRows = normalizePricingRows(
              (card as { pricingRows?: unknown }).pricingRows,
              [],
            );
            if (fromRows.some((r) => r.plan || r.price)) return fromRows;
            const tiers =
              Array.isArray(card.pricingTiers) && card.pricingTiers.length > 0
                ? card.pricingTiers.map((p) => (typeof p === "string" ? p : ""))
                : fallback.pricingTiers;
            const derived = normalizePricingRows(undefined, tiers);
            if (derived.some((r) => r.plan || r.price)) return derived;
            return [...fallback.pricingRows];
          })(),
          pricingTiers: (() => {
            const fromRows = normalizePricingRows(
              (card as { pricingRows?: unknown }).pricingRows,
              [],
            );
            if (fromRows.some((r) => r.plan || r.price)) {
              return pricingTiersFromRows(fromRows);
            }
            return Array.isArray(card.pricingTiers) &&
              card.pricingTiers.length > 0
              ? card.pricingTiers.map((p) => (typeof p === "string" ? p : ""))
              : [...fallback.pricingTiers];
          })(),
          screenshots:
            Array.isArray(card.screenshots)
              ? card.screenshots
                  .filter((s) => s && typeof s.src === "string" && s.src.length > 0)
                  .map((s) => ({
                    src: s.src,
                    caption: typeof s.caption === "string" ? s.caption : "",
                  }))
              : [...fallback.screenshots],
          screenshotsHeading:
            typeof card.screenshotsHeading === "string"
              ? card.screenshotsHeading
              : fallback.screenshotsHeading,
          // Keep defaults when KV still has empty CTA fields (e.g. Docs signup).
          appHref:
            typeof card.appHref === "string" && card.appHref.trim().length > 0
              ? card.appHref
              : fallback.appHref,
          appCtaLabel:
            typeof card.appCtaLabel === "string" &&
            card.appCtaLabel.trim().length > 0
              ? card.appCtaLabel
              : fallback.appCtaLabel,
          securityHeading:
            typeof card.securityHeading === "string" &&
            card.securityHeading.trim().length > 0
              ? card.securityHeading
              : fallback.securityHeading,
          securityIntro:
            typeof card.securityIntro === "string" &&
            card.securityIntro.trim().length > 0
              ? card.securityIntro
              : fallback.securityIntro,
          securityItems:
            Array.isArray(card.securityItems) && card.securityItems.length > 0
              ? card.securityItems.map((p) => (typeof p === "string" ? p : ""))
              : [...fallback.securityItems],
          securityFootnote:
            typeof card.securityFootnote === "string" &&
            card.securityFootnote.trim().length > 0
              ? card.securityFootnote
              : fallback.securityFootnote,
          privacyHref:
            typeof card.privacyHref === "string" &&
            card.privacyHref.trim().length > 0
              ? card.privacyHref
              : fallback.privacyHref,
          privacyLabel:
            typeof card.privacyLabel === "string" &&
            card.privacyLabel.trim().length > 0
              ? card.privacyLabel
              : fallback.privacyLabel,
        };
      }),
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

export function getProductCard(
  content: SiteContent,
  id: string,
): ProductCardContent | undefined {
  return content.products.cards.find((card) => card.id === id);
}

export function getProductIds(): string[] {
  return defaultSiteContent.products.cards.map((card) => card.id);
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
