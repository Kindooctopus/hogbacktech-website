const services = [
  {
    title: "Software Development",
    description:
      "End-to-end custom software solutions tailored to your business needs. From architecture to deployment, we build systems that scale.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path
          d="M16 18L22 12L16 6M8 6L2 12L8 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    features: ["Custom platforms", "API design", "Cloud infrastructure", "Legacy modernization"],
  },
  {
    title: "Applications",
    description:
      "Beautiful, performant web and mobile applications that users love. We focus on intuitive interfaces and reliable functionality.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M12 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    features: ["Web applications", "Mobile apps", "Progressive web apps", "Cross-platform"],
  },
  {
    title: "Engagement",
    description:
      "Digital experiences that foster connection and drive action. We help you reach, retain, and delight your audience.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path
          d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21M23 21V19C22.99 17.13 21.73 15.52 20 15.13M16 3.13C17.73 3.52 18.99 5.13 19 7C18.99 8.87 17.73 10.48 16 10.87M9 11C11.21 11 13 9.21 13 7C13 4.79 11.21 3 9 3C6.79 3 5 4.79 5 7C5 9.21 6.79 11 9 11Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    features: ["User experience design", "Analytics & insights", "Community platforms", "Content strategy"],
  },
];

export function Services() {
  return (
    <section id="services" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
            What We Do
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-white sm:text-5xl">
            Three pillars of digital excellence
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Whether you need a full platform, a polished application, or a strategy to
            deepen user engagement, Hogback Tech delivers.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className="card-glow group rounded-2xl border border-white/5 bg-slate-900/50 p-8 transition-colors hover:border-amber-500/20 hover:bg-slate-900/80"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 transition-colors group-hover:bg-amber-500/20">
                {service.icon}
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">{service.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {service.description}
              </p>
              <ul className="mt-6 space-y-2">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-500">
                    <svg
                      className="h-4 w-4 shrink-0 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
