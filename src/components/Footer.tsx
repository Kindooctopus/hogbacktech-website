import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-slate-950">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 text-slate-950"
                  aria-hidden="true"
                >
                  <path
                    d="M3 20L8 12L12 16L16 8L21 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-semibold text-white">
                Hogback<span className="text-amber-400">Tech</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Building software, applications, and engagement experiences from the Columbia River Gorge.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Services
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>Custom Software Development</li>
              <li>Web & Mobile Applications</li>
              <li>Digital Engagement Strategy</li>
              <li>Technical Consulting</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Contact
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>The Dalles, Oregon</li>
              <li>
                <a
                  href="mailto:hello@hogbacktech.com"
                  className="transition-colors hover:text-amber-400"
                >
                  hello@hogbacktech.com
                </a>
              </li>
              <li>
                <Link href="https://hogbacktech.com" className="transition-colors hover:text-amber-400">
                  hogbacktech.com
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-sm text-slate-500 sm:flex-row">
          <p>&copy; {year} Hogback Tech. All rights reserved.</p>
          <p className="text-slate-600">Built with purpose in Oregon</p>
        </div>
      </div>
    </footer>
  );
}
