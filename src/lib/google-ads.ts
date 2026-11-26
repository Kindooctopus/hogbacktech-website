/** Google Ads account for hogbacktech.com. */
export const GOOGLE_ADS_ID = "AW-18470238075";

/** Contact conversion. Fire only after a contact or signup form succeeds. */
export const CONTACT_CONVERSION_SEND_TO =
  "AW-18470238075/K09VCIryvYQdEPvupedE";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function ensureGtagStub(): void {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === "function") return;

  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
}

/** Queue the Contact conversion. Does nothing during ordinary page views. */
export function trackContactConversion(): void {
  if (typeof window === "undefined") return;
  ensureGtagStub();
  window.gtag?.("event", "conversion", {
    send_to: CONTACT_CONVERSION_SEND_TO,
  });
}
