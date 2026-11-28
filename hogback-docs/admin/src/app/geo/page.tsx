"use client";

import Link from "next/link";
import { RequireAdmin } from "@/components/RequireAdmin";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui";

function MapFrame() {
  return (
    <iframe
      title="Hogback Map Admin"
      src="/geo-map/"
      className="h-full w-full border-0 bg-[#0c1210]"
      allow="fullscreen"
    />
  );
}

export default function GeoPage() {
  const { logOut, user } = useAuth();

  return (
    <RequireAdmin>
      <div className="flex h-screen flex-col bg-[#0c1210]">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#121a16] px-4 py-3">
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold text-white">Hogback Geo</p>
            <p className="truncate text-xs text-slate-400">
              Map Admin · {user?.email ?? "admin"} · packs & layers from hogback-geo hosting
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/home">
              <Button variant="secondary">All products</Button>
            </Link>
            <Button variant="ghost" onClick={() => logOut()}>
              Sign out
            </Button>
          </div>
        </header>
        <div className="min-h-0 flex-1">
          <MapFrame />
        </div>
      </div>
    </RequireAdmin>
  );
}
