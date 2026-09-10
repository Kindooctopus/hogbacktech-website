"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductScreenshot } from "@/lib/site-content";

export function ProductScreenshotGallery({
  productName,
  screenshots,
}: {
  productName: string;
  screenshots: ProductScreenshot[];
}) {
  const shots = screenshots.filter((shot) => shot.src.trim().length > 0);

  return (
    <div className="space-y-10">
      {shots.map((shot) => (
        <ScreenshotFrame
          key={`${shot.src}-${shot.caption}`}
          shot={shot}
          productName={productName}
        />
      ))}
    </div>
  );
}

function ScreenshotFrame({
  shot,
  productName,
}: {
  shot: ProductScreenshot;
  productName: string;
}) {
  const [ratio, setRatio] = useState<number | null>(null);
  const isTablet = ratio !== null && ratio >= 0.85;

  return (
    <figure className="space-y-3">
      <div
        className={`mx-auto overflow-hidden border border-slate-300 bg-navy-950 shadow-[0_22px_60px_-28px_rgba(10,17,26,0.5)] ${
          isTablet
            ? "w-full max-w-5xl rounded-[1.5rem] p-3 sm:p-4"
            : "w-full max-w-[420px] rounded-[2rem] p-2.5 sm:max-w-[460px] sm:p-3"
        }`}
      >
        <div
          className={`overflow-hidden bg-black ${
            isTablet ? "rounded-[1rem]" : "rounded-[1.55rem]"
          }`}
        >
          <Image
            src={shot.src}
            alt={shot.caption || `${productName} screenshot`}
            width={isTablet ? 2048 : 1170}
            height={isTablet ? 1536 : 2532}
            sizes={
              isTablet
                ? "(max-width: 1024px) 100vw, 64rem"
                : "(max-width: 640px) 90vw, 460px"
            }
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
        <figcaption className="mx-auto max-w-3xl text-center text-sm text-slate-600 sm:text-base">
          {shot.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
