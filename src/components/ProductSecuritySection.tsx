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
      className="scroll-mt-24 space-y-6 border-t border-slate-200 pt-12"
    >
      <div className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-600">
          {eyebrow?.trim() || "Security"}
        </p>
        <h2 className="font-display text-2xl font-semibold text-navy-950 sm:text-3xl">
          {product.securityHeading}
        </h2>
        {product.securityIntro.trim() ? (
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            {product.securityIntro}
          </p>
        ) : null}
      </div>

      <ul className="max-w-3xl space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 border-b border-slate-100 pb-3 text-sm leading-relaxed text-slate-700 last:border-b-0"
          >
            <span
              aria-hidden="true"
              className="mt-2 h-1 w-1 shrink-0 rounded-full bg-copper-500"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 text-sm">
        {product.privacyHref.trim() && product.privacyLabel.trim() ? (
          <Link
            href={product.privacyHref}
            className="font-medium text-copper-600 hover:text-copper-500"
          >
            {product.privacyLabel}
          </Link>
        ) : null}
        {product.securityFootnote.trim() ? (
          <p className="max-w-3xl text-slate-500">{product.securityFootnote}</p>
        ) : null}
      </div>
    </section>
  );
}
