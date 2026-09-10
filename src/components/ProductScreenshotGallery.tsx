"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductScreenshot } from "@/lib/site-content";

const ORGANIC_SHIFTS = [
  { rotate: "-2.4deg", translateY: "0.75rem", z: 2 },
  { rotate: "1.8deg", translateY: "-0.35rem", z: 3 },
  { rotate: "-1.2deg", translateY: "1.1rem", z: 1 },
  { rotate: "2.6deg", translateY: "0.15rem", z: 4 },
  { rotate: "-1.7deg", translateY: "-0.85rem", z: 2 },
  { rotate: "1.1deg", translateY: "0.55rem", z: 3 },
] as const;

export function ProductScreenshotGallery({
  productName,
  screenshots,
}: {
  productName: string;
  screenshots: ProductScreenshot[];
}) {
  const shots = screenshots.filter((shot) => shot.src.trim().length > 0);

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-1/2 h-40 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(201,146,74,0.12),transparent_70%)] blur-2xl"
      />
      <ul className="relative flex flex-wrap items-end justify-center gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:gap-x-8">
        {shots.map((shot, index) => (
          <li
            key={`${shot.src}-${shot.caption}`}
            className="w-[min(100%,18rem)] sm:w-[min(100%,20rem)] lg:w-[min(100%,22rem)]"
          >
            <ScreenshotFrame
              shot={shot}
              productName={productName}
              shift={ORGANIC_SHIFTS[index % ORGANIC_SHIFTS.length]}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScreenshotFrame({
  shot,
  productName,
  shift,
}: {
  shot: ProductScreenshot;
  productName: string;
  shift: (typeof ORGANIC_SHIFTS)[number];
}) {
  const [ratio, setRatio] = useState<number | null>(null);
  const isTablet = ratio !== null && ratio >= 0.85;

  return (
    <figure
      className="space-y-3"
      style={{
        transform: `translateY(${shift.translateY}) rotate(${shift.rotate})`,
        zIndex: shift.z,
      }}
    >
      <div
        className={`overflow-hidden border border-slate-300/90 bg-navy-950 shadow-[0_18px_40px_-24px_rgba(10,17,26,0.55)] transition duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_28px_55px_-22px_rgba(10,17,26,0.45)] ${
          isTablet
            ? "rounded-[1.25rem] p-2.5 sm:p-3"
            : "rounded-[1.75rem] p-2 sm:rounded-[2rem] sm:p-2.5"
        }`}
      >
        <div
          className={`overflow-hidden bg-black ${
            isTablet ? "rounded-[0.85rem]" : "rounded-[1.35rem] sm:rounded-[1.55rem]"
          }`}
        >
          <Image
            src={shot.src}
            alt={shot.caption || `${productName} screenshot`}
            width={isTablet ? 2048 : 1170}
            height={isTablet ? 1536 : 2532}
            sizes="(max-width: 640px) 72vw, (max-width: 1024px) 20rem, 22rem"
            className="h-auto w-full object-contain object-top"
            onLoadingComplete={(img) => {
              if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                setRatio(img.naturalWidth / img.naturalHeight);
              }
            }}
          />
        </div>
      </div>
      {shot.caption ? (
        <figcaption className="px-2 text-center text-sm leading-snug text-slate-600">
          {shot.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
