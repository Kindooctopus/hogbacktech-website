import Image from "next/image";
import Link from "next/link";
import { company, products } from "@/lib/content";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-navy-900">
      <div className="topo-bg mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="inline-block rounded-lg bg-[#f2f0ec] px-4 py-3">
              <Image
                src="/brand/logo-full.png"
                alt={company.name}
                width={280}
                height={280}
                className="h-auto w-44"
              />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">{company.tagline}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-copper-400">Products</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              {products.map((p) => (
                <li key={p.id}>
                  <a href={`#products`} className="transition-colors hover:text-white">
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-copper-400">Company</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li><a href="#about" className="hover:text-white">About</a></li>
              <li><a href="#markets" className="hover:text-white">Markets</a></li>
              <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
              <li><a href="#contact" className="hover:text-white">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-copper-400">Contact</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>{company.location}</li>
              <li>
                <a href={`mailto:${company.email}`} className="hover:text-copper-400">
                  {company.email}
                </a>
              </li>
              <li>
                <Link href={`https://${company.domain}`} className="hover:text-copper-400">
                  {company.domain}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-8 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-500">{company.motto}</p>
          <p className="mt-4 text-sm text-slate-600">
            &copy; {year} {company.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
