"use client";

import { FormEvent, useState } from "react";

type DocsSignupFormProps = {
  email: string;
};

export function DocsSignupForm({ email }: DocsSignupFormProps) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const organization = String(data.get("organization") || "").trim();
    const contactName = String(data.get("contactName") || "").trim();
    const contactEmail = String(data.get("contactEmail") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const notes = String(data.get("notes") || "").trim();

    const body = [
      "I'd like to sign up my organization for Hogback Docs.",
      "",
      `Organization name: ${organization}`,
      `Contact name: ${contactName}`,
      `Email: ${contactEmail}`,
      `Phone: ${phone || "—"}`,
      notes ? `Notes: ${notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const mailto = `mailto:${email}?subject=${encodeURIComponent(
      "Sign up organization for Hogback Docs",
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setSubmitted(true);
  }

  return (
    <section
      id="signup"
      className="scroll-mt-24 space-y-6 border-t border-slate-200 pt-10"
    >
      <div className="max-w-2xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-copper-600">
          Get started
        </p>
        <h2 className="font-display text-2xl font-semibold text-navy-950 sm:text-3xl">
          Sign up your organization
        </h2>
        <p className="text-sm text-slate-600 sm:text-base">
          Tell us about your agency or company. We&apos;ll create your Hogback
          Docs organization and send you an organization code to sign in.
        </p>
      </div>

      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_-24px_rgba(10,17,26,0.35)] sm:p-8">
        {submitted ? (
          <div className="space-y-3 py-6 text-center">
            <h3 className="font-display text-xl font-semibold text-navy-950">
              Request ready to send
            </h3>
            <p className="text-sm text-slate-600">
              Your email app should open with the signup details filled in. If
              it doesn&apos;t, email{" "}
              <a
                href={`mailto:${email}`}
                className="font-medium text-copper-600 hover:text-copper-500"
              >
                {email}
              </a>{" "}
              and we&apos;ll get your organization set up.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-sm font-medium text-navy-800 underline-offset-2 hover:underline"
            >
              Edit and try again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="docs-org"
                  className="block text-sm font-medium text-navy-950"
                >
                  Organization name
                </label>
                <input
                  id="docs-org"
                  name="organization"
                  required
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-[#f8fafc] px-4 py-3 text-navy-950 outline-none focus:border-copper-500/60"
                  placeholder="Agency, department, or company"
                />
              </div>
              <div>
                <label
                  htmlFor="docs-contact"
                  className="block text-sm font-medium text-navy-950"
                >
                  Contact name
                </label>
                <input
                  id="docs-contact"
                  name="contactName"
                  required
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-[#f8fafc] px-4 py-3 text-navy-950 outline-none focus:border-copper-500/60"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  htmlFor="docs-email"
                  className="block text-sm font-medium text-navy-950"
                >
                  Work email
                </label>
                <input
                  id="docs-email"
                  name="contactEmail"
                  type="email"
                  required
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-[#f8fafc] px-4 py-3 text-navy-950 outline-none focus:border-copper-500/60"
                  placeholder="you@agency.gov"
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="docs-phone"
                  className="block text-sm font-medium text-navy-950"
                >
                  Phone{" "}
                  <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  id="docs-phone"
                  name="phone"
                  type="tel"
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-[#f8fafc] px-4 py-3 text-navy-950 outline-none focus:border-copper-500/60"
                  placeholder="(555) 555-5555"
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="docs-notes"
                  className="block text-sm font-medium text-navy-950"
                >
                  Anything we should know{" "}
                  <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <textarea
                  id="docs-notes"
                  name="notes"
                  rows={3}
                  className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-[#f8fafc] px-4 py-3 text-navy-950 outline-none focus:border-copper-500/60"
                  placeholder="Team size, document types, go-live timing…"
                />
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-copper-500 px-6 py-3 text-sm font-semibold text-navy-950 hover:bg-copper-400 sm:w-auto"
            >
              Submit signup request
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
