"use client";

import Link from "next/link";
import { HogbackFooter, HogbackHeader } from "@/components/HogbackLandingPage";
import { company } from "@/lib/content";
import { useSiteContent } from "@/lib/use-site-content";

export default function PrivacyPage() {
  const { content } = useSiteContent();
  const email = content.contact.email || company.email;

  return (
    <div
      className="min-h-screen text-slate-600"
      style={{ backgroundColor: content.design.pageBackground }}
    >
      <HogbackHeader content={content} />
      <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-copper-600"
        >
          <span aria-hidden="true">←</span>
          Back to home
        </Link>

        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-copper-600">
            Legal
          </p>
          <h1 className="font-display text-4xl font-semibold text-navy-950">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500">
            Last updated: September 10, 2026
          </p>
        </header>

        <div className="space-y-6 text-base leading-relaxed text-slate-700">
          <p>
            Hogback Ridge Technologies (&quot;Hogback,&quot; &quot;we,&quot;
            &quot;us&quot;) builds software for agencies and organizations,
            including Hogback Docs. This policy explains what information we
            collect, how we use it, and the choices available to you.
          </p>

          <section className="space-y-2">
            <h2 className="font-display text-xl font-semibold text-navy-950">
              Information we collect
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Contact details you send us (name, organization, email, phone)
                when requesting demos, pricing, or organization signup.
              </li>
              <li>
                Account and organization information needed to operate Hogback
                Docs (organization name/code, admin accounts, and documents your
                administrators upload).
              </li>
              <li>
                Basic technical logs needed to keep services running securely
                (for example access and error logs).
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-xl font-semibold text-navy-950">
              How we use information
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Provide, maintain, and improve Hogback products and support.</li>
              <li>Respond to inquiries and set up customer organizations.</li>
              <li>Protect accounts, systems, and organizational document libraries.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-xl font-semibold text-navy-950">
              What we do not do
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>We do not sell your personal or organizational data.</li>
              <li>We do not use ads or advertising trackers on Hogback Docs.</li>
              <li>
                We do not share customer document libraries with other
                organizations.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-xl font-semibold text-navy-950">
              Storage and security
            </h2>
            <p>
              Hogback Docs uses Google Firebase / Google Cloud and Cloudflare to
              host application services. Data is protected with platform
              encryption at rest and TLS in transit, organization-scoped access
              controls, and administrator-managed uploads. More detail is on the{" "}
              <Link
                href="/products/docs#security"
                className="font-medium text-copper-600 hover:text-copper-500"
              >
                Hogback Docs Security &amp; Privacy
              </Link>{" "}
              section.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-xl font-semibold text-navy-950">
              Contact
            </h2>
            <p>
              Questions about privacy or data handling:{" "}
              <a
                href={`mailto:${email}`}
                className="font-medium text-copper-600 hover:text-copper-500"
              >
                {email}
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <HogbackFooter content={content} />
    </div>
  );
}
