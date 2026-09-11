"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type DragEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  BRAND_IMAGE_OPTIONS,
  FONT_THEMES,
  blockPreviewImage,
  blockPreviewTitle,
  createBoxBlock,
  createBuiltinBlock,
  createGroupBlock,
  createImageBlock,
  createImageTextBlock,
  createTextBlock,
  defaultSiteContent,
  mergeSiteContent,
  pricingTiersFromRows,
  type BuiltinBlockType,
  type FontThemeId,
  type FontWeight,
  type GroupBlock,
  type NestedBox,
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
                  Page preview — drag to reorder
                </h2>
                <p className="text-sm text-slate-500">
                  Drag each <strong>preview card</strong> to move sections on the
                  homepage. Use Edit to change content. Inside a Box section, you
                  can also drag the boxes within that section.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {content.blocks.map((block, index) => (
                  <PreviewCard
                    key={block.id}
                    title={blockPreviewTitle(block)}
                    subtitle={block.type}
                    image={blockPreviewImage(block)}
                    selected={selectedBlockId === block.id}
                    dragging={dragIndex === index}
                    onDragStart={() => onDragStart(index)}
                    onDrop={() => onDrop(index)}
                    onEdit={() => {
                      setSelectedBlockId(block.id);
                      setSection("content");
                    }}
                    onRemove={() => removeBlock(block.id)}
                  />
                ))}
              </div>

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
                  <AddBtn
                    label="Box section"
                    onClick={() => addBlock(createGroupBlock)}
                  />
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

