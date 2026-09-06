"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Legacy product page — wildfire layers ship in Hogback Geo / the Geo map. */
export default function GsiProductRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/products/geo");
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#0a111a] px-6 text-center text-slate-300">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-copper-400">
        Hogback Geo
      </p>
      <h1 className="font-display text-2xl font-semibold text-white">
        Redirecting to Hogback Geo…
      </h1>
      <p className="max-w-md text-sm text-slate-400">
        Fire layers and situational overlays are part of the Geo map.
      </p>
      <Link
        href="/products/geo"
        className="rounded-full bg-copper-500 px-5 py-2 text-sm font-semibold text-navy-950 hover:bg-copper-400"
      >
        View Hogback Geo
      </Link>
    </div>
  );
}
