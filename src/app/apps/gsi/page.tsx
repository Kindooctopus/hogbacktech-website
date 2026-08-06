"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Legacy /apps/gsi route — the fire-layers map is now the Geo map at /apps/geo.
 */
export default function GsiToGeoRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/apps/geo");
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-navy-950 px-6 text-center text-slate-300">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-copper-400">
        Hogback Geo
      </p>
      <h1 className="font-display text-2xl font-semibold text-white">
        Opening the Geo map…
      </h1>
      <p className="max-w-md text-sm text-slate-400">
        The fire-layers map is now the Hogback Geo map.
      </p>
      <Link
        href="/apps/geo"
        className="rounded-full bg-copper-500 px-5 py-2 text-sm font-semibold text-navy-950 hover:bg-copper-400"
      >
        Open Geo map
      </Link>
    </div>
  );
}
