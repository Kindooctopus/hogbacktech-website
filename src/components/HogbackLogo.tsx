import { company } from "@/lib/content";

/** Full trademark mark — HTML/CSS so it always renders complete on dark backgrounds */
export function HogbackLogo({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5">
        <HogbackRidgeIcon className="h-8 w-10" />
        <div className="leading-none">
          <p className="font-display text-sm font-bold tracking-wide text-white">HOGBACK</p>
          <p className="mt-0.5 text-[9px] font-medium tracking-[0.28em] text-copper-400">
            TECHNOLOGIES
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start">
      <HogbackRidgeIcon className="h-11 w-14 sm:h-12 sm:w-16" />
      <p className="mt-2 font-display text-xl font-bold tracking-wide text-white sm:text-2xl">
        HOGBACK
      </p>
      <p className="mt-1 text-[11px] font-medium tracking-[0.32em] text-copper-400 sm:text-xs">
        TECHNOLOGIES
      </p>
      <p className="mt-1.5 text-[9px] uppercase tracking-[0.18em] text-slate-500 sm:text-[10px]">
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
        stroke="#b87333"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 40 L16 28 L26 34 L36 22 L48 32 L60 26"
        stroke="#64748b"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <path
        d="M4 40 L14 32 L24 36 L34 28 L44 34 L60 30"
        stroke="#475569"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
      <path
        d="M4 40 L12 36 L22 38 L32 34 L42 38 L60 36"
        stroke="#334155"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
    </svg>
  );
}
