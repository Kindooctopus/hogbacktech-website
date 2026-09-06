/** Editable homepage content + design tokens for the site admin. */

export type ProductCardContent = {
  id: string;
  name: string;
  badge: string;
  description: string;
  points: [string, string, string];
};

export type SiteContent = {
  version: 1;
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
  design: {
    pageBackground: string;
    sectionSpacingPx: number;
    cardGapPx: number;
    copper: string;
    navy: string;
  };
};

export const defaultSiteContent: SiteContent = {
  version: 1,
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
  design: {
    pageBackground: "#eef2f6",
    sectionSpacingPx: 96,
    cardGapPx: 24,
    copper: "#b87333",
    navy: "#0a111a",
  },
};

export function mergeSiteContent(partial: unknown): SiteContent {
  if (!partial || typeof partial !== "object") return defaultSiteContent;
  const incoming = partial as Partial<SiteContent>;
  return {
    ...defaultSiteContent,
    ...incoming,
    version: 1,
    header: { ...defaultSiteContent.header, ...incoming.header },
    hero: { ...defaultSiteContent.hero, ...incoming.hero },
    products: {
      ...defaultSiteContent.products,
      ...incoming.products,
      cards:
        incoming.products?.cards?.length === 5
          ? incoming.products.cards.map((card, i) => ({
              ...defaultSiteContent.products.cards[i],
              ...card,
              points: [
                card.points?.[0] ?? defaultSiteContent.products.cards[i].points[0],
                card.points?.[1] ?? defaultSiteContent.products.cards[i].points[1],
                card.points?.[2] ?? defaultSiteContent.products.cards[i].points[2],
              ] as [string, string, string],
            }))
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
    design: { ...defaultSiteContent.design, ...incoming.design },
  };
}
