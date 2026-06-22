"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell, Button, Card, Field, Input } from "@/components/ui";
import { RequireAdmin } from "@/components/RequireAdmin";
import { createOrganization } from "@/lib/firestore";

export default function NewOrganizationPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const orgId = await createOrganization({ name, code, isDemo });
      router.push(`/organizations/manage?id=${orgId}`);
    } catch {
      setError("Unable to create organization. The code may already exist.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <RequireAdmin>
      <AdminShell
        actions={
          <Link href="/dashboard">
            <Button variant="ghost">Back</Button>
          </Link>
        }
      >
        <Card title="Create organization">
          <form className="max-w-xl space-y-4" onSubmit={handleSubmit}>
            <Field label="Organization name">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Example Fire Department"
                required
              />
            </Field>
            <Field label="Organization code">
              <Input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="HOGBACK-DEMO"
                className="font-mono uppercase"
                required
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={isDemo}
                onChange={(event) => setIsDemo(event.target.checked)}
              />
              Mark as demo organization (App Store showcase)
            </label>
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create organization"}
            </Button>
          </form>
        </Card>
      </AdminShell>
    </RequireAdmin>
  );
}
