import Image from "next/image";
import { company } from "@/lib/content";

/** Wordmark in the Hogback Geo chrome: bone name, copper metal, ridge mark. */
export function HogbackLogo({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5">
        <Image
          src="/brand/logo-ridge.png"
          alt=""
          width={671}
          height={270}
          priority
          className="h-7 w-auto"
        />
        <div className="leading-none">
          <p className="font-display text-[15px] font-bold tracking-[0.14em] text-bone">
            HOGBACK
          </p>
          <p className="mt-1 text-[9px] font-semibold tracking-[0.28em] text-copper-600">
            TECHNOLOGIES
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start">
      <Image
        src="/brand/logo-ridge.png"
        alt=""
        width={671}
        height={270}
        className="h-12 w-auto"
      />
      <p className="mt-2 font-display text-2xl font-bold tracking-[0.12em] text-bone">
        HOGBACK
      </p>
      <p className="mt-1 text-[11px] font-semibold tracking-[0.32em] text-copper-600">
        TECHNOLOGIES
      </p>
      <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-sage sm:text-[10px]">
        {company.tagline}
      </p>
    </div>
  );
}
