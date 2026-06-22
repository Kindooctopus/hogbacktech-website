"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { DocsBrand, Button, Card, Field, Input } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const { signIn, configured, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await signIn(email, password);
      router.replace("/dashboard");
    } catch {
      setError("Unable to sign in. Check your credentials and admin access.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6">
        <DocsBrand subtitle="Sign in to manage client organizations" />

        <Card title="Admin sign in">
          {!configured ? (
            <p className="text-sm text-slate-400">
              Firebase is not configured yet. Copy <code>admin/.env.example</code> to{" "}
              <code>admin/.env.local</code> and add your project keys.
            </p>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Field label="Email">
                <Input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Field>
              <Field label="Password">
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </Field>
              {error ? <p className="text-sm text-red-300">{error}</p> : null}
              <Button type="submit" disabled={submitting || loading} className="w-full">
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
