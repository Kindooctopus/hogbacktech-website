import type { ReactNode } from "react";

/** Dusk panel with the corner ticks, hash rule, and accent bar used in Hogback Geo. */
export function TacticalFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`tactical-frame ${className}`}>
      <span className="tactical-hash" aria-hidden="true" />
      <span className="tactical-corner tl" aria-hidden="true" />
      <span className="tactical-corner tr" aria-hidden="true" />
      <span className="tactical-corner bl" aria-hidden="true" />
      <span className="tactical-corner br" aria-hidden="true" />
      <div className="relative">{children}</div>
    </div>
  );
}
