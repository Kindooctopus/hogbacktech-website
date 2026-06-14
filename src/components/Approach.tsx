const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "We start by understanding your goals, users, and constraints. Every great product begins with listening.",
  },
  {
    number: "02",
    title: "Design",
    description:
      "Architecture, wireframes, and prototypes take shape. We align on the vision before writing a line of code.",
  },
  {
    number: "03",
    title: "Develop",
    description:
      "Iterative development with regular check-ins. You see progress early and often, with room to refine.",
  },
  {
    number: "04",
    title: "Deliver",
    description:
      "Launch, monitor, and optimize. We stay engaged to ensure your software performs and evolves with your needs.",
  },
];

export function Approach() {
  return (
    <section id="approach" className="relative border-y border-white/5 bg-slate-900/30 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
              Our Approach
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-white sm:text-5xl">
              From concept to launch, together
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-400">
              We believe the best technology comes from close collaboration. Our process
              keeps you involved at every stage — transparent, agile, and focused on
              outcomes that matter.
            </p>
            <div className="mt-8 rounded-2xl border border-white/5 bg-slate-950/50 p-6">
              <p className="font-display text-2xl text-white">
                &ldquo;Like the ridge we&apos;re named for, we build things that endure.&rdquo;
              </p>
              <p className="mt-3 text-sm text-slate-500">— Hogback Tech</p>
            </div>
          </div>

          <div className="space-y-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex gap-6 rounded-xl border border-white/5 bg-slate-950/30 p-6 transition-colors hover:border-amber-500/10"
              >
                <span className="font-display text-3xl text-amber-500/40">{step.number}</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
