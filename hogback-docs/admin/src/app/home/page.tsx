"use client";

import Link from "next/link";
import { RequireAdmin } from "@/components/RequireAdmin";
import { useAuth } from "@/components/AuthProvider";
import { AdminShell, Button, Card } from "@/components/ui";

const PRODUCTS = [
  {
    id: "docs",
    title: "Docs",
    description: "Policy Compass — organizations, categories, and documents.",
    href: "/dashboard",
    status: "ready" as const,
    accent: "#3b82f6",
  },
  {
    id: "geo",
    title: "Geo",
    description: "Map Admin — Field packs, ownership stacks, fires, and bake preview.",
    href: "/geo",
    status: "ready" as const,
    accent: "#3f8f5a",
  },
  {
    id: "analytics",
    title: "Web Analytics",
    description: "Traffic and engagement across Hogback sites.",
    href: "/analytics",
    status: "soon" as const,
    accent: "#d4a84b",
  },
  {
    id: "website",
    title: "Website",
    description: "Marketing site admin for hogbacktech.com.",
    href: "/website",
    status: "ready" as const,
    accent: "#c47a64",
  },
];

export default function HomePage() {
  const { logOut, user } = useAuth();

  return (
    <RequireAdmin>
      <AdminShell
        brandHref="/home"
        brandSubtitle="Choose a product to administer"
        actions={
          <Button variant="ghost" onClick={() => logOut()}>
            Sign out
          </Button>
        }
      >
        <div className="space-y-8">
          <div>
            <h1 className="font-display text-3xl font-semibold text-white">Hogback Admin</h1>
            <p className="mt-2 max-w-2xl text-slate-400">
              Signed in as {user?.email ?? "admin"}. Pick Docs, Geo, analytics, or the marketing
              website — one login for the Hogback stack.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {PRODUCTS.map((product) => {
              const ready = product.status === "ready";
              const card = (
                <Card>
                  <div className="flex h-full flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p
                          className="text-xs font-semibold uppercase tracking-[0.14em]"
                          style={{ color: product.accent }}
                        >
                          {product.title}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-slate-300">
                          {product.description}
                        </p>
                      </div>
                      {ready ? null : (
                        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Soon
                        </span>
                      )}
                    </div>
                    {ready ? (
                      <div className="mt-auto">
                        <span className="inline-flex rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white">
                          Open {product.title}
                        </span>
                      </div>
                    ) : (
                      <p className="mt-auto text-sm text-slate-500">
                        Placeholder — not wired yet.
                      </p>
                    )}
                  </div>
                </Card>
              );

              if (!ready) {
                return (
                  <div key={product.id} className="opacity-80">
                    {card}
                  </div>
                );
              }

              return (
                <Link
                  key={product.id}
                  href={product.href}
                  className="block transition hover:-translate-y-0.5"
                >
                  {card}
                </Link>
              );
            })}
          </div>
        </div>
      </AdminShell>
    </RequireAdmin>
  );
}
