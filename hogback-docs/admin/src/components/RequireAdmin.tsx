"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!configured || !user || !isAdmin) {
      router.replace("/login");
    }
  }, [configured, user, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Loading admin portal…
      </div>
    );
  }

  if (!configured || !user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
