import { company } from "@/lib/content";

/** Wordmark in the Hogback Geo chrome: bone name, copper metal, ridge mark. */
export function HogbackLogo({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5">
        <HogbackRidgeIcon className="h-7 w-9" />
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
      <HogbackRidgeIcon className="h-11 w-14 sm:h-12 sm:w-16" />
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

function HogbackRidgeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 40 L18 18 L28 26 L38 10 L52 22 L60 16"
        stroke="#c47a48"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 40 L16 28 L26 34 L36 22 L48 32 L60 26"
        stroke="#c4a870"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <path
        d="M4 40 L14 32 L24 36 L34 28 L44 34 L60 30"
        stroke="#8a946c"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
}
