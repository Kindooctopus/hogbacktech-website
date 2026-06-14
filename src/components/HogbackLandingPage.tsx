import Image from "next/image";

export function HogbackLandingPage() {
  return (
    <div className="min-h-screen bg-[#0a111a] text-slate-400">
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
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0a111a]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:px-6">
        <a href="#top" aria-label="Hogback Ridge Technologies home" className="flex items-center gap-2">
          <img
            src="/brand/ridge-icon.svg"
            alt=""
            width={32}
            height={22}
            className="h-5 w-7 shrink-0"
          />
          <span className="font-display text-sm font-semibold tracking-wide text-white">
            HOGBACK
            <span className="ml-1 text-[10px] font-normal tracking-[0.2em] text-copper-500 sm:text-xs">
              TECH
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#products" className="transition-colors hover:text-white">
            Products
          </a>
          <a href="#about" className="transition-colors hover:text-white">
            About
          </a>
          <a href="#contact" className="transition-colors hover:text-white">
            Contact
          </a>
        </nav>

        <a
          href="#contact"
          className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/5"
        >
          Talk with us
        </a>
      </div>
    </header>
  );
}

export function HogbackHero() {
  return (
    <section id="top" className="scroll-mt-16 pt-6">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.25em] text-copper-500">
            The Dalles, Oregon · hogbacktech.com
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Solid Foundation.
            <br />
            <span className="text-copper-500">Smart Solutions.</span>
          </h1>
          <p className="max-w-xl text-base text-slate-400 sm:text-lg">
            Hogback Ridge Technologies builds software for the people who keep
            communities moving—public safety, fleets, and field operations.
            Grounded in real‑world experience, engineered for what comes next.
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
              className="rounded-full border border-white/15 px-6 py-2.5 text-sm text-white hover:bg-white/5 sm:text-base"
            >
              Schedule a conversation
            </a>
          </div>

          <div className="flex flex-wrap gap-6 pt-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-copper-500" />
              <span>Built for public safety &amp; operations</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-copper-500" />
              <span>Pacific Northwest owned &amp; operated</span>
            </div>
          </div>
        </div>

        <div className="relative lg:max-w-md lg:justify-self-end">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <Image
              src="/brand/hero-ridge.png"
              alt="Hogback Ridge Technologies hero"
              width={1024}
              height={1024}
              className="h-auto max-h-56 w-full object-contain object-top sm:max-h-64"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HogbackProducts() {
  const products = [
    {
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
  ];

  return (
    <section id="products" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl space-y-8 px-6">
        <div className="space-y-3">
          <h2 className="font-display text-3xl font-semibold text-white">
            Products built on the ridge
          </h2>
          <p className="max-w-2xl text-slate-400">
            Each Hogback product is designed to feel like solid ground under
            your feet—clear, dependable, and ready when the work gets real.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {products.map((product) => (
            <article
              key={product.name}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-semibold text-white">
                    {product.name}
                  </h3>
                  <span className="rounded-full border border-copper-500/40 bg-copper-500/10 px-3 py-1 text-xs font-medium text-copper-500">
                    {product.badge}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{product.description}</p>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-400">
                  {product.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-copper-500" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 text-sm text-copper-500 hover:text-copper-400"
                >
                  Talk about {product.name}
                  <span aria-hidden="true">↗</span>
                </a>
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
          <h2 className="font-display text-3xl font-semibold text-white">
            Built from the ridge line up
          </h2>
          <p>
            Hogback Ridge Technologies is based in The Dalles, Oregon—where
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
            <span className="text-slate-200">
              build on solid ground, and you can go higher.
            </span>
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="mb-3 font-display text-lg font-semibold text-white">
              What we care about
            </h3>
            <ul className="space-y-2 text-sm">
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

          <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-copper-500/15 to-copper-500/5 p-5">
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-copper-300">
              Location
            </p>
            <p className="text-sm text-slate-200">
              Hogback Ridge Technologies · The Dalles, Oregon · Serving agencies
              and organizations across the Pacific Northwest and beyond.
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
          <h2 className="font-display text-3xl font-semibold text-white">
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
            <p className="text-slate-300">
              Email:{" "}
              <a
                href="mailto:hello@hogbacktech.com"
                className="text-copper-500 hover:text-copper-400"
              >
                hello@hogbacktech.com
              </a>
            </p>
            <p className="text-slate-300">
              Website:{" "}
              <a
                href="https://hogbacktech.com"
                className="text-copper-500 hover:text-copper-400"
              >
                hogbacktech.com
              </a>
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-300">
            When you reach out, it helps to include:
          </p>
          <ul className="space-y-2 text-sm">
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
              href="mailto:hello@hogbacktech.com?subject=Hogback%20Ridge%20Technologies%20Inquiry"
              className="inline-flex items-center gap-2 rounded-full bg-copper-500 px-5 py-2 text-sm font-semibold text-navy-950 hover:bg-copper-400"
            >
              Email Hogback Ridge Technologies
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
    <footer className="mt-16 border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-6 text-xs text-slate-500 sm:flex-row sm:items-center">
        <p>
          © {new Date().getFullYear()} Hogback Ridge Technologies · The Dalles,
          Oregon · Solid Foundation. Smart Solutions.
        </p>
        <p>Brand &amp; site: hogbacktech.com</p>
      </div>
    </footer>
  );
}
