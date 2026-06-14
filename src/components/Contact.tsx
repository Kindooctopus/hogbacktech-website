"use client";

import { FormEvent, useState } from "react";
import { company, products } from "@/lib/content";

export function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contact" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-copper-400">Get Started</p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-white sm:text-5xl">
              Ready to build on solid ground?
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Request a demo, get pricing for your organization, or discuss a custom project with
              our team.
            </p>

            <div className="mt-10 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-copper-500/10 text-copper-400">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M3 8L10.89 13.26C11.55 13.67 12.45 13.67 13.11 13.26L21 8M5 19H19C20.1 19 21 18.1 21 17V7C21 5.9 20.1 5 19 5H5C3.9 5 3 5.9 3 7V17C3 18.1 3.9 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-white">Email</p>
                  <a href={`mailto:${company.email}`} className="text-slate-400 hover:text-copper-400">
                    {company.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-copper-500/10 text-copper-400">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61 4.79 5.5 7.5 5.5C9.24 5.5 10.78 6.46 11.5 7.88C12.22 6.46 13.76 5.5 15.5 5.5C18.21 5.5 21 7.61 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-white">Location</p>
                  <p className="text-slate-400">{company.location}</p>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-xl border border-white/5 bg-navy-900/30 p-6">
              <p className="text-xs uppercase tracking-widest text-slate-500">Interested in</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {products.map((p) => (
                  <span key={p.id} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-navy-900/50 p-8">
            {submitted ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-docs/15 text-docs">
                  <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">Message received</h3>
                <p className="mt-2 text-slate-400">We&apos;ll be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300">Name</label>
                    <input id="name" name="name" required className="mt-2 w-full rounded-lg border border-white/10 bg-navy-950 px-4 py-3 text-white outline-none focus:border-copper-500/50" placeholder="Your name" />
                  </div>
                  <div>
                    <label htmlFor="org" className="block text-sm font-medium text-slate-300">Organization</label>
                    <input id="org" name="org" className="mt-2 w-full rounded-lg border border-white/10 bg-navy-950 px-4 py-3 text-white outline-none focus:border-copper-500/50" placeholder="Agency or company" />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email</label>
                  <input id="email" name="email" type="email" required className="mt-2 w-full rounded-lg border border-white/10 bg-navy-950 px-4 py-3 text-white outline-none focus:border-copper-500/50" placeholder="you@agency.gov" />
                </div>
                <div>
                  <label htmlFor="product" className="block text-sm font-medium text-slate-300">Product interest</label>
                  <select id="product" name="product" className="mt-2 w-full rounded-lg border border-white/10 bg-navy-950 px-4 py-3 text-white outline-none focus:border-copper-500/50">
                    <option value="">Select a product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — {p.subtitle}</option>
                    ))}
                    <option value="general">General inquiry</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-300">Message</label>
                  <textarea id="message" name="message" required rows={4} className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-navy-950 px-4 py-3 text-white outline-none focus:border-copper-500/50" placeholder="Tell us about your organization and needs..." />
                </div>
                <button type="submit" className="w-full rounded-full bg-copper-500 py-3.5 text-sm font-semibold text-navy-950 hover:bg-copper-400">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