function PreviewCard({
  title,
  subtitle,
  image,
  selected,
  dragging,
  onDragStart,
  onDrop,
  onEdit,
  onRemove,
}: {
  title: string;
  subtitle: string;
  image: string | null;
  selected?: boolean;
  dragging?: boolean;
  onDragStart: () => void;
  onDrop: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e: DragEvent) => e.preventDefault()}
      onDrop={onDrop}
      className={`overflow-hidden rounded-xl border bg-white shadow-sm transition ${
        selected ? "border-copper-500 ring-1 ring-copper-500/40" : "border-slate-200"
      } ${dragging ? "opacity-50" : ""}`}
    >
      <div
        className="cursor-grab active:cursor-grabbing"
        title="Drag this preview to reorder"
      >
        <div className="relative flex h-28 items-center justify-center bg-slate-100">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="px-3 text-center">
              <p className="line-clamp-3 text-sm font-medium text-navy-950">
                {title}
              </p>
            </div>
          )}
          <span className="absolute left-2 top-2 rounded bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Drag preview
          </span>
        </div>
        <div className="space-y-1 px-3 py-2">
          <p className="truncate text-sm font-semibold text-navy-950">{title}</p>
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            {subtitle}
          </p>
        </div>
      </div>
      {(onEdit || onRemove) && (
        <div className="flex gap-2 border-t border-slate-100 px-3 py-2">
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-full bg-copper-500 px-3 py-1 text-xs font-semibold text-navy-950 hover:bg-copper-400"
            >
              Edit
            </button>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-full px-3 py-1 text-xs text-slate-500 hover:bg-slate-50 hover:text-red-600"
            >
              Remove
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

function CollapsiblePanel({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-navy-950">{title}</p>
          {subtitle ? (
            <p className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        <span
          aria-hidden="true"
          className="shrink-0 text-slate-500"
        >
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open ? (
        <div className="space-y-3 border-t border-slate-200 p-4">{children}</div>
      ) : null}
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
        <p className="text-sm font-medium text-navy-950">
          Boxes inside Products section
        </p>
        <p className="text-xs text-slate-500">
          Drag each product preview card to reorder boxes within that section.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {content.products.cards.map((card, index) => (
          <PreviewCard
            key={card.id}
            title={card.name}
            subtitle={card.badge}
            image={`/brand/products/${card.id}.png`}
            dragging={cardDrag === index}
            onDragStart={() => setCardDrag(index)}
            onDrop={() => {
              if (cardDrag !== null) moveCard(cardDrag, index);
              setCardDrag(null);
            }}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Drag the product previews to reorder. To edit product text, Edit the
        Products section above.
      </p>
    </div>
  );
}

function GroupChildrenEditor({
  block,
  updateBlock,
}: {
  block: GroupBlock;
  updateBlock: (id: string, next: PageBlock) => void;
}) {
  const [dragChild, setDragChild] = useState<number | null>(null);
  const [editChildId, setEditChildId] = useState<string | null>(
    block.children[0]?.id ?? null,
  );

  function moveChild(from: number, to: number) {
    if (to < 0 || to >= block.children.length || from === to) return;
    const children = [...block.children];
    const [item] = children.splice(from, 1);
    children.splice(to, 0, item);
    updateBlock(block.id, { ...block, children });
  }

  function updateChild(childId: string, next: NestedBox) {
    updateBlock(block.id, {
      ...block,
      children: block.children.map((c) => (c.id === childId ? next : c)),
    });
  }

  function addChild(factory: () => NestedBox) {
    const child = factory();
    updateBlock(block.id, {
      ...block,
      children: [...block.children, child],
    });
    setEditChildId(child.id);
  }

  function removeChild(childId: string) {
    if (!confirm("Remove this box from the section?")) return;
    const children = block.children.filter((c) => c.id !== childId);
    updateBlock(block.id, { ...block, children });
    if (editChildId === childId) setEditChildId(children[0]?.id ?? null);
  }

  const editing = block.children.find((c) => c.id === editChildId) ?? null;

  return (
    <div className="space-y-4">
      <Field
        label="Section title"
        value={block.title}
        onChange={(v) => updateBlock(block.id, { ...block, title: v })}
      />
      <label className="block text-sm">
        <span className="mb-1 block text-slate-500">Layout</span>
        <select
          value={block.layout}
          onChange={(e) =>
            updateBlock(block.id, {
              ...block,
              layout: e.target.value as GroupBlock["layout"],
            })
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="grid">Grid (side by side)</option>
          <option value="stack">Stack (one under another)</option>
        </select>
      </label>

      <div>
        <p className="mb-2 text-sm font-medium text-navy-950">
          Boxes in this section — drag previews to reorder
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {block.children.map((child, index) => (
            <PreviewCard
              key={child.id}
              title={blockPreviewTitle(child)}
              subtitle={child.type}
              image={blockPreviewImage(child)}
              selected={editChildId === child.id}
              dragging={dragChild === index}
              onDragStart={() => setDragChild(index)}
              onDrop={() => {
                if (dragChild !== null) moveChild(dragChild, index);
                setDragChild(null);
              }}
              onEdit={() => setEditChildId(child.id)}
              onRemove={() => removeChild(child.id)}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <AddBtn label="Text box" onClick={() => addChild(createTextBlock)} />
          <AddBtn label="Image" onClick={() => addChild(createImageBlock)} />
          <AddBtn
            label="Image + text"
            onClick={() => addChild(createImageTextBlock)}
          />
          <AddBtn label="Content box" onClick={() => addChild(createBoxBlock)} />
        </div>
      </div>

      {editing ? (
        <div className="space-y-3 rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-copper-600">
            Editing box: {blockPreviewTitle(editing)}
          </p>
          <NestedBoxFields
            block={editing}
            onChange={(next) => updateChild(editing.id, next)}
          />
        </div>
      ) : null}
    </div>
  );
}

function NestedBoxFields({
  block,
  onChange,
}: {
  block: NestedBox;
  onChange: (next: NestedBox) => void;
}) {
  if (block.type === "text") {
    return (
      <div className="space-y-3">
        <Field
          label="Title"
          value={block.title}
          onChange={(v) => onChange({ ...block, title: v })}
        />
        <Area
          label="Body"
          value={block.body}
          onChange={(v) => onChange({ ...block, body: v })}
        />
        <TextStyleEditor
          label="Title style"
          style={block.titleStyle}
          onChange={(titleStyle) => onChange({ ...block, titleStyle })}
        />
        <TextStyleEditor
          label="Body style"
          style={block.bodyStyle}
          onChange={(bodyStyle) => onChange({ ...block, bodyStyle })}
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
          onChange={(src) => onChange({ ...block, src })}
        />
        <Field
          label="Alt text"
          value={block.alt}
          onChange={(v) => onChange({ ...block, alt: v })}
        />
        <Field
          label="Caption"
          value={block.caption}
          onChange={(v) => onChange({ ...block, caption: v })}
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
          onChange={(src) => onChange({ ...block, src })}
        />
        <Field
          label="Title"
          value={block.title}
          onChange={(v) => onChange({ ...block, title: v })}
        />
        <Area
          label="Body"
          value={block.body}
          onChange={(v) => onChange({ ...block, body: v })}
        />
        <label className="block text-sm">
          <span className="mb-1 block text-slate-500">Text position</span>
          <select
            value={block.textPosition}
            onChange={(e) =>
              onChange({
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
          onChange={(titleStyle) => onChange({ ...block, titleStyle })}
        />
        <TextStyleEditor
          label="Body style"
          style={block.bodyStyle}
          onChange={(bodyStyle) => onChange({ ...block, bodyStyle })}
        />
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <Field
        label="Title"
        value={block.title}
        onChange={(v) => onChange({ ...block, title: v })}
      />
      <Area
        label="Body"
        value={block.body}
        onChange={(v) => onChange({ ...block, body: v })}
      />
      <ImagePicker
        label="Optional image"
        value={block.imageSrc}
        onChange={(imageSrc) => onChange({ ...block, imageSrc })}
      />
      <TextStyleEditor
        label="Title style"
        style={block.titleStyle}
        onChange={(titleStyle) => onChange({ ...block, titleStyle })}
      />
      <TextStyleEditor
        label="Body style"
        style={block.bodyStyle}
        onChange={(bodyStyle) => onChange({ ...block, bodyStyle })}
      />
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
  if (block.type === "group") {
    return <GroupChildrenEditor block={block} updateBlock={updateBlock} />;
  }

  if (block.type === "hero") {
    return (
      <div className="space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block text-slate-500">
            Hero order (titles vs heading picture)
          </span>
          <select
            value={content.hero.bannerPosition}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                hero: {
                  ...c.hero,
                  bannerPosition: e.target.value as
                    | "above-titles"
                    | "below-titles",
                },
              }))
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="above-titles">
              Picture first, then Title 1 / Title 2
            </option>
            <option value="below-titles">
              Title 1 / Title 2 first, then picture
            </option>
          </select>
        </label>
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
        <div className="space-y-3 rounded-xl border border-slate-200 p-3">
          <p className="text-sm font-medium text-navy-950">
            Capability tiles (under hero)
          </p>
          <p className="text-xs text-slate-500">
            These appear beneath the hero buttons. Click a tile on the homepage
            to open its detail panel. Leave image blank to hide a tile.
          </p>
          {(content.hero.capabilities || []).map((cap, capIndex) => (
            <div
              key={capIndex}
              className="space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3"
            >
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Field
                  label={`Tile ${capIndex + 1} label`}
                  value={cap.label}
                  onChange={(v) =>
                    setContent((c) => {
                      const capabilities = [...(c.hero.capabilities || [])];
                      capabilities[capIndex] = {
                        ...capabilities[capIndex],
                        label: v,
                      };
                      return { ...c, hero: { ...c.hero, capabilities } };
                    })
                  }
                />
                <Field
                  label="Image path"
                  value={cap.image}
                  onChange={(v) =>
                    setContent((c) => {
                      const capabilities = [...(c.hero.capabilities || [])];
                      capabilities[capIndex] = {
                        ...capabilities[capIndex],
                        image: v,
                      };
                      return { ...c, hero: { ...c.hero, capabilities } };
                    })
                  }
                />
                <button
                  type="button"
                  className="self-end rounded-full px-2 py-2 text-xs text-slate-500 hover:bg-white hover:text-red-600"
                  onClick={() =>
                    setContent((c) => ({
                      ...c,
                      hero: {
                        ...c.hero,
                        capabilities: (c.hero.capabilities || []).filter(
                          (_, i) => i !== capIndex,
                        ),
                      },
                    }))
                  }
                >
                  Remove
                </button>
              </div>
              <Field
                label="Detail title"
                value={cap.title ?? ""}
                onChange={(v) =>
                  setContent((c) => {
                    const capabilities = [...(c.hero.capabilities || [])];
                    capabilities[capIndex] = {
                      ...capabilities[capIndex],
                      title: v,
                    };
                    return { ...c, hero: { ...c.hero, capabilities } };
                  })
                }
              />
              <Area
                label="Detail body"
                value={cap.body ?? ""}
                onChange={(v) =>
                  setContent((c) => {
                    const capabilities = [...(c.hero.capabilities || [])];
                    capabilities[capIndex] = {
                      ...capabilities[capIndex],
                      body: v,
                    };
                    return { ...c, hero: { ...c.hero, capabilities } };
                  })
                }
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <Field
                  label="Detail CTA label"
                  value={cap.ctaLabel ?? ""}
                  onChange={(v) =>
                    setContent((c) => {
                      const capabilities = [...(c.hero.capabilities || [])];
                      capabilities[capIndex] = {
                        ...capabilities[capIndex],
                        ctaLabel: v,
                      };
                      return { ...c, hero: { ...c.hero, capabilities } };
                    })
                  }
                />
                <Field
                  label="Detail CTA link (#contact, /privacy, …)"
                  value={cap.ctaHref ?? ""}
                  onChange={(v) =>
                    setContent((c) => {
                      const capabilities = [...(c.hero.capabilities || [])];
                      capabilities[capIndex] = {
                        ...capabilities[capIndex],
                        ctaHref: v,
                      };
                      return { ...c, hero: { ...c.hero, capabilities } };
                    })
                  }
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
            onClick={() =>
              setContent((c) => ({
                ...c,
                hero: {
                  ...c.hero,
                  capabilities: [
                    ...(c.hero.capabilities || []),
                    {
                      label: "New capability",
                      image: "/brand/tiles/",
                      title: "New capability",
                      body: "",
                      ctaLabel: "Contact for details",
                      ctaHref: "#contact",
                    },
                  ],
                },
              }))
            }
          >
            + Add capability tile
          </button>
        </div>
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
        <CollapsiblePanel
          title="Products section labels"
          subtitle="Homepage headings and shared product-page labels"
        >
          <Field
            label="Section title (homepage)"
            value={content.products.sectionTitle}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                products: { ...c.products, sectionTitle: v },
              }))
            }
          />
          <Area
            label="Section intro (homepage)"
            value={content.products.sectionBody}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                products: { ...c.products, sectionBody: v },
              }))
            }
          />
          <Field
            label="Product page: Back link label"
            value={content.products.backHomeLabel}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                products: { ...c.products, backHomeLabel: v },
              }))
            }
          />
          <Field
            label="Product page: Pricing heading"
            value={content.products.pricingLabel}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                products: { ...c.products, pricingLabel: v },
              }))
            }
          />
          <Field
            label="Product page: Setup label"
            value={content.products.setupLabel}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                products: { ...c.products, setupLabel: v },
              }))
            }
          />
          <Field
            label="Pricing table: Plan column"
            value={content.products.planColumnLabel}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                products: { ...c.products, planColumnLabel: v },
              }))
            }
          />
          <Field
            label="Pricing table: Price column"
            value={content.products.priceColumnLabel}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                products: { ...c.products, priceColumnLabel: v },
              }))
            }
          />
          <Field
            label="Security section eyebrow"
            value={content.products.securityEyebrow}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                products: { ...c.products, securityEyebrow: v },
              }))
            }
          />
          <Field
            label="Product page: Explore others heading"
            value={content.products.exploreOthersLabel}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                products: { ...c.products, exploreOthersLabel: v },
              }))
            }
          />
        </CollapsiblePanel>

        <CollapsiblePanel
          title="Custom app development callout"
          subtitle="Homepage section under products"
        >
          <Field
            label="Title"
            value={content.customDev?.title ?? ""}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                customDev: { ...c.customDev, title: v },
              }))
            }
          />
          <Area
            label="Body"
            value={content.customDev?.body ?? ""}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                customDev: { ...c.customDev, body: v },
              }))
            }
          />
          <Field
            label="CTA label (links to Contact)"
            value={content.customDev?.ctaLabel ?? ""}
            onChange={(v) =>
              setContent((c) => ({
                ...c,
                customDev: { ...c.customDev, ctaLabel: v },
              }))
            }
          />
        </CollapsiblePanel>

        <p className="pt-1 text-xs text-slate-500">
          Products are collapsed by default. Open a product, then open only the
          category you need.
        </p>

        {content.products.cards.map((card, index) => (
          <CollapsiblePanel
            key={card.id}
            title={card.name || `Product: ${card.id}`}
            subtitle={`ID: ${card.id}`}
          >
            <CollapsiblePanel title="Homepage card">
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
              label="Homepage badge"
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
              label="Homepage description"
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
              <div key={pointIndex} className="flex items-end gap-2">
                <div className="min-w-0 flex-1">
                  <Field
                    label={`Homepage bullet ${pointIndex + 1}`}
                    value={point}
                    onChange={(v) =>
                      setContent((c) => {
                        const cards = [...c.products.cards];
                        const points = [...cards[index].points];
                        points[pointIndex] = v;
                        cards[index] = { ...cards[index], points };
                        return { ...c, products: { ...c.products, cards } };
                      })
                    }
                  />
                </div>
                <button
                  type="button"
                  className="mb-[1px] rounded-full px-2 py-2 text-xs text-slate-500 hover:bg-slate-50 hover:text-red-600"
                  onClick={() =>
                    setContent((c) => {
                      const cards = [...c.products.cards];
                      const points = cards[index].points.filter(
                        (_, i) => i !== pointIndex,
                      );
                      cards[index] = {
                        ...cards[index],
                        points: points.length > 0 ? points : [""],
                      };
                      return { ...c, products: { ...c.products, cards } };
                    })
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
              onClick={() =>
                setContent((c) => {
                  const cards = [...c.products.cards];
                  cards[index] = {
                    ...cards[index],
                    points: [...cards[index].points, "New bullet point"],
                  };
                  return { ...c, products: { ...c.products, cards } };
                })
              }
            >
              + Add homepage bullet
            </button>
            </CollapsiblePanel>

            <CollapsiblePanel
              title="Product page copy"
              subtitle={`/products/${card.id}`}
            >
              <div className="space-y-3">
                <Field
                  label="Subtitle"
                  value={card.subtitle}
                  onChange={(v) =>
                    setContent((c) => {
                      const cards = [...c.products.cards];
                      cards[index] = { ...cards[index], subtitle: v };
                      return { ...c, products: { ...c.products, cards } };
                    })
                  }
                />
                <Area
                  label="Page description"
                  value={card.pageDescription}
                  onChange={(v) =>
                    setContent((c) => {
                      const cards = [...c.products.cards];
                      cards[index] = { ...cards[index], pageDescription: v };
                      return { ...c, products: { ...c.products, cards } };
                    })
                  }
                />
                {card.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-end gap-2">
                    <div className="min-w-0 flex-1">
                      <Field
                        label={`Feature ${featureIndex + 1}`}
                        value={feature}
                        onChange={(v) =>
                          setContent((c) => {
                            const cards = [...c.products.cards];
                            const features = [...cards[index].features];
                            features[featureIndex] = v;
                            cards[index] = { ...cards[index], features };
                            return { ...c, products: { ...c.products, cards } };
                          })
                        }
                      />
                    </div>
                    <button
                      type="button"
                      className="mb-[1px] rounded-full px-2 py-2 text-xs text-slate-500 hover:bg-slate-50 hover:text-red-600"
                      onClick={() =>
                        setContent((c) => {
                          const cards = [...c.products.cards];
                          const features = cards[index].features.filter(
                            (_, i) => i !== featureIndex,
                          );
                          cards[index] = {
                            ...cards[index],
                            features: features.length > 0 ? features : [""],
                          };
                          return { ...c, products: { ...c.products, cards } };
                        })
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
                  onClick={() =>
                    setContent((c) => {
                      const cards = [...c.products.cards];
                      cards[index] = {
                        ...cards[index],
                        features: [...cards[index].features, "New feature"],
                      };
                      return { ...c, products: { ...c.products, cards } };
                    })
                  }
                >
                  + Add feature
                </button>
              </div>
            </CollapsiblePanel>

            <CollapsiblePanel title="Pricing table">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">
                      Edit Plan and Price the same way they appear on the
                      product page.
                    </p>
                  </div>
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                        <th className="px-3 py-2 font-medium">Plan</th>
                        <th className="px-3 py-2 font-medium">Price</th>
                        <th className="w-16 px-2 py-2 text-right font-medium">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(card.pricingRows?.length
                        ? card.pricingRows
                        : [{ plan: "", price: "" }]
                      ).map((row, tierIndex) => (
                          <tr
                            key={tierIndex}
                            className="border-b border-slate-100 last:border-b-0"
                          >
                            <td className="px-3 py-2 align-middle">
                              <input
                                aria-label={`Plan name ${tierIndex + 1}`}
                                value={row.plan}
                                placeholder="Core"
                                onChange={(e) =>
                                  setContent((c) => {
                                    const cards = [...c.products.cards];
                                    const pricingRows = [
                                      ...(cards[index].pricingRows?.length
                                        ? cards[index].pricingRows
                                        : [{ plan: "", price: "" }]),
                                    ];
                                    pricingRows[tierIndex] = {
                                      ...pricingRows[tierIndex],
                                      plan: e.target.value,
                                    };
                                    cards[index] = {
                                      ...cards[index],
                                      pricingRows,
                                      pricingTiers:
                                        pricingTiersFromRows(pricingRows),
                                    };
                                    return {
                                      ...c,
                                      products: { ...c.products, cards },
                                    };
                                  })
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                              />
                            </td>
                            <td className="px-3 py-2 align-middle">
                              <input
                                aria-label={`Price ${tierIndex + 1}`}
                                value={row.price}
                                placeholder="$49/mo"
                                onChange={(e) =>
                                  setContent((c) => {
                                    const cards = [...c.products.cards];
                                    const pricingRows = [
                                      ...(cards[index].pricingRows?.length
                                        ? cards[index].pricingRows
                                        : [{ plan: "", price: "" }]),
                                    ];
                                    pricingRows[tierIndex] = {
                                      ...pricingRows[tierIndex],
                                      price: e.target.value,
                                    };
                                    cards[index] = {
                                      ...cards[index],
                                      pricingRows,
                                      pricingTiers:
                                        pricingTiersFromRows(pricingRows),
                                    };
                                    return {
                                      ...c,
                                      products: { ...c.products, cards },
                                    };
                                  })
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 tabular-nums"
                              />
                            </td>
                            <td className="px-2 py-2 text-right align-middle">
                              <button
                                type="button"
                                className="rounded-full px-2 py-2 text-xs text-slate-500 hover:bg-slate-50 hover:text-red-600"
                                onClick={() =>
                                  setContent((c) => {
                                    const cards = [...c.products.cards];
                                    const pricingRows = (
                                      cards[index].pricingRows?.length
                                        ? cards[index].pricingRows
                                        : [{ plan: "", price: "" }]
                                    ).filter((_, i) => i !== tierIndex);
                                    const nextRows =
                                      pricingRows.length > 0
                                        ? pricingRows
                                        : [{ plan: "", price: "" }];
                                    cards[index] = {
                                      ...cards[index],
                                      pricingRows: nextRows,
                                      pricingTiers:
                                        pricingTiersFromRows(nextRows),
                                    };
                                    return {
                                      ...c,
                                      products: { ...c.products, cards },
                                    };
                                  })
                                }
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      <tr className="border-t border-slate-200 bg-slate-50/70">
                        <td className="px-3 py-2 align-middle">
                          <span className="text-sm text-slate-500">
                            {content.products.setupLabel.replace(/:$/, "") ||
                              "Setup"}
                          </span>
                        </td>
                        <td className="px-3 py-2 align-middle" colSpan={2}>
                          <input
                            aria-label="Setup price"
                            value={card.pricingSetup}
                            placeholder="$250–$750"
                            onChange={(e) =>
                              setContent((c) => {
                                const cards = [...c.products.cards];
                                cards[index] = {
                                  ...cards[index],
                                  pricingSetup: e.target.value,
                                };
                                return {
                                  ...c,
                                  products: { ...c.products, cards },
                                };
                              })
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 tabular-nums"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="border-t border-slate-200 px-3 py-2">
                    <button
                      type="button"
                      className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
                      onClick={() =>
                        setContent((c) => {
                          const cards = [...c.products.cards];
                          const pricingRows = [
                            ...(cards[index].pricingRows || []),
                            { plan: "New plan", price: "$0/mo" },
                          ];
                          cards[index] = {
                            ...cards[index],
                            pricingRows,
                            pricingTiers: pricingTiersFromRows(pricingRows),
                          };
                          return { ...c, products: { ...c.products, cards } };
                        })
                      }
                    >
                      + Add pricing row
                    </button>
                  </div>
                </div>
            </CollapsiblePanel>

            <CollapsiblePanel title="Image & buttons">
                <Field
                  label="Image path"
                  value={card.tileImage}
                  onChange={(v) =>
                    setContent((c) => {
                      const cards = [...c.products.cards];
                      cards[index] = { ...cards[index], tileImage: v };
                      return { ...c, products: { ...c.products, cards } };
                    })
                  }
                />
                <Field
                  label="Primary CTA link (e.g. /products/docs#signup)"
                  value={card.appHref}
                  onChange={(v) =>
                    setContent((c) => {
                      const cards = [...c.products.cards];
                      cards[index] = { ...cards[index], appHref: v };
                      return { ...c, products: { ...c.products, cards } };
                    })
                  }
                />
                <Field
                  label="Primary CTA label (e.g. Sign up your organization)"
                  value={card.appCtaLabel}
                  onChange={(v) =>
                    setContent((c) => {
                      const cards = [...c.products.cards];
                      cards[index] = { ...cards[index], appCtaLabel: v };
                      return { ...c, products: { ...c.products, cards } };
                    })
                  }
                />
                <Field
                  label="Talk / contact button label"
                  value={card.talkCtaLabel}
                  onChange={(v) =>
                    setContent((c) => {
                      const cards = [...c.products.cards];
                      cards[index] = { ...cards[index], talkCtaLabel: v };
                      return { ...c, products: { ...c.products, cards } };
                    })
                  }
                />

            </CollapsiblePanel>

            <CollapsiblePanel title="Security & Privacy">
                  <p className="text-xs text-slate-500">
                    Shown on the product page when a heading and at least one
                    bullet are set. Leave blank to hide.
                  </p>
                  <Field
                    label="Section heading"
                    value={card.securityHeading}
                    onChange={(v) =>
                      setContent((c) => {
                        const cards = [...c.products.cards];
                        cards[index] = {
                          ...cards[index],
                          securityHeading: v,
                        };
                        return { ...c, products: { ...c.products, cards } };
                      })
                    }
                  />
                  <Area
                    label="Intro paragraph"
                    value={card.securityIntro}
                    onChange={(v) =>
                      setContent((c) => {
                        const cards = [...c.products.cards];
                        cards[index] = { ...cards[index], securityIntro: v };
                        return { ...c, products: { ...c.products, cards } };
                      })
                    }
                  />
                  {(card.securityItems.length > 0
                    ? card.securityItems
                    : [""]
                  ).map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-end gap-2">
                      <div className="min-w-0 flex-1">
                        <Field
                          label={`Security bullet ${itemIndex + 1}`}
                          value={item}
                          onChange={(v) =>
                            setContent((c) => {
                              const cards = [...c.products.cards];
                              const securityItems = [
                                ...(cards[index].securityItems.length > 0
                                  ? cards[index].securityItems
                                  : [""]),
                              ];
                              securityItems[itemIndex] = v;
                              cards[index] = {
                                ...cards[index],
                                securityItems,
                              };
                              return {
                                ...c,
                                products: { ...c.products, cards },
                              };
                            })
                          }
                        />
                      </div>
                      <button
                        type="button"
                        className="mb-[1px] rounded-full px-2 py-2 text-xs text-slate-500 hover:bg-slate-50 hover:text-red-600"
                        onClick={() =>
                          setContent((c) => {
                            const cards = [...c.products.cards];
                            const securityItems = (
                              cards[index].securityItems.length > 0
                                ? cards[index].securityItems
                                : [""]
                            ).filter((_, i) => i !== itemIndex);
                            cards[index] = {
                              ...cards[index],
                              securityItems,
                            };
                            return {
                              ...c,
                              products: { ...c.products, cards },
                            };
                          })
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
                    onClick={() =>
                      setContent((c) => {
                        const cards = [...c.products.cards];
                        cards[index] = {
                          ...cards[index],
                          securityItems: [
                            ...(cards[index].securityItems || []),
                            "New security point",
                          ],
                        };
                        return { ...c, products: { ...c.products, cards } };
                      })
                    }
                  >
                    + Add security bullet
                  </button>
                  <Area
                    label="Footnote"
                    value={card.securityFootnote}
                    onChange={(v) =>
                      setContent((c) => {
                        const cards = [...c.products.cards];
                        cards[index] = {
                          ...cards[index],
                          securityFootnote: v,
                        };
                        return { ...c, products: { ...c.products, cards } };
                      })
                    }
                  />
                  <Field
                    label="Privacy policy link"
                    value={card.privacyHref}
                    onChange={(v) =>
                      setContent((c) => {
                        const cards = [...c.products.cards];
                        cards[index] = { ...cards[index], privacyHref: v };
                        return { ...c, products: { ...c.products, cards } };
                      })
                    }
                  />
                  <Field
                    label="Privacy policy link label"
                    value={card.privacyLabel}
                    onChange={(v) =>
                      setContent((c) => {
                        const cards = [...c.products.cards];
                        cards[index] = { ...cards[index], privacyLabel: v };
                        return { ...c, products: { ...c.products, cards } };
                      })
                    }
                  />
            </CollapsiblePanel>

            <CollapsiblePanel title="Organization signup form">
              <label className="flex items-center gap-2 text-sm text-navy-950">
                <input
                  type="checkbox"
                  checked={Boolean(card.signup?.enabled)}
                  onChange={(e) =>
                    setContent((c) => {
                      const cards = [...c.products.cards];
                      cards[index] = {
                        ...cards[index],
                        signup: {
                          ...cards[index].signup,
                          enabled: e.target.checked,
                        },
                      };
                      return { ...c, products: { ...c.products, cards } };
                    })
                  }
                />
                Show signup form on this product page
              </label>
              <Field
                label="Eyebrow"
                value={card.signup?.eyebrow || ""}
                onChange={(v) =>
                  setContent((c) => {
                    const cards = [...c.products.cards];
                    cards[index] = {
                      ...cards[index],
                      signup: { ...cards[index].signup, eyebrow: v },
                    };
                    return { ...c, products: { ...c.products, cards } };
                  })
                }
              />
              <Field
                label="Title"
                value={card.signup?.title || ""}
                onChange={(v) =>
                  setContent((c) => {
                    const cards = [...c.products.cards];
                    cards[index] = {
                      ...cards[index],
                      signup: { ...cards[index].signup, title: v },
                    };
                    return { ...c, products: { ...c.products, cards } };
                  })
                }
              />
              <Area
                label="Intro"
                value={card.signup?.body || ""}
                onChange={(v) =>
                  setContent((c) => {
                    const cards = [...c.products.cards];
                    cards[index] = {
                      ...cards[index],
                      signup: { ...cards[index].signup, body: v },
                    };
                    return { ...c, products: { ...c.products, cards } };
                  })
                }
              />
              <Field
                label="Submit button"
                value={card.signup?.submitLabel || ""}
                onChange={(v) =>
                  setContent((c) => {
                    const cards = [...c.products.cards];
                    cards[index] = {
                      ...cards[index],
                      signup: { ...cards[index].signup, submitLabel: v },
                    };
                    return { ...c, products: { ...c.products, cards } };
                  })
                }
              />
              <Field
                label="Mailto subject"
                value={card.signup?.mailtoSubject || ""}
                onChange={(v) =>
                  setContent((c) => {
                    const cards = [...c.products.cards];
                    cards[index] = {
                      ...cards[index],
                      signup: { ...cards[index].signup, mailtoSubject: v },
                    };
                    return { ...c, products: { ...c.products, cards } };
                  })
                }
              />
              <Area
                label="Mailto intro line"
                value={card.signup?.mailtoIntro || ""}
                onChange={(v) =>
                  setContent((c) => {
                    const cards = [...c.products.cards];
                    cards[index] = {
                      ...cards[index],
                      signup: { ...cards[index].signup, mailtoIntro: v },
                    };
                    return { ...c, products: { ...c.products, cards } };
                  })
                }
              />
              <p className="text-xs text-slate-500">
                Field labels and placeholders for the form also live on this
                product’s signup object in content (organization, contact,
                email, phone, notes). Edit them here as needed after save/reload
                if you extend the admin later; core visitor-facing copy above is
                enough for most updates.
              </p>
            </CollapsiblePanel>

            <CollapsiblePanel title="App screenshots">
                  <Field
                    label="Screenshots heading"
                    value={card.screenshotsHeading}
                    onChange={(v) =>
                      setContent((c) => {
                        const cards = [...c.products.cards];
                        cards[index] = {
                          ...cards[index],
                          screenshotsHeading: v,
                        };
                        return { ...c, products: { ...c.products, cards } };
                      })
                    }
                  />
                  {card.screenshots.map((shot, shotIndex) => (
                    <div
                      key={shotIndex}
                      className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <Field
                        label={`Screenshot ${shotIndex + 1} path`}
                        value={shot.src}
                        onChange={(v) =>
                          setContent((c) => {
                            const cards = [...c.products.cards];
                            const screenshots = [...cards[index].screenshots];
                            screenshots[shotIndex] = {
                              ...screenshots[shotIndex],
                              src: v,
                            };
                            cards[index] = { ...cards[index], screenshots };
                            return { ...c, products: { ...c.products, cards } };
                          })
                        }
                      />
                      <Field
                        label="Caption"
                        value={shot.caption}
                        onChange={(v) =>
                          setContent((c) => {
                            const cards = [...c.products.cards];
                            const screenshots = [...cards[index].screenshots];
                            screenshots[shotIndex] = {
                              ...screenshots[shotIndex],
                              caption: v,
                            };
                            cards[index] = { ...cards[index], screenshots };
                            return { ...c, products: { ...c.products, cards } };
                          })
                        }
                      />
                      <button
                        type="button"
                        className="rounded-full px-3 py-1 text-xs text-slate-500 hover:bg-white hover:text-red-600"
                        onClick={() =>
                          setContent((c) => {
                            const cards = [...c.products.cards];
                            cards[index] = {
                              ...cards[index],
                              screenshots: cards[index].screenshots.filter(
                                (_, i) => i !== shotIndex,
                              ),
                            };
                            return { ...c, products: { ...c.products, cards } };
                          })
                        }
                      >
                        Remove screenshot
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
                    onClick={() =>
                      setContent((c) => {
                        const cards = [...c.products.cards];
                        cards[index] = {
                          ...cards[index],
                          screenshots: [
                            ...cards[index].screenshots,
                            {
                              src: `/brand/products/${card.id}/screenshot-${cards[index].screenshots.length + 1}.png`,
                              caption: "",
                            },
                          ],
                        };
                        return { ...c, products: { ...c.products, cards } };
                      })
                    }
                  >
                    + Add screenshot
                  </button>
                  <p className="text-xs text-slate-500">
                    Put iOS screenshot files in{" "}
                    <code className="text-copper-600">
                      public/brand/products/{card.id}/
                    </code>{" "}
                    then set the path above (for example{" "}
                    <code className="text-copper-600">
                      /brand/products/{card.id}/home.png
                    </code>
                    ).
                  </p>
            </CollapsiblePanel>
          </CollapsiblePanel>
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
