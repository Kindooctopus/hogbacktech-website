export const company = {
  name: "Hogback Ridge Technologies",
  shortName: "Hogback",
  domain: "hogbacktech.com",
  email: "hello@hogbacktech.com",
  location: "The Dalles, Oregon",
  tagline: "Solid Foundation. Smart Solutions.",
  motto: "Built on Experience. | Engineered for the Future. | Rooted in Strength.",
  mission:
    "Deliver rugged, reliable, mission-critical software solutions that empower organizations to operate with clarity, speed, and confidence.",
  vision:
    "Become the leading provider of integrated operational platforms for public safety, fleet intelligence, and enterprise workflow systems across the Pacific Northwest and beyond.",
};

export const values = [
  {
    title: "Reliability",
    description: "Our systems must perform when it matters most.",
  },
  {
    title: "Integrity",
    description: "Transparent, honest, and dependable in every engagement.",
  },
  {
    title: "Craftsmanship",
    description: "Precision engineering inspired by the rugged geology of our region.",
  },
  {
    title: "Service",
    description: "Customer-first mindset with a long-term partnership focus.",
  },
];

export const products = [
  {
    id: "ops",
    name: "Hogback Ops",
    subtitle: "Public Safety Operations Platform",
    tileImage: "/brand/products/ops.png",
    description:
      "A unified operations hub for Fire, EMS, and emergency services — consolidating CAD, AVL, ICS, staffing, and protocols into a single platform.",
    features: [
      "CAD ingestion & AVL",
      "ICS tools & weather overlays",
      "Staffing integration",
      "Document libraries & situational feeds",
    ],
    accent: "ops",
    pricing: {
      tiers: ["Core $3,500/yr", "Standard $7,500/yr", "Pro $12,000–$18,000/yr"],
      setup: "$2,000–$6,000",
    },
  },
  {
    id: "geo",
    name: "Hogback Geo",
    subtitle: "Fleet Tracking & Situational Awareness",
    tileImage: "/brand/products/geo.png",
    description:
      "Real-time tracking and intelligence for fleet operators, utilities, public works, and logistics — with Cradlepoint integrations and advanced mapping.",
    features: [
      "Real-time fleet tracking",
      "Geofencing & alerts",
      "Cradlepoint NetCloud integration",
      "Advanced mapping & GIS layers",
    ],
    accent: "geo",
    pricing: {
      tiers: ["Core $1,500/yr", "Standard $3,000/yr", "Pro $6,000/yr"],
      setup: "$1,000–$3,000",
    },
  },
  {
    id: "docs",
    name: "Hogback Docs",
    subtitle: "Document Management & Search",
    tileImage: "/brand/products/docs.png",
    description:
      "A lightweight, high-performance document system with full-text search, categories, workflows, and training modules — without enterprise bloat.",
    features: [
      "Full-text search",
      "Categories & workflows",
      "Training modules",
      "Admin upload & user access",
    ],
    accent: "docs",
    pricing: {
      tiers: ["Core $49/mo", "Standard $99/mo", "Pro $199/mo"],
      setup: "$250–$750",
    },
  },
  {
    id: "forge",
    name: "Hogback Forge",
    subtitle: "Custom Development & Integrations",
    tileImage: "/brand/products/forge.png",
    description:
      "Custom software engineering, integrations, mobile apps, dashboards, GIS tools, and automation workflows tailored to your organization.",
    features: [
      "Custom software & mobile apps",
      "GIS tools & dashboards",
      "System integrations",
      "Automation workflows",
    ],
    accent: "forge",
    pricing: {
      tiers: ["$125–$200/hr", "Projects $5,000–$200,000+"],
      setup: "Scoped per project",
    },
  },
];

export const capabilities = [
  {
    label: "Software Development",
    image: "/brand/tiles/software-transparent.png",
  },
  {
    label: "Mobile App Development",
    image: "/brand/tiles/mobile-app-transparent.png",
  },
  {
    label: "Customized for Your Organization",
    image: "/brand/tiles/customize-transparent.png",
  },
  {
    label: "Secure Platforms",
    image: "/brand/tiles/secure-platform-transparent.png",
  },
  {
    label: "Communication & Development Strategy",
    image: "/brand/tiles/comms-strategy-transparent.png",
  },
];

export const markets = [
  {
    title: "Public Safety",
    description:
      "Fire and EMS agencies face fragmented systems and outdated tools. Hogback Ops consolidates operations into one mission-critical platform.",
  },
  {
    title: "Fleet & Geo Tracking",
    description:
      "Utilities, construction, and public works require real-time tracking and situational awareness. Hogback Geo delivers with advanced mapping.",
  },
  {
    title: "Document Systems",
    description:
      "Organizations need simple, reliable document management without enterprise bloat. Hogback Docs offers a clean, modern alternative.",
  },
  {
    title: "Custom Development",
    description:
      "Tailored integrations and workflows for organizations that need precision engineering. Hogback Forge provides high-value services.",
  },
];

export const techStack = [
  "React & Swift",
  "Leaflet & MapKit",
  "Firebase",
  "Cloud Functions",
  "Cradlepoint NetCloud",
  "CrewSense",
  "Open-Meteo & OpenSky",
];

export const supportPlans = [
  { name: "Basic", price: "$500/yr" },
  { name: "Standard", price: "$1,500/yr" },
  { name: "Premium", price: "$3,000/yr" },
];

export const roadmap = [
  "Android app",
  "Advanced ICS web editor",
  "Multi-department hosting",
  "AI-powered document search",
  "AI incident summaries",
  "Additional GIS layers",
];
