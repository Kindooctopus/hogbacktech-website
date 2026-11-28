"use client";

import Link from "next/link";
import { RequireAdmin } from "@/components/RequireAdmin";
import { useAuth } from "@/components/AuthProvider";
import { AdminShell, Button, Card } from "@/components/ui";

export default function AnalyticsPage() {
  const { logOut } = useAuth();

  return (
    <RequireAdmin>
      <AdminShell
        brandHref="/home"
        brandSubtitle="Web Analytics"
        actions={
          <div className="flex items-center gap-3">
            <Link href="/home">
              <Button variant="secondary">All products</Button>
            </Link>
            <Button variant="ghost" onClick={() => logOut()}>
              Sign out
            </Button>
          </div>
        }
      >
        <Card title="Web Analytics">
          <p className="text-slate-400">
            Analytics admin is not connected yet. This slot is reserved for Hogback site traffic
            (Cloudflare Web Analytics / similar) under the same login.
          </p>
        </Card>
      </AdminShell>
    </RequireAdmin>
  );
}
