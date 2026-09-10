import Link from "next/link";
import type { ProductCardContent } from "@/lib/site-content";

export function ProductSecuritySection({
  product,
}: {
  product: ProductCardContent;
}) {
  const items = product.securityItems.filter((item) => item.trim().length > 0);
  if (!product.securityHeading.trim() || items.length === 0) return null;

  return (
    <section
      id="security"
      className="scroll-mt-24 space-y-5 border-t border-slate-200 pt-10"
    >
      <div className="max-w-3xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-copper-600">
          Trust
        </p>
        <h2 className="font-display text-2xl font-semibold text-navy-950 sm:text-3xl">
          {product.securityHeading}
        </h2>
        {product.securityIntro.trim() ? (
          <p className="text-sm text-slate-600 sm:text-base">
            {product.securityIntro}
          </p>
        ) : null}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-[0_10px_30px_-28px_rgba(10,17,26,0.4)]"
          >
            <span
              aria-hidden="true"
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-copper-500"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        {product.privacyHref.trim() && product.privacyLabel.trim() ? (
          <Link
            href={product.privacyHref}
            className="font-medium text-copper-600 hover:text-copper-500"
          >
            {product.privacyLabel}
            <span aria-hidden="true"> ↗</span>
          </Link>
        ) : null}
        {product.securityFootnote.trim() ? (
          <p className="max-w-3xl text-slate-500">{product.securityFootnote}</p>
        ) : null}
      </div>
    </section>
  );
}
