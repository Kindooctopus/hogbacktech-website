"use client";

import { FormEvent, useState } from "react";
import { trackContactConversion } from "@/lib/google-ads";
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

    trackContactConversion();
    window.location.href = mailto;
    setSubmitted(true);
  }

  const inputClass =
    "mt-2 w-full border-0 border-b border-khaki/40 bg-transparent px-0 py-2.5 text-bone outline-none transition placeholder:text-sage/80 focus:border-khaki";

  return (
    <section
      id="signup"
      className="scroll-mt-24 space-y-8 border-t border-khaki/25 pt-12"
    >
      <div className="max-w-2xl space-y-3">
        {copy.eyebrow.trim() ? (
          <p className="kicker">
            {copy.eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-3xl font-semibold uppercase tracking-wide text-bone">
          {copy.title}
        </h2>
        {copy.body.trim() ? (
          <p className="text-sm leading-relaxed text-bone/75 sm:text-base">
            {copy.body}
          </p>
        ) : null}
      </div>

      <div className="max-w-2xl">
        {submitted ? (
          <div className="space-y-3 border-l-2 border-khaki py-2 pl-5">
            <h3 className="font-display text-xl font-semibold uppercase tracking-wide text-bone">
              {copy.successTitle}
            </h3>
            <p className="text-sm text-bone/75">
              {copy.successBody}{" "}
              <a
                href={`mailto:${email}`}
                className="font-medium text-khaki hover:text-bone"
              >
                {email}
              </a>
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-sm font-medium text-khaki underline-offset-2 hover:underline"
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
                  className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-sage"
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
                  className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-sage"
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
                  className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-sage"
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
                  className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-sage"
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
                  className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-sage"
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
              className="inline-flex items-center justify-center rounded-md bg-khaki px-6 py-3 text-sm font-semibold tracking-wide text-ink transition hover:brightness-110"
            >
              {copy.submitLabel}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
