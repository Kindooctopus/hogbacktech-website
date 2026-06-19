"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell, Button, Card } from "@/components/ui";
import { RequireAdmin } from "@/components/RequireAdmin";
import { useAuth } from "@/components/AuthProvider";
import { listOrganizations } from "@/lib/firestore";
import type { Organization } from "@shared/types";

export default function DashboardPage() {
  const { logOut } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listOrganizations()
      .then(setOrganizations)
      .catch(() => setError("Unable to load organizations."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <RequireAdmin>
      <AdminShell
        actions={
          <div className="flex items-center gap-3">
            <Link href="/organizations/new">
              <Button>New organization</Button>
            </Link>
            <Button variant="ghost" onClick={() => logOut()}>
              Sign out
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-3xl font-semibold text-white">Organizations</h1>
            <p className="mt-2 text-slate-400">
              Manage client organizations, categories, and documents for Hogback Docs.
            </p>
          </div>

          <Card>
            {loading ? (
              <p className="text-slate-400">Loading organizations…</p>
            ) : error ? (
              <p className="text-red-300">{error}</p>
            ) : organizations.length === 0 ? (
              <div className="space-y-3">
                <p className="text-slate-400">No organizations yet.</p>
                <Link href="/organizations/new">
                  <Button>Create your first organization</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {organizations.map((org) => (
                  <div
                    key={org.id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-white">{org.name}</p>
                      <p className="text-sm text-slate-400">
                        Code: <span className="font-mono text-docs">{org.code}</span>
                        {org.isDemo ? " · Demo org" : ""}
                        {!org.active ? " · Inactive" : ""}
                      </p>
                    </div>
                    <Link href={`/organizations/manage?id=${org.id}`}>
                      <Button variant="secondary">Manage</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </AdminShell>
    </RequireAdmin>
  );
}
