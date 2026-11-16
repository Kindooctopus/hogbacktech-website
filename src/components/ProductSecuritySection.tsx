import Link from "next/link";
import type { ProductCardContent } from "@/lib/site-content";

export function ProductSecuritySection({
  product,
  eyebrow,
}: {
  product: ProductCardContent;
  eyebrow?: string;
}) {
  const items = product.securityItems.filter((item) => item.trim().length > 0);
  if (!product.securityHeading.trim() || items.length === 0) return null;

  return (
    <section
      id="security"
      className="scroll-mt-24 space-y-6 border-t border-khaki/25 pt-12"
    >
      <div className="max-w-3xl space-y-3">
        <p className="kicker">
          {eyebrow?.trim() || "Security"}
        </p>
        <h2 className="font-display text-3xl font-semibold uppercase tracking-wide text-bone">
          {product.securityHeading}
        </h2>
        {product.securityIntro.trim() ? (
          <p className="text-sm leading-relaxed text-bone/75 sm:text-base">
            {product.securityIntro}
          </p>
        ) : null}
      </div>

      <ul className="max-w-3xl space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 border-b border-khaki/15 pb-3 text-sm leading-relaxed text-bone/80 last:border-b-0"
          >
            <span
              aria-hidden="true"
              className="mt-2 h-1 w-1 shrink-0 rounded-full bg-khaki"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 text-sm">
        {product.privacyHref.trim() && product.privacyLabel.trim() ? (
          <Link
            href={product.privacyHref}
            className="font-medium text-khaki hover:text-bone"
          >
            {product.privacyLabel}
          </Link>
        ) : null}
        {product.securityFootnote.trim() ? (
          <p className="max-w-3xl text-sage">{product.securityFootnote}</p>
        ) : null}
      </div>
    </section>
  );
}
