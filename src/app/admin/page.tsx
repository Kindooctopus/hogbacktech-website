"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import {
  defaultSiteContent,
  mergeSiteContent,
  type SiteContent,
} from "@/lib/site-content";


const PASSWORD_KEY = "hogback-admin-password";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [section, setSection] = useState<
    "hero" | "products" | "about" | "contact" | "design"
  >("hero");

  useEffect(() => {
    const saved = sessionStorage.getItem(PASSWORD_KEY);
    if (saved) {
      setPassword(saved);
      void bootstrap(saved);
    } else {
      void loadPublicContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPublicContent() {
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      if (res.ok) {
        setContent(mergeSiteContent(await res.json()));
      }
    } catch {
      /* defaults */
    }
  }

  async function bootstrap(pwd: string) {
    setBusy(true);
    setStatus("");
    try {
      const login = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      if (!login.ok) {
        sessionStorage.removeItem(PASSWORD_KEY);
        setAuthed(false);
        const err = (await login.json().catch(() => ({}))) as {
          error?: string;
        };
        setStatus(
          err.error ??
            `Login failed (${login.status}). Check ADMIN_PASSWORD on Worker hogbacktech-website.`,
        );
        return;
      }
      sessionStorage.setItem(PASSWORD_KEY, pwd);
      setAuthed(true);
      await loadPublicContent();
      setStatus("Signed in.");
    } catch {
      setStatus("Could not reach /api/admin/login. Is the Worker deployed?");
    } finally {
      setBusy(false);
    }
  }

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    await bootstrap(password);
  }

  async function onSave() {
    setBusy(true);
    setStatus("Saving…");
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(content),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setStatus(`Save failed: ${(err as { error?: string }).error ?? res.status}`);
        return;
      }
      const data = (await res.json()) as { content?: SiteContent };
      if (data.content) setContent(mergeSiteContent(data.content));
      setStatus("Saved. Homepage will use the new content immediately.");
    } catch {
      setStatus("Save failed — network or Worker error.");
    } finally {
      setBusy(false);
    }
  }

  function updateDesign<K extends keyof SiteContent["design"]>(
    key: K,
    value: SiteContent["design"][K],
  ) {
    setContent((c) => ({ ...c, design: { ...c.design, [key]: value } }));
  }

  const previewStyle = useMemo(
    () =>
      ({
        ["--admin-copper" as string]: content.design.copper,
        ["--admin-navy" as string]: content.design.navy,
        ["--admin-bg" as string]: content.design.pageBackground,
      }) as CSSProperties,
    [content.design],
  );

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef2f6] px-4">
        <form
          onSubmit={onLogin}
          className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h1 className="font-display text-2xl font-semibold text-navy-950">
            Site admin
          </h1>
          <p className="text-sm text-slate-600">
            Sign in with the <code className="text-copper-600">ADMIN_PASSWORD</code>{" "}
            Worker secret to edit homepage copy, spacing, and colors.
          </p>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-500">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              autoFocus
            />
          </label>
          <button
            type="submit"
            disabled={busy || !password}
            className="rounded-full bg-copper-500 px-5 py-2 text-sm font-semibold text-navy-950 hover:bg-copper-400 disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
          {status && <p className="text-sm text-slate-600">{status}</p>}
          <p className="text-xs text-slate-500">
            <Link href="/" className="text-copper-600 hover:underline">
              ← Back to site
            </Link>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef2f6] text-slate-700" style={previewStyle}>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-[#eef2f6]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <h1 className="font-display text-xl font-semibold text-navy-950">
              Homepage editor
            </h1>
            <p className="text-xs text-slate-500">
              Edit text, spacing, and colors — then save to Cloudflare KV.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm hover:bg-slate-50"
            >
              View site
            </Link>
            <button
              type="button"
              onClick={() => setContent(defaultSiteContent)}
              className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm hover:bg-slate-50"
            >
              Reset defaults
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void onSave()}
              className="rounded-full bg-copper-500 px-4 py-1.5 text-sm font-semibold text-navy-950 hover:bg-copper-400 disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
        {status && (
          <p className="border-t border-slate-200 px-4 py-2 text-center text-sm text-slate-600 sm:px-6">
            {status}
          </p>
        )}
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[200px_1fr] sm:px-6">
        <nav className="flex flex-row gap-2 lg:flex-col">
          {(
            [
              ["hero", "Hero"],
              ["products", "Product boxes"],
              ["about", "About"],
              ["contact", "Contact"],
              ["design", "Spacing & design"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className={`rounded-full px-3 py-1.5 text-left text-sm ${
                section === id
                  ? "bg-navy-950 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {section === "hero" && (
            <div className="space-y-3">
              <Field
                label="Title line 1"
                value={content.hero.titleLine1}
                onChange={(v) =>
                  setContent((c) => ({ ...c, hero: { ...c.hero, titleLine1: v } }))
                }
              />
              <Field
                label="Title line 2"
                value={content.hero.titleLine2}
                onChange={(v) =>
                  setContent((c) => ({ ...c, hero: { ...c.hero, titleLine2: v } }))
                }
              />
              <Area
                label="Body"
                value={content.hero.body}
                onChange={(v) =>
                  setContent((c) => ({ ...c, hero: { ...c.hero, body: v } }))
                }
              />
              <Field
                label="Primary button"
                value={content.hero.primaryCta}
                onChange={(v) =>
                  setContent((c) => ({ ...c, hero: { ...c.hero, primaryCta: v } }))
                }
              />
              <Field
                label="Secondary button"
                value={content.hero.secondaryCta}
                onChange={(v) =>
                  setContent((c) => ({
                    ...c,
                    hero: { ...c.hero, secondaryCta: v },
                  }))
                }
              />
              <Field
                label="Header CTA"
                value={content.header.ctaLabel}
                onChange={(v) =>
                  setContent((c) => ({
                    ...c,
                    header: { ...c.header, ctaLabel: v },
                  }))
                }
              />
            </div>
          )}

          {section === "products" && (
            <div className="space-y-6">
              <Field
                label="Section title"
                value={content.products.sectionTitle}
                onChange={(v) =>
                  setContent((c) => ({
                    ...c,
                    products: { ...c.products, sectionTitle: v },
                  }))
                }
              />
              <Area
                label="Section intro"
                value={content.products.sectionBody}
                onChange={(v) =>
                  setContent((c) => ({
                    ...c,
                    products: { ...c.products, sectionBody: v },
                  }))
                }
              />
              {content.products.cards.map((card, index) => (
                <div
                  key={card.id}
                  className="space-y-2 rounded-xl border border-slate-200 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-copper-600">
                    Box: {card.id}
                  </p>
                  <Field
                    label="Name"
                    value={card.name}
                    onChange={(v) =>
                      setContent((c) => {
                        const cards = [...c.products.cards];
                        cards[index] = { ...cards[index], name: v };
                        return { ...c, products: { ...c.products, cards } };
                      })
                    }
                  />
                  <Field
                    label="Badge"
                    value={card.badge}
                    onChange={(v) =>
                      setContent((c) => {
                        const cards = [...c.products.cards];
                        cards[index] = { ...cards[index], badge: v };
                        return { ...c, products: { ...c.products, cards } };
                      })
                    }
                  />
                  <Area
                    label="Description"
                    value={card.description}
                    onChange={(v) =>
                      setContent((c) => {
                        const cards = [...c.products.cards];
                        cards[index] = { ...cards[index], description: v };
                        return { ...c, products: { ...c.products, cards } };
                      })
                    }
                  />
                  {card.points.map((point, pointIndex) => (
                    <Field
                      key={pointIndex}
                      label={`Bullet ${pointIndex + 1}`}
                      value={point}
                      onChange={(v) =>
                        setContent((c) => {
                          const cards = [...c.products.cards];
                          const points = [...cards[index].points] as [
                            string,
                            string,
                            string,
                          ];
                          points[pointIndex] = v;
                          cards[index] = { ...cards[index], points };
                          return { ...c, products: { ...c.products, cards } };
                        })
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          )}

          {section === "about" && (
            <div className="space-y-3">
              <Field
                label="Title"
                value={content.about.title}
                onChange={(v) =>
                  setContent((c) => ({ ...c, about: { ...c.about, title: v } }))
                }
              />
              {content.about.paragraphs.map((p, i) => (
                <Area
                  key={i}
                  label={`Paragraph ${i + 1}`}
                  value={p}
                  onChange={(v) =>
                    setContent((c) => {
                      const paragraphs = [...c.about.paragraphs] as [
                        string,
                        string,
                        string,
                      ];
                      paragraphs[i] = v;
                      return { ...c, about: { ...c.about, paragraphs } };
                    })
                  }
                />
              ))}
              <Field
                label="Highlight phrase"
                value={content.about.highlight}
                onChange={(v) =>
                  setContent((c) => ({
                    ...c,
                    about: { ...c.about, highlight: v },
                  }))
                }
              />
              <Field
                label="Cares title"
                value={content.about.caresTitle}
                onChange={(v) =>
                  setContent((c) => ({
                    ...c,
                    about: { ...c.about, caresTitle: v },
                  }))
                }
              />
              {content.about.cares.map((item, i) => (
                <Field
                  key={i}
                  label={`Care point ${i + 1}`}
                  value={item}
                  onChange={(v) =>
                    setContent((c) => {
                      const cares = [...c.about.cares] as [string, string, string];
                      cares[i] = v;
                      return { ...c, about: { ...c.about, cares } };
                    })
                  }
                />
              ))}
              <Field
                label="Location label"
                value={content.about.locationLabel}
                onChange={(v) =>
                  setContent((c) => ({
                    ...c,
                    about: { ...c.about, locationLabel: v },
                  }))
                }
              />
              <Area
                label="Location body"
                value={content.about.locationBody}
                onChange={(v) =>
                  setContent((c) => ({
                    ...c,
                    about: { ...c.about, locationBody: v },
                  }))
                }
              />
            </div>
          )}

          {section === "contact" && (
            <div className="space-y-3">
              <Field
                label="Title"
                value={content.contact.title}
                onChange={(v) =>
                  setContent((c) => ({
                    ...c,
                    contact: { ...c.contact, title: v },
                  }))
                }
              />
              {content.contact.paragraphs.map((p, i) => (
                <Area
                  key={i}
                  label={`Paragraph ${i + 1}`}
                  value={p}
                  onChange={(v) =>
                    setContent((c) => {
                      const paragraphs = [...c.contact.paragraphs] as [
                        string,
                        string,
                      ];
                      paragraphs[i] = v;
                      return { ...c, contact: { ...c.contact, paragraphs } };
                    })
                  }
                />
              ))}
              <Field
                label="Email"
                value={content.contact.email}
                onChange={(v) =>
                  setContent((c) => ({
                    ...c,
                    contact: { ...c.contact, email: v },
                  }))
                }
              />
              <Field
                label="Website"
                value={content.contact.website}
                onChange={(v) =>
                  setContent((c) => ({
                    ...c,
                    contact: { ...c.contact, website: v },
                  }))
                }
              />
              <Field
                label="Tips title"
                value={content.contact.tipsTitle}
                onChange={(v) =>
                  setContent((c) => ({
                    ...c,
                    contact: { ...c.contact, tipsTitle: v },
                  }))
                }
              />
              {content.contact.tips.map((tip, i) => (
                <Field
                  key={i}
                  label={`Tip ${i + 1}`}
                  value={tip}
                  onChange={(v) =>
                    setContent((c) => {
                      const tips = [...c.contact.tips] as [string, string, string];
                      tips[i] = v;
                      return { ...c, contact: { ...c.contact, tips } };
                    })
                  }
                />
              ))}
              <Field
                label="Email button label prefix"
                value={content.contact.ctaLabel}
                onChange={(v) =>
                  setContent((c) => ({
                    ...c,
                    contact: { ...c.contact, ctaLabel: v },
                  }))
                }
              />
              <Field
                label="Footer tagline"
                value={content.footer.tagline}
                onChange={(v) =>
                  setContent((c) => ({
                    ...c,
                    footer: { ...c.footer, tagline: v },
                  }))
                }
              />
            </div>
          )}

          {section === "design" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                These controls update CSS variables on the live homepage after
                you save.
              </p>
              <label className="block text-sm">
                <span className="mb-1 block text-slate-500">
                  Page background
                </span>
                <input
                  type="color"
                  value={content.design.pageBackground}
                  onChange={(e) => updateDesign("pageBackground", e.target.value)}
                  className="h-10 w-20 cursor-pointer rounded border border-slate-300 bg-white"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-slate-500">Copper accent</span>
                <input
                  type="color"
                  value={content.design.copper}
                  onChange={(e) => updateDesign("copper", e.target.value)}
                  className="h-10 w-20 cursor-pointer rounded border border-slate-300 bg-white"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-slate-500">Navy text</span>
                <input
                  type="color"
                  value={content.design.navy}
                  onChange={(e) => updateDesign("navy", e.target.value)}
                  className="h-10 w-20 cursor-pointer rounded border border-slate-300 bg-white"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-slate-500">
                  Section spacing ({content.design.sectionSpacingPx}px)
                </span>
                <input
                  type="range"
                  min={48}
                  max={160}
                  step={8}
                  value={content.design.sectionSpacingPx}
                  onChange={(e) =>
                    updateDesign("sectionSpacingPx", Number(e.target.value))
                  }
                  className="w-full"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-slate-500">
                  Card gap ({content.design.cardGapPx}px)
                </span>
                <input
                  type="range"
                  min={12}
                  max={48}
                  step={4}
                  value={content.design.cardGapPx}
                  onChange={(e) =>
                    updateDesign("cardGapPx", Number(e.target.value))
                  }
                  className="w-full"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2"
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-slate-500">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-slate-300 px-3 py-2"
      />
    </label>
  );
}
