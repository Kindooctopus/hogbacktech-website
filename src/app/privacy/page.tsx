"use client";

import Link from "next/link";
import { HogbackFooter, HogbackHeader } from "@/components/HogbackLandingPage";
import { company, developerMailto } from "@/lib/content";
import { fieldPageStyle } from "@/lib/field-theme";
import { useSiteContent } from "@/lib/use-site-content";

export default function PrivacyPage() {
  const { content } = useSiteContent();
  const email = content.contact.email || company.email;

  return (
    <div
      className="field-surface min-h-screen text-bone/80"
      style={fieldPageStyle(content.design)}
    >
      <HogbackHeader content={content} />
      <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-sage transition hover:text-khaki"
        >
          <span aria-hidden="true">←</span>
          Back to home
        </Link>

        <header className="space-y-3">
          <p className="kicker">
            Legal
          </p>
          <h1 className="font-display text-4xl font-semibold uppercase tracking-wide text-bone">
            Privacy Policy
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-sage">
            Last updated: September 10, 2026
          </p>
        </header>

        <div className="space-y-6 text-base leading-relaxed text-bone/80">
          <p>
            Hogback Ridge Technologies (&quot;Hogback,&quot; &quot;we,&quot;
            &quot;us&quot;) builds software for agencies and organizations,
            including Hogback Docs. This policy explains what information we
            collect, how we use it, and the choices available to you.
          </p>

          <section className="space-y-2">
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-bone">
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
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-bone">
              How we use information
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Provide, maintain, and improve Hogback products and support.</li>
              <li>Respond to inquiries and set up customer organizations.</li>
              <li>Protect accounts, systems, and organizational document libraries.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-bone">
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
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-bone">
              Storage and security
            </h2>
            <p>
              Hogback Docs uses Google Firebase / Google Cloud and Cloudflare to
              host application services. Data is protected with platform
              encryption at rest and TLS in transit, organization-scoped access
              controls, and administrator-managed uploads. More detail is on the{" "}
              <Link
                href="/products/docs#security"
                className="font-medium text-khaki hover:text-bone"
              >
                Hogback Docs Security &amp; Privacy
              </Link>{" "}
              section.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-bone">
              Contact
            </h2>
            <p>
              Questions about privacy or data handling:{" "}
              <a
                href={developerMailto}
                className="font-medium text-khaki hover:text-bone"
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
