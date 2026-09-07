"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type DragEvent,
} from "react";
import Link from "next/link";
import {
  BRAND_IMAGE_OPTIONS,
  FONT_THEMES,
  createBoxBlock,
  createBuiltinBlock,
  createImageBlock,
  createImageTextBlock,
  createTextBlock,
  defaultSiteContent,
  mergeSiteContent,
  type BuiltinBlockType,
  type FontThemeId,
  type FontWeight,
  type PageBlock,
  type SiteContent,
  type TextAlign,
  type TextStyle,
} from "@/lib/site-content";

const PASSWORD_KEY = "hogback-admin-password";

type SectionId = "layout" | "theme" | "content";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [section, setSection] = useState<SectionId>("layout");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

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
        const merged = mergeSiteContent(await res.json());
        setContent(merged);
        setSelectedBlockId(merged.blocks[0]?.id ?? null);
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
      if (data.content) {
        const merged = mergeSiteContent(data.content);
        setContent(merged);
      }
      setStatus("Saved. Homepage will use the new layout immediately.");
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

  function updateBlock(id: string, next: PageBlock) {
    setContent((c) => ({
      ...c,
      blocks: c.blocks.map((b) => (b.id === id ? next : b)),
    }));
  }

  function moveBlock(from: number, to: number) {
    if (to < 0 || to >= content.blocks.length || from === to) return;
    setContent((c) => {
      const blocks = [...c.blocks];
      const [item] = blocks.splice(from, 1);
      blocks.splice(to, 0, item);
      return { ...c, blocks };
    });
  }

  function onDragStart(index: number) {
    setDragIndex(index);
  }

  function onDrop(index: number) {
    if (dragIndex === null) return;
    moveBlock(dragIndex, index);
    setDragIndex(null);
  }

  function addBlock(factory: () => PageBlock) {
    const block = factory();
    setContent((c) => ({ ...c, blocks: [...c.blocks, block] }));
    setSelectedBlockId(block.id);
    setSection("content");
  }

  function addBuiltinIfMissing(type: BuiltinBlockType) {
    if (content.blocks.some((b) => b.type === type)) {
      setStatus(`${type} section is already on the page.`);
      return;
    }
    addBlock(() => createBuiltinBlock(type));
  }

  function removeBlock(id: string) {
    const target = content.blocks.find((b) => b.id === id);
    if (!target) return;
    if (
      target.type === "hero" ||
      target.type === "products" ||
      target.type === "about" ||
      target.type === "contact"
    ) {
      if (
        !confirm(
          `Remove the ${target.label} section from the page? You can add it back later.`,
        )
      ) {
        return;
      }
    } else if (!confirm(`Delete “${target.label}”?`)) {
      return;
    }
    setContent((c) => ({
      ...c,
      blocks: c.blocks.filter((b) => b.id !== id),
    }));
    if (selectedBlockId === id) setSelectedBlockId(null);
  }

  const selectedBlock =
    content.blocks.find((b) => b.id === selectedBlockId) ?? null;

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
            Worker secret to edit layout, fonts, and content.
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
              Page builder
            </h1>
            <p className="text-xs text-slate-500">
              Drag sections, add boxes, set fonts & styles — then save.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm hover:bg-slate-50"
            >
              View site
            </Link>
            <button
              type="button"
              onClick={() => {
                setContent(defaultSiteContent);
                setSelectedBlockId(defaultSiteContent.blocks[0]?.id ?? null);
              }}
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
              ["layout", "Layout & boxes"],
              ["theme", "Theme & fonts"],
              ["content", "Edit section"],
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
          {section === "layout" && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-lg font-semibold text-navy-950">
                  Page sections
                </h2>
                <p className="text-sm text-slate-500">
                  Drag the handle to reorder. Click a row to edit its content and
                  text styles.
                </p>
              </div>

              <ul className="space-y-2">
                {content.blocks.map((block, index) => (
                  <li
                    key={block.id}
                    draggable
                    onDragStart={() => onDragStart(index)}
                    onDragOver={(e: DragEvent) => e.preventDefault()}
                    onDrop={() => onDrop(index)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                      selectedBlockId === block.id
                        ? "border-copper-500 bg-copper-500/5"
                        : "border-slate-200 bg-slate-50"
                    } ${dragIndex === index ? "opacity-60" : ""}`}
                  >
                    <span
                      className="cursor-grab select-none px-1 text-slate-400 active:cursor-grabbing"
                      title="Drag to reorder"
                      aria-hidden
                    >
                      ⋮⋮
                    </span>
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => {
                        setSelectedBlockId(block.id);
                        setSection("content");
                      }}
                    >
                      <span className="block truncate text-sm font-medium text-navy-950">
                        {block.label}
                      </span>
                      <span className="block text-xs uppercase tracking-wide text-slate-400">
                        {block.type}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="rounded-full px-2 py-1 text-xs text-slate-500 hover:bg-white hover:text-red-600"
                      onClick={() => removeBlock(block.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 border-t border-slate-200 pt-4">
                <p className="text-sm font-medium text-navy-950">Add to page</p>
                <div className="flex flex-wrap gap-2">
                  <AddBtn label="Text box" onClick={() => addBlock(createTextBlock)} />
                  <AddBtn label="Image" onClick={() => addBlock(createImageBlock)} />
                  <AddBtn
                    label="Image + text"
                    onClick={() => addBlock(createImageTextBlock)}
                  />
                  <AddBtn label="Content box" onClick={() => addBlock(createBoxBlock)} />
                </div>
                <p className="pt-2 text-xs text-slate-500">
                  Restore a core section if you removed it:
                </p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["hero", "Hero"],
                      ["products", "Products"],
                      ["about", "About"],
                      ["contact", "Contact"],
                    ] as const
                  ).map(([type, label]) => (
                    <AddBtn
                      key={type}
                      label={label}
                      onClick={() => addBuiltinIfMissing(type)}
                    />
                  ))}
                </div>
              </div>

              <ProductCardsEditor
                content={content}
                setContent={setContent}
              />
            </div>
          )}

          {section === "theme" && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-lg font-semibold text-navy-950">
                  Site theme
                </h2>
                <p className="text-sm text-slate-500">
                  Font theme applies to the whole page. Colors and spacing apply
                  globally.
                </p>
              </div>

              <fieldset className="space-y-2">
                <legend className="mb-1 text-sm text-slate-500">Font theme</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {FONT_THEMES.map((theme) => (
                    <label
                      key={theme.id}
                      className={`cursor-pointer rounded-xl border p-3 ${
                        content.design.fontTheme === theme.id
                          ? "border-copper-500 bg-copper-500/5"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        name="fontTheme"
                        checked={content.design.fontTheme === theme.id}
                        onChange={() =>
                          updateDesign("fontTheme", theme.id as FontThemeId)
                        }
                      />
                      <span className="block text-sm font-semibold text-navy-950">
                        {theme.label}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {theme.description}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="block text-sm">
                <span className="mb-1 block text-slate-500">
                  Body text size ({content.design.bodySizePx}px)
                </span>
                <input
                  type="range"
                  min={14}
                  max={20}
                  step={1}
                  value={content.design.bodySizePx}
                  onChange={(e) =>
                    updateDesign("bodySizePx", Number(e.target.value))
                  }
                  className="w-full"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-slate-500">
                  Heading scale ({content.design.headingScale.toFixed(2)}×)
                </span>
                <input
                  type="range"
                  min={0.8}
                  max={1.4}
                  step={0.05}
                  value={content.design.headingScale}
                  onChange={(e) =>
                    updateDesign("headingScale", Number(e.target.value))
                  }
                  className="w-full"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-slate-500">Page background</span>
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

          {section === "content" && (
            <div className="space-y-4">
              {!selectedBlock ? (
                <p className="text-sm text-slate-500">
                  Select a section from{" "}
                  <button
                    type="button"
                    className="text-copper-600 underline"
                    onClick={() => setSection("layout")}
                  >
                    Layout & boxes
                  </button>
                  .
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-display text-lg font-semibold text-navy-950">
                      Edit: {selectedBlock.label}
                    </h2>
                    <select
                      className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                      value={selectedBlock.id}
                      onChange={(e) => setSelectedBlockId(e.target.value)}
                    >
                      {content.blocks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.label} ({b.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <Field
                    label="Admin label"
                    value={selectedBlock.label}
                    onChange={(v) =>
                      updateBlock(selectedBlock.id, {
                        ...selectedBlock,
                        label: v,
                      })
                    }
                  />

                  <BlockContentEditor
                    block={selectedBlock}
                    content={content}
                    setContent={setContent}
                    updateBlock={updateBlock}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
    >
      + {label}
    </button>
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

function TextStyleEditor({
  label,
  style,
  onChange,
}: {
  label: string;
  style: TextStyle;
  onChange: (next: TextStyle) => void;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-copper-600">
        {label}
      </p>
      <label className="block text-sm">
        <span className="mb-1 block text-slate-500">
          Size ({style.fontSizePx}px)
        </span>
        <input
          type="range"
          min={12}
          max={72}
          step={1}
          value={style.fontSizePx}
          onChange={(e) =>
            onChange({ ...style, fontSizePx: Number(e.target.value) })
          }
          className="w-full"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-slate-500">Weight</span>
        <select
          value={style.fontWeight}
          onChange={(e) =>
            onChange({ ...style, fontWeight: e.target.value as FontWeight })
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="400">Regular</option>
          <option value="500">Medium</option>
          <option value="600">Semibold</option>
          <option value="700">Bold</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-slate-500">Align</span>
        <select
          value={style.align}
          onChange={(e) =>
            onChange({ ...style, align: e.target.value as TextAlign })
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-slate-500">
          Color (blank = theme default)
        </span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={style.color || "#0a111a"}
            onChange={(e) => onChange({ ...style, color: e.target.value })}
            className="h-10 w-14 cursor-pointer rounded border border-slate-300 bg-white"
          />
          <button
            type="button"
            className="text-xs text-copper-600"
            onClick={() => onChange({ ...style, color: "" })}
          >
            Clear
          </button>
        </div>
      </label>
    </div>
  );
}

function ImagePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm">
        <span className="mb-1 block text-slate-500">{label}</span>
        <select
          value={BRAND_IMAGE_OPTIONS.includes(value as (typeof BRAND_IMAGE_OPTIONS)[number]) ? value : ""}
          onChange={(e) => {
            if (e.target.value) onChange(e.target.value);
          }}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="">Custom URL / path below</option>
          {BRAND_IMAGE_OPTIONS.map((src) => (
            <option key={src} value={src}>
              {src}
            </option>
          ))}
        </select>
      </label>
      <Field label="Image URL or path" value={value} onChange={onChange} />
    </div>
  );
}

function ProductCardsEditor({
  content,
  setContent,
}: {
  content: SiteContent;
  setContent: React.Dispatch<React.SetStateAction<SiteContent>>;
}) {
  const [cardDrag, setCardDrag] = useState<number | null>(null);

  function moveCard(from: number, to: number) {
    if (to < 0 || to >= content.products.cards.length || from === to) return;
    setContent((c) => {
      const cards = [...c.products.cards];
      const [item] = cards.splice(from, 1);
      cards.splice(to, 0, item);
      return { ...c, products: { ...c.products, cards } };
    });
  }

  return (
    <div className="space-y-3 border-t border-slate-200 pt-4">
      <div>
        <p className="text-sm font-medium text-navy-950">Product boxes</p>
        <p className="text-xs text-slate-500">
          Drag to reorder the product cards inside the Products section.
        </p>
      </div>
      <ul className="space-y-2">
        {content.products.cards.map((card, index) => (
          <li
            key={card.id}
            draggable
            onDragStart={() => setCardDrag(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (cardDrag !== null) moveCard(cardDrag, index);
              setCardDrag(null);
            }}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <span className="cursor-grab text-slate-400" aria-hidden>
              ⋮⋮
            </span>
            <span className="font-medium text-navy-950">{card.name}</span>
            <span className="text-xs text-slate-400">{card.badge}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BlockContentEditor({
  block,
  content,
  setContent,
  updateBlock,
}: {
  block: PageBlock;
  content: SiteContent;
  setContent: React.Dispatch<React.SetStateAction<SiteContent>>;
  updateBlock: (id: string, next: PageBlock) => void;
}) {
  if (block.type === "hero") {
    return (
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
            setContent((c) => ({ ...c, hero: { ...c.hero, secondaryCta: v } }))
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
        <TextStyleEditor
          label="Title style"
          style={block.titleStyle}
          onChange={(titleStyle) => updateBlock(block.id, { ...block, titleStyle })}
        />
        <TextStyleEditor
          label="Body style"
          style={block.bodyStyle}
          onChange={(bodyStyle) => updateBlock(block.id, { ...block, bodyStyle })}
        />
      </div>
    );
  }

  if (block.type === "products") {
    return (
      <div className="space-y-3">
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
        <TextStyleEditor
          label="Title style"
          style={block.titleStyle}
          onChange={(titleStyle) => updateBlock(block.id, { ...block, titleStyle })}
        />
        <TextStyleEditor
          label="Body style"
          style={block.bodyStyle}
          onChange={(bodyStyle) => updateBlock(block.id, { ...block, bodyStyle })}
        />
      </div>
    );
  }

  if (block.type === "about") {
    return (
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
            setContent((c) => ({ ...c, about: { ...c.about, highlight: v } }))
          }
        />
        <Field
          label="Cares title"
          value={content.about.caresTitle}
          onChange={(v) =>
            setContent((c) => ({ ...c, about: { ...c.about, caresTitle: v } }))
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
        <TextStyleEditor
          label="Title style"
          style={block.titleStyle}
          onChange={(titleStyle) => updateBlock(block.id, { ...block, titleStyle })}
        />
        <TextStyleEditor
          label="Body style"
          style={block.bodyStyle}
          onChange={(bodyStyle) => updateBlock(block.id, { ...block, bodyStyle })}
        />
      </div>
    );
  }

  if (block.type === "contact") {
    return (
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
                const paragraphs = [...c.contact.paragraphs] as [string, string];
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
        <TextStyleEditor
          label="Title style"
          style={block.titleStyle}
          onChange={(titleStyle) => updateBlock(block.id, { ...block, titleStyle })}
        />
        <TextStyleEditor
          label="Body style"
          style={block.bodyStyle}
          onChange={(bodyStyle) => updateBlock(block.id, { ...block, bodyStyle })}
        />
      </div>
    );
  }

  if (block.type === "text") {
    return (
      <div className="space-y-3">
        <Field
          label="Title"
          value={block.title}
          onChange={(v) => updateBlock(block.id, { ...block, title: v })}
        />
        <Area
          label="Body"
          value={block.body}
          onChange={(v) => updateBlock(block.id, { ...block, body: v })}
        />
        <label className="block text-sm">
          <span className="mb-1 block text-slate-500">Background</span>
          <input
            type="color"
            value={block.background}
            onChange={(e) =>
              updateBlock(block.id, { ...block, background: e.target.value })
            }
            className="h-10 w-20 cursor-pointer rounded border border-slate-300 bg-white"
          />
        </label>
        <TextStyleEditor
          label="Title style"
          style={block.titleStyle}
          onChange={(titleStyle) => updateBlock(block.id, { ...block, titleStyle })}
        />
        <TextStyleEditor
          label="Body style"
          style={block.bodyStyle}
          onChange={(bodyStyle) => updateBlock(block.id, { ...block, bodyStyle })}
        />
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <div className="space-y-3">
        <ImagePicker
          label="Image"
          value={block.src}
          onChange={(src) => updateBlock(block.id, { ...block, src })}
        />
        <Field
          label="Alt text"
          value={block.alt}
          onChange={(v) => updateBlock(block.id, { ...block, alt: v })}
        />
        <Field
          label="Caption"
          value={block.caption}
          onChange={(v) => updateBlock(block.id, { ...block, caption: v })}
        />
      </div>
    );
  }

  if (block.type === "imageText") {
    return (
      <div className="space-y-3">
        <ImagePicker
          label="Image"
          value={block.src}
          onChange={(src) => updateBlock(block.id, { ...block, src })}
        />
        <Field
          label="Alt text"
          value={block.alt}
          onChange={(v) => updateBlock(block.id, { ...block, alt: v })}
        />
        <Field
          label="Title"
          value={block.title}
          onChange={(v) => updateBlock(block.id, { ...block, title: v })}
        />
        <Area
          label="Body"
          value={block.body}
          onChange={(v) => updateBlock(block.id, { ...block, body: v })}
        />
        <label className="block text-sm">
          <span className="mb-1 block text-slate-500">Text position</span>
          <select
            value={block.textPosition}
            onChange={(e) =>
              updateBlock(block.id, {
                ...block,
                textPosition: e.target.value as typeof block.textPosition,
              })
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="overlay">Text in front (overlay)</option>
            <option value="below">Text below image</option>
            <option value="left">Text left / image right</option>
            <option value="right">Image left / text right</option>
          </select>
        </label>
        <TextStyleEditor
          label="Title style"
          style={block.titleStyle}
          onChange={(titleStyle) => updateBlock(block.id, { ...block, titleStyle })}
        />
        <TextStyleEditor
          label="Body style"
          style={block.bodyStyle}
          onChange={(bodyStyle) => updateBlock(block.id, { ...block, bodyStyle })}
        />
      </div>
    );
  }

  if (block.type === "box") {
    return (
      <div className="space-y-3">
        <Field
          label="Title"
          value={block.title}
          onChange={(v) => updateBlock(block.id, { ...block, title: v })}
        />
        <Area
          label="Body"
          value={block.body}
          onChange={(v) => updateBlock(block.id, { ...block, body: v })}
        />
        <ImagePicker
          label="Optional image"
          value={block.imageSrc}
          onChange={(imageSrc) => updateBlock(block.id, { ...block, imageSrc })}
        />
        <label className="block text-sm">
          <span className="mb-1 block text-slate-500">Background</span>
          <input
            type="color"
            value={block.background}
            onChange={(e) =>
              updateBlock(block.id, { ...block, background: e.target.value })
            }
            className="h-10 w-20 cursor-pointer rounded border border-slate-300 bg-white"
          />
        </label>
        <TextStyleEditor
          label="Title style"
          style={block.titleStyle}
          onChange={(titleStyle) => updateBlock(block.id, { ...block, titleStyle })}
        />
        <TextStyleEditor
          label="Body style"
          style={block.bodyStyle}
          onChange={(bodyStyle) => updateBlock(block.id, { ...block, bodyStyle })}
        />
      </div>
    );
  }

  return null;
}
