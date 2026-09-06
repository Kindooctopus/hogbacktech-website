import Image from "next/image";
import Link from "next/link";
import { capabilities, company, products } from "@/lib/content";

export function HogbackLandingPage() {
  return (
    <div className="min-h-screen bg-[#eef2f6] text-slate-600">
      <HogbackHeader />
      <main className="space-y-24 pb-24">
        <HogbackHero />
        <HogbackProducts />
        <HogbackAbout />
        <HogbackContact />
      </main>
      <HogbackFooter />
    </div>
  );
}

export function HogbackHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[#eef2f6]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#top" aria-label="Hogback Ridge Technologies home" className="shrink-0">
          <Image
            src="/brand/logo-mark.png"
            alt={company.name}
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
          Talk with us
        </a>
      </div>
    </header>
  );
}

export function HogbackHero() {
  return (
    <section id="top" className="scroll-mt-16">
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

            {/* Desktop: product links on the right — sized to fit full tiles inside the banner */}
            <div className="absolute inset-y-2 right-1 z-10 hidden w-[7.25rem] flex-col justify-between gap-1 sm:right-2 md:flex lg:right-3 lg:w-[8.5rem] xl:w-[9.5rem]">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group flex min-h-0 flex-1 items-center justify-end transition duration-200 hover:scale-[1.02] hover:opacity-95"
                  aria-label={`Learn more about ${product.name}`}
                >
                  <Image
                    src={product.tileImage}
                    alt={product.name}
                    width={1024}
                    height={1024}
                    className="h-full w-auto max-w-full object-contain"
                  />
                </Link>
              ))}
            </div>

            {/* Mobile / tablet: compact product links along the bottom */}
            <div className="absolute inset-x-0 bottom-0 z-10 grid grid-cols-5 gap-1 p-1.5 sm:gap-1.5 sm:p-2 md:hidden">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group flex flex-col items-center gap-1 rounded-lg px-0.5 py-1 text-center transition hover:bg-black/25"
                  aria-label={`Learn more about ${product.name}`}
                >
                  <Image
                    src={product.tileImage}
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

      <div className="mx-auto max-w-6xl space-y-5 px-6 pt-6 pb-6 lg:pb-8">
        <h1 className="font-display text-4xl font-semibold leading-tight text-navy-950 sm:text-5xl lg:text-6xl">
          Solid Foundation.
          <br />
          <span className="text-copper-600">Smart Solutions.</span>
        </h1>
        <p className="max-w-xl text-base text-slate-600 sm:text-lg">
          Hogback Ridge Technologies builds software for the people who keep
          communities moving—public safety, fleets, and field operations.
          Grounded in real-world experience, engineered for what comes next.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <a
            href="#products"
            className="rounded-full bg-copper-500 px-6 py-2.5 text-sm font-semibold text-navy-950 hover:bg-copper-400 sm:text-base"
          >
            Explore products
          </a>
          <a
            href="#contact"
            className="rounded-full border border-slate-300 bg-white/70 px-6 py-2.5 text-sm text-navy-950 hover:bg-white sm:text-base"
          >
            Schedule a conversation
          </a>
        </div>

        {/* Capability tiles — desktop/tablet only; on mobile these features are already in the hero image */}
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
    </section>
  );
}


export function HogbackProducts() {
  const productCards = [
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
  ];

  return (
    <section id="products" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl space-y-8 px-6">
        <div className="space-y-3">
          <h2 className="font-display text-3xl font-semibold text-navy-950">
            Products built on the ridge
          </h2>
          <p className="max-w-2xl text-slate-600">
            Each Hogback product is designed to feel like solid ground under
            your feet—clear, dependable, and ready when the work gets real.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {productCards.map((product) => (
            <article
              key={product.name}
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
                  {product.points.map((point) => (
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
                {product.id === "sat" && (
                  <Link
                    href="/apps/sat"
                    className="inline-flex items-center gap-2 text-sm text-navy-800 hover:text-copper-600"
                  >
                    Open live feed
                    <span aria-hidden="true">↗</span>
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HogbackAbout() {
  return (
    <section id="about" className="scroll-mt-24">
      <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="font-display text-3xl font-semibold text-navy-950">
            Built from the ridge line up
          </h2>
          <p>
            Hogback Ridge Technologies is rooted in the Pacific Northwest—where
            steep ridges, real weather, and real work shape how people think
            about reliability. Our software carries that same mindset.
          </p>
          <p>
            We focus on public safety, fleets, and field operations because
            that&apos;s where downtime isn&apos;t an option. Every screen, workflow, and
            integration is designed to support the people doing the work, not
            get in their way.
          </p>
          <p>
            The ridge in our name isn&apos;t just a logo. It&apos;s a reminder:{" "}
            <span className="text-navy-900">
              build on solid ground, and you can go higher.
            </span>
          </p>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-copper-500/15 to-white p-5">
            <h3 className="mb-3 font-display text-lg font-semibold text-navy-950">
              What we care about
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-copper-500" />
                <span>Clarity under pressure for public safety and operations teams</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-copper-500" />
                <span>Long‑term partnerships instead of short‑term projects</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-copper-500" />
                <span>Software that respects budgets, time, and the realities of the field</span>
              </li>
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
              Location
            </p>
            <p className="text-sm text-slate-700">
              Hogback Ridge Technologies · Pacific Northwest · Serving agencies
              and organizations across the region and beyond.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HogbackContact() {
  return (
    <section id="contact" className="scroll-mt-24">
      <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <h2 className="font-display text-3xl font-semibold text-navy-950">
            Start a conversation from solid ground
          </h2>
          <p>
            Whether you&apos;re exploring Hogback Ops, Geo, Docs, Forge—or
            you&apos;re not sure where to start—the first step is a simple
            conversation about what you&apos;re trying to solve.
          </p>
          <p>
            Share a bit about your agency, fleet, or organization, and we&apos;ll
            talk through what a practical, grounded path forward could look
            like.
          </p>

          <div className="space-y-3 text-sm">
            <p className="text-slate-700">
              <span className="text-slate-500">Email:</span>{" "}
              <a
                href={`mailto:${company.emails.developer}`}
                className="text-copper-600 hover:text-copper-500"
              >
                Developer@hogbacktech.com
              </a>
            </p>
            <p className="text-slate-700">
              Website:{" "}
              <a
                href="https://hogbacktech.com"
                className="text-copper-600 hover:text-copper-500"
              >
                hogbacktech.com
              </a>
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_-24px_rgba(10,17,26,0.35)]">
          <p className="text-sm text-slate-600">
            When you reach out, it helps to include:
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-copper-500" />
              <span>Your role and organization</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-copper-500" />
              <span>
                Which areas you&apos;re exploring (Ops, Geo, Docs, Forge, or
                &quot;not sure yet&quot;)
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-copper-500" />
              <span>Any systems you already use that we should be aware of</span>
            </li>
          </ul>

          <div className="pt-2">
            <a
              href={`mailto:${company.email}?subject=Hogback%20Ridge%20Technologies%20Inquiry`}
              className="inline-flex items-center gap-2 rounded-full bg-copper-500 px-5 py-2 text-sm font-semibold text-navy-950 hover:bg-copper-400"
            >
              Email {company.email}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HogbackFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-6 text-xs text-slate-500 sm:flex-row sm:items-center">
        <p>
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span> Hogback Ridge Technologies ·
          Solid Foundation. Smart Solutions.
        </p>
        <p>Brand &amp; site: hogbacktech.com</p>
      </div>
    </footer>
  );
}
