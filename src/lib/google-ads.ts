/** Google Ads account for hogbacktech.com. */
export const GOOGLE_ADS_ID = "AW-18470238075";

/** Contact conversion. Fire after a successful form submit or a developer mailto activation. */
export const CONTACT_CONVERSION_SEND_TO =
  "AW-18470238075/K09VCIryvYQdEPvupedE";

/** Mailbox that counts as the Contact conversion when a visitor opens it. */
export const CONTACT_CONVERSION_EMAIL = "developer@hogbacktech.com";

function normalizeMailtoAddress(value: string): string {
  const trimmed = value.trim().toLowerCase();
  const wrapped = trimmed.match(/<([^>]+)>/);
  return (wrapped ? wrapped[1] : trimmed).trim();
}

/** True when the href opens mailto:developer@hogbacktech.com, with or without a subject. */
export function isDeveloperContactMailto(href: string | null | undefined): boolean {
  if (!href) return false;
  const value = href.trim();
  if (!/^mailto:/i.test(value)) return false;

  const withoutScheme = value.slice("mailto:".length);
  const queryIndex = withoutScheme.indexOf("?");
  const addressPart = queryIndex === -1 ? withoutScheme : withoutScheme.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : withoutScheme.slice(queryIndex + 1);

  let decodedAddress = addressPart;
  try {
    decodedAddress = decodeURIComponent(addressPart);
  } catch {
    decodedAddress = addressPart;
  }

  const recipients = decodedAddress
    .split(/[;,]/)
    .map(normalizeMailtoAddress)
    .filter(Boolean);
  if (recipients.includes(CONTACT_CONVERSION_EMAIL)) return true;

  const to = new URLSearchParams(query).get("to");
  if (!to) return false;
  return to
    .split(/[;,]/)
    .map(normalizeMailtoAddress)
    .includes(CONTACT_CONVERSION_EMAIL);
}

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
  // First-party counter for the admin Traffic digest (best-effort).
  try {
    void fetch("/api/analytics/conversion", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
    });
  } catch {
    /* ignore */
  }
}
