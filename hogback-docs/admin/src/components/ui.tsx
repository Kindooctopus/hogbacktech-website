import Image from "next/image";
import Link from "next/link";

export function DocsBrand({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-4">
      <Image
        src="/brand/docs.png"
        alt="Hogback Docs"
        width={56}
        height={56}
        className="rounded-xl"
      />
      <div>
        <p className="font-display text-lg font-semibold text-white">Hogback Docs</p>
        <p className="text-sm text-slate-400">
          {subtitle ?? "Admin portal for Hogback Technologies"}
        </p>
      </div>
    </div>
  );
}

export function AdminShell({
  children,
  actions,
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-navy-950">
      <header className="border-b border-white/10 bg-navy-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/dashboard">
            <DocsBrand subtitle="Organization document management" />
          </Link>
          {actions}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

export function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-navy-900/60 p-6">
      {title ? <h2 className="mb-4 font-display text-xl font-semibold text-white">{title}</h2> : null}
      {children}
    </section>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const styles =
    variant === "primary"
      ? "bg-docs text-white hover:bg-docs/90"
      : variant === "secondary"
        ? "border border-white/15 bg-white/5 text-white hover:bg-white/10"
        : "text-slate-300 hover:text-white";

  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full rounded-lg border border-white/10 bg-navy-950 px-3 py-2 text-sm text-white outline-none ring-docs/40 placeholder:text-slate-500 focus:ring-2"
      {...props}
    />
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-sm font-medium text-slate-300">{children}</label>;
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
