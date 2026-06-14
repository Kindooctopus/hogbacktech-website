"use client";

import { FormEvent, useState } from "react";

export function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contact" className="relative border-t border-white/5 bg-slate-900/30 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
              Get in Touch
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-white sm:text-5xl">
              Let&apos;s build something together
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Have a project in mind or want to learn more about our services? We&apos;d
              love to hear from you.
            </p>

            <div className="mt-10 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                    <path
                      d="M3 8L10.89 13.26C11.55 13.67 12.45 13.67 13.11 13.26L21 8M5 19H19C20.1 19 21 18.1 21 17V7C21 5.9 20.1 5 19 5H5C3.9 5 3 5.9 3 7V17C3 18.1 3.9 19 5 19Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-white">Email</p>
                  <a
                    href="mailto:hello@hogbacktech.com"
                    className="text-slate-400 transition-colors hover:text-amber-400"
                  >
                    hello@hogbacktech.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                    <path
                      d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61 4.79 5.5 7.5 5.5C9.24 5.5 10.78 6.46 11.5 7.88C12.22 6.46 13.76 5.5 15.5 5.5C18.21 5.5 21 7.61 21 10Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-white">Location</p>
                  <p className="text-slate-400">The Dalles, Oregon 97058</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-8">
            {submitted ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden="true">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-white">Message received!</h3>
                <p className="mt-2 text-slate-400">
                  Thank you for reaching out. We&apos;ll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 outline-none transition-colors focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 outline-none transition-colors focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-300">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 outline-none transition-colors focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
                    placeholder="Tell us about your project..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-full bg-amber-500 py-3.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400"
                >
                  Send Message
                </button>
                <p className="text-center text-xs text-slate-500">
                  Or email us directly at{" "}
                  <a href="mailto:hello@hogbacktech.com" className="text-amber-400 hover:underline">
                    hello@hogbacktech.com
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
