"use client";

import type { CSSProperties } from "react";
import {
  textStyleToCss,
  type BoxBlock,
  type GroupBlock,
  type ImageBlock,
  type ImageTextBlock,
  type NestedBox,
  type TextBlock,
} from "@/lib/site-content";

function SafeImage({
  src,
  alt,
  className,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
}) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} style={style} />;
}

export function TextBlockSection({ block }: { block: TextBlock }) {
  return (
    <section className="scroll-mt-24" id={block.id}>
      <div className="mx-auto max-w-6xl px-6">
        <div
          className="rounded-2xl border border-slate-200 p-6 shadow-[0_10px_30px_-24px_rgba(10,17,26,0.35)] sm:p-8"
          style={{ background: block.background }}
        >
          <h2
            className="font-display text-navy-950"
            style={textStyleToCss(block.titleStyle)}
          >
            {block.title}
          </h2>
          <p
            className="mt-3 whitespace-pre-wrap text-slate-600"
            style={textStyleToCss(block.bodyStyle)}
          >
            {block.body}
          </p>
        </div>
      </div>
    </section>
  );
}

export function ImageBlockSection({ block }: { block: ImageBlock }) {
  return (
    <section className="scroll-mt-24" id={block.id}>
      <div className="mx-auto max-w-6xl px-6">
        <figure className="overflow-hidden rounded-2xl border border-slate-200 shadow-[0_14px_40px_-28px_rgba(10,17,26,0.4)]">
          <SafeImage
            src={block.src}
            alt={block.alt}
            className="h-auto w-full object-cover"
          />
          {block.caption ? (
            <figcaption className="bg-white px-4 py-3 text-sm text-slate-500">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      </div>
    </section>
  );
}

export function ImageTextBlockSection({ block }: { block: ImageTextBlock }) {
  const titleStyle = textStyleToCss(block.titleStyle);
  const bodyStyle = textStyleToCss(block.bodyStyle);

  if (block.textPosition === "overlay") {
    return (
      <section className="scroll-mt-24" id={block.id}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-[0_14px_40px_-28px_rgba(10,17,26,0.4)]">
            <SafeImage
              src={block.src}
              alt={block.alt}
              className="block h-auto min-h-[16rem] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/10" />
            <div className="absolute inset-x-0 bottom-0 space-y-3 p-6 sm:p-8">
              <h2 className="font-display" style={titleStyle}>
                {block.title}
              </h2>
              <p className="whitespace-pre-wrap" style={bodyStyle}>
                {block.body}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (block.textPosition === "below") {
    return (
      <section className="scroll-mt-24" id={block.id}>
        <div className="mx-auto max-w-6xl space-y-4 px-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <SafeImage
              src={block.src}
              alt={block.alt}
              className="h-auto w-full object-cover"
            />
          </div>
          <h2 className="font-display text-navy-950" style={titleStyle}>
            {block.title}
          </h2>
          <p className="whitespace-pre-wrap text-slate-600" style={bodyStyle}>
            {block.body}
          </p>
        </div>
      </section>
    );
  }

  const imageFirst = block.textPosition === "right";
  return (
    <section className="scroll-mt-24" id={block.id}>
      <div
        className={`mx-auto grid max-w-6xl items-center gap-8 px-6 lg:grid-cols-2 ${
          imageFirst ? "" : ""
        }`}
      >
        <div className={imageFirst ? "lg:order-2" : ""}>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <SafeImage
              src={block.src}
              alt={block.alt}
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
        <div className={`space-y-3 ${imageFirst ? "lg:order-1" : ""}`}>
          <h2 className="font-display text-navy-950" style={titleStyle}>
            {block.title}
          </h2>
          <p className="whitespace-pre-wrap text-slate-600" style={bodyStyle}>
            {block.body}
          </p>
        </div>
      </div>
    </section>
  );
}

export function BoxBlockSection({ block }: { block: BoxBlock }) {
  return (
    <section className="scroll-mt-24" id={block.id}>
      <div className="mx-auto max-w-6xl px-6">
        <article
          className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 shadow-[0_10px_30px_-24px_rgba(10,17,26,0.35)] sm:flex-row sm:items-start"
          style={{ background: block.background }}
        >
          {block.imageSrc ? (
            <SafeImage
              src={block.imageSrc}
              alt=""
              className="h-28 w-28 shrink-0 rounded-xl object-contain"
            />
          ) : null}
          <div className="min-w-0 space-y-2">
            <h3
              className="font-display text-navy-950"
              style={textStyleToCss(block.titleStyle)}
            >
              {block.title}
            </h3>
            <p
              className="whitespace-pre-wrap text-slate-600"
              style={textStyleToCss(block.bodyStyle)}
            >
              {block.body}
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}

export function GroupBlockSection({
  block,
  cardGapPx,
}: {
  block: GroupBlock;
  cardGapPx: number;
}) {
  return (
    <section className="scroll-mt-24" id={block.id}>
      <div className="mx-auto max-w-6xl space-y-6 px-6">
        {block.title ? (
          <h2 className="font-display text-3xl font-semibold text-navy-950">
            {block.title}
          </h2>
        ) : null}
        <div
          className={
            block.layout === "grid" ? "grid md:grid-cols-2" : "flex flex-col"
          }
          style={{ gap: cardGapPx }}
        >
          {block.children.map((child) => (
            <NestedBoxView key={child.id} block={child} />
          ))}
        </div>
      </div>
    </section>
  );
}

function NestedBoxView({ block }: { block: NestedBox }) {
  if (block.type === "text") {
    return (
      <div
        className="rounded-2xl border border-slate-200 p-5 shadow-[0_10px_30px_-24px_rgba(10,17,26,0.35)]"
        style={{ background: block.background }}
      >
        <h3
          className="font-display text-navy-950"
          style={textStyleToCss(block.titleStyle)}
        >
          {block.title}
        </h3>
        <p
          className="mt-2 whitespace-pre-wrap text-slate-600"
          style={textStyleToCss(block.bodyStyle)}
        >
          {block.body}
        </p>
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <figure className="overflow-hidden rounded-2xl border border-slate-200">
        <SafeImage
          src={block.src}
          alt={block.alt}
          className="h-auto w-full object-cover"
        />
        {block.caption ? (
          <figcaption className="bg-white px-3 py-2 text-sm text-slate-500">
            {block.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (block.type === "imageText") {
    if (block.textPosition === "overlay") {
      return (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200">
          <SafeImage
            src={block.src}
            alt={block.alt}
            className="block min-h-[12rem] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 space-y-2 p-5">
            <h3 className="font-display" style={textStyleToCss(block.titleStyle)}>
              {block.title}
            </h3>
            <p className="whitespace-pre-wrap" style={textStyleToCss(block.bodyStyle)}>
              {block.body}
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <SafeImage
          src={block.src}
          alt={block.alt}
          className="h-40 w-full rounded-xl object-cover"
        />
        <h3
          className="font-display text-navy-950"
          style={textStyleToCss(block.titleStyle)}
        >
          {block.title}
        </h3>
        <p
          className="whitespace-pre-wrap text-slate-600"
          style={textStyleToCss(block.bodyStyle)}
        >
          {block.body}
        </p>
      </div>
    );
  }

  return (
    <article
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-5 shadow-[0_10px_30px_-24px_rgba(10,17,26,0.35)] sm:flex-row"
      style={{ background: block.background }}
    >
      {block.imageSrc ? (
        <SafeImage
          src={block.imageSrc}
          alt=""
          className="h-24 w-24 shrink-0 rounded-xl object-contain"
        />
      ) : null}
      <div className="space-y-2">
        <h3
          className="font-display text-navy-950"
          style={textStyleToCss(block.titleStyle)}
        >
          {block.title}
        </h3>
        <p
          className="whitespace-pre-wrap text-slate-600"
          style={textStyleToCss(block.bodyStyle)}
        >
          {block.body}
        </p>
      </div>
    </article>
  );
}
