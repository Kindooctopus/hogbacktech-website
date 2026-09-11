"use client";

import { FormEvent, useState } from "react";
import type { ProductSignupContent } from "@/lib/site-content";

type DocsSignupFormProps = {
  email: string;
  copy: ProductSignupContent;
};

export function DocsSignupForm({ email, copy }: DocsSignupFormProps) {
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
      copy.mailtoIntro,
      "",
      `${copy.organizationLabel}: ${organization}`,
      `${copy.contactLabel}: ${contactName}`,
      `${copy.emailLabel}: ${contactEmail}`,
      `${copy.phoneLabel}: ${phone || "—"}`,
      notes ? `${copy.notesLabel}: ${notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const mailto = `mailto:${email}?subject=${encodeURIComponent(
      copy.mailtoSubject,
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setSubmitted(true);
  }

  const inputClass =
    "mt-2 w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2.5 text-navy-950 outline-none transition focus:border-copper-500";

  return (
    <section
      id="signup"
      className="scroll-mt-24 space-y-8 border-t border-slate-200 pt-12"
    >
      <div className="max-w-2xl space-y-3">
        {copy.eyebrow.trim() ? (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-600">
            {copy.eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-2xl font-semibold text-navy-950 sm:text-3xl">
          {copy.title}
        </h2>
        {copy.body.trim() ? (
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            {copy.body}
          </p>
        ) : null}
      </div>

      <div className="max-w-2xl">
        {submitted ? (
          <div className="space-y-3 border-l-2 border-copper-500 pl-5 py-2">
            <h3 className="font-display text-xl font-semibold text-navy-950">
              {copy.successTitle}
            </h3>
            <p className="text-sm text-slate-600">
              {copy.successBody}{" "}
              <a
                href={`mailto:${email}`}
                className="font-medium text-copper-600 hover:text-copper-500"
              >
                {email}
              </a>
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-sm font-medium text-navy-800 underline-offset-2 hover:underline"
            >
              {copy.editAgainLabel}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="docs-org"
                  className="block text-sm font-medium text-navy-950"
                >
                  {copy.organizationLabel}
                </label>
                <input
                  id="docs-org"
                  name="organization"
                  required
                  className={inputClass}
                  placeholder={copy.organizationPlaceholder}
                />
              </div>
              <div>
                <label
                  htmlFor="docs-contact"
                  className="block text-sm font-medium text-navy-950"
                >
                  {copy.contactLabel}
                </label>
                <input
                  id="docs-contact"
                  name="contactName"
                  required
                  className={inputClass}
                  placeholder={copy.contactPlaceholder}
                />
              </div>
              <div>
                <label
                  htmlFor="docs-email"
                  className="block text-sm font-medium text-navy-950"
                >
                  {copy.emailLabel}
                </label>
                <input
                  id="docs-email"
                  name="contactEmail"
                  type="email"
                  required
                  className={inputClass}
                  placeholder={copy.emailPlaceholder}
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="docs-phone"
                  className="block text-sm font-medium text-navy-950"
                >
                  {copy.phoneLabel}
                </label>
                <input
                  id="docs-phone"
                  name="phone"
                  type="tel"
                  className={inputClass}
                  placeholder={copy.phonePlaceholder}
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="docs-notes"
                  className="block text-sm font-medium text-navy-950"
                >
                  {copy.notesLabel}
                </label>
                <textarea
                  id="docs-notes"
                  name="notes"
                  rows={3}
                  className={`${inputClass} resize-none`}
                  placeholder={copy.notesPlaceholder}
                />
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-copper-500 px-6 py-3 text-sm font-semibold text-navy-950 transition hover:bg-copper-400"
            >
              {copy.submitLabel}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
