export function About() {
  return (
    <section id="about" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-slate-800 to-slate-900">
              <div className="flex h-full flex-col items-center justify-center p-8">
                <svg
                  viewBox="0 0 200 120"
                  className="w-full max-w-xs text-slate-600"
                  aria-hidden="true"
                >
                  <path
                    d="M0 100 L30 70 L60 80 L90 40 L120 55 L150 25 L180 45 L200 35 L200 120 L0 120 Z"
                    fill="currentColor"
                    opacity="0.3"
                  />
                  <path
                    d="M0 100 L30 70 L60 80 L90 40 L120 55 L150 25 L180 45 L200 35"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                  <circle cx="150" cy="25" r="8" fill="#f59e0b" opacity="0.8" />
                </svg>
                <p className="mt-6 text-center text-sm text-slate-500">
                  Columbia River Gorge, Oregon
                </p>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 rounded-xl border border-amber-500/20 bg-slate-950 px-6 py-4 shadow-xl">
              <p className="text-2xl font-semibold text-amber-400">Est. 2026</p>
              <p className="text-sm text-slate-500">The Dalles, OR</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
              About Hogback Tech
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-white sm:text-5xl">
              Rooted in the Pacific Northwest
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-400">
              Named after the iconic Hogback ridge overlooking the Columbia River Gorge,
              Hogback Tech was founded with a simple mission: build technology that
              stands the test of time.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate-400">
              Based in The Dalles, Oregon, we combine regional craftsmanship with modern
              engineering practices. We partner with businesses and organizations that
              value quality software, thoughtful design, and genuine user engagement.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                "Quality-first engineering",
                "Transparent communication",
                "User-centered design",
                "Long-term partnerships",
              ].map((value) => (
                <div
                  key={value}
                  className="flex items-center gap-2 rounded-lg border border-white/5 bg-slate-900/30 px-4 py-3 text-sm text-slate-300"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  {value}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
