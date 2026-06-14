import Image from "next/image";
import { company, roadmap, techStack, values } from "@/lib/content";

export function About() {
  return (
    <section id="about" className="border-t border-white/5 bg-navy-900/30 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-start gap-16 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-copper-400">About Us</p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-white sm:text-5xl">
              Rooted in the Columbia River Gorge
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate-400">
              {company.name} draws its identity from the geological formations of the Columbia
              River Gorge — strong, enduring, and unmistakable. Each product line reflects this
              rugged foundation.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate-400">
              Based in {company.location}, we combine regional craftsmanship with modern cloud
              architecture to deliver reliable, high-performance solutions for agencies and
              businesses that require precision, speed, and trust.
            </p>

            <div className="mt-8 rounded-xl border border-white/5 bg-navy-950/50 p-6">
              <p className="text-xs uppercase tracking-widest text-copper-400">Vision</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{company.vision}</p>
            </div>
          </div>

          <div className="space-y-6">
            <Image
              src="/brand/logo-mark.png"
              alt="Hogback ridge logo"
              width={500}
              height={400}
              className="w-full rounded-2xl border border-white/5"
            />

            <div className="grid grid-cols-2 gap-4">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="rounded-lg border border-white/5 bg-navy-950/40 px-4 py-4"
                >
                  <p className="font-display text-sm font-semibold text-copper-400">{value.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-copper-400">Technology Stack</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-white/10 bg-navy-950/50 px-4 py-2 text-sm text-slate-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-copper-400">Roadmap</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roadmap.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-copper-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
