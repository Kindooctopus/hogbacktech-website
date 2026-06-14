export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-24">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950" />
      <div className="absolute inset-0 ridge-pattern opacity-60" />
      <div className="absolute top-1/4 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-amber-500/5 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl flex-col justify-center px-6 py-20">
        <div className="max-w-3xl">
          <p className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-sm text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Software · Applications · Engagement
          </p>

          <h1 className="animate-fade-up animation-delay-100 font-display text-5xl leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
            Technology built on{" "}
            <span className="gradient-text">solid ground</span>
          </h1>

          <p className="animate-fade-up animation-delay-200 mt-6 max-w-xl text-lg leading-relaxed text-slate-400 sm:text-xl">
            Hogback Tech designs and builds custom software, modern applications, and
            digital experiences that connect people and drive meaningful engagement.
          </p>

          <div className="animate-fade-up animation-delay-300 mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full bg-amber-500 px-8 py-3.5 text-sm font-semibold text-slate-950 transition-all hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/25"
            >
              Start a Project
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center rounded-full border border-white/10 px-8 py-3.5 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-white/5"
            >
              Explore Services
            </a>
          </div>
        </div>

        <div className="animate-fade-up animation-delay-400 mt-20 grid grid-cols-2 gap-6 border-t border-white/5 pt-10 sm:grid-cols-4">
          {[
            { value: "Software", label: "Custom-built solutions" },
            { value: "Apps", label: "Web & mobile platforms" },
            { value: "Engage", label: "User-centered design" },
            { value: "Oregon", label: "Pacific Northwest roots" },
          ].map((stat) => (
            <div key={stat.value}>
              <p className="text-lg font-semibold text-white">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
