/**
 * Page-view + conversion analytics for the marketing Worker.
 *
 * Stores daily rollups in CONTENT KV (prefix analytics:day:). Classifies
 * traffic with Cloudflare bot signals when available, otherwise User-Agent
 * heuristics.
 */

import {
  buildAnalyticsSummary,
  emptyDayStats,
  previousUtcDayKey,
  utcDayKey,
  utcDayRange,
  type AnalyticsSummary,
  type DayStats,
  type TrafficKind,
} from "../src/lib/analytics";

export interface AnalyticsEnv {
  CONTENT?: KVNamespace;
  /** Resend API key for digest emails */
  RESEND_API_KEY?: string;
  /** Comma-separated recipient list */
  ANALYTICS_EMAIL_TO?: string;
  /** Verified sender in Resend, e.g. analytics@hogbacktech.com */
  ANALYTICS_EMAIL_FROM?: string;
}

const DAY_KEY_PREFIX = "analytics:day:";
const META_KEY = "analytics:meta";
const RETAIN_DAYS = 90;
const MAP_CAP = 40;

interface AnalyticsMeta {
  botScoreSeen?: boolean;
}

/** Obvious crawlers / automation when Bot Management score is unavailable. */
const BOT_UA =
  /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|phantom|selenium|puppeteer|playwright|wget|curl|python-requests|go-http-client|httpclient|scrapy|ahrefs|semrush|bytespider|gptbot|claudebot|amazonbot|bingpreview|yandex|baidu|duckduck|pingdom|uptimerobot|statuscake|monitor|checker/i;

const STATIC_EXT =
  /\.(js|mjs|css|map|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|eot|mp4|webm|mp3|pdf|xml|txt|json|webmanifest)$/i;

type CfBotFields = {
  botManagement?: {
    score?: number;
    verifiedBot?: boolean;
    corporateProxy?: boolean;
  };
  verifiedBotCategory?: string;
  country?: string;
};

export function analyticsDayKey(date: string): string {
  return `${DAY_KEY_PREFIX}${date}`;
}

export function emailConfigured(env: AnalyticsEnv): boolean {
  return Boolean(
    env.RESEND_API_KEY?.trim() &&
      env.ANALYTICS_EMAIL_TO?.trim() &&
      env.ANALYTICS_EMAIL_FROM?.trim(),
  );
}

export function botScoringNote(botScoreSeen: boolean): string {
  if (botScoreSeen) {
    return "Cloudflare bot score is available on this zone (1 = likely bot, 99 = likely human).";
  }
  return "Using User-Agent heuristics. Enable Bot Fight Mode / Bot Management on the zone for Cloudflare bot scores.";
}

async function readMeta(env: AnalyticsEnv): Promise<AnalyticsMeta> {
  if (!env.CONTENT) return {};
  try {
    const stored = await env.CONTENT.get(META_KEY, "json");
    if (!stored || typeof stored !== "object") return {};
    return stored as AnalyticsMeta;
  } catch {
    return {};
  }
}

async function markBotScoreSeen(env: AnalyticsEnv): Promise<void> {
  if (!env.CONTENT) return;
  const meta = await readMeta(env);
  if (meta.botScoreSeen) return;
  await env.CONTENT.put(META_KEY, JSON.stringify({ botScoreSeen: true }));
}

export function classifyRequest(request: Request): {
  kind: TrafficKind;
  score: number | null;
  verifiedBot: boolean;
} {
  const cf = request.cf as CfBotFields | undefined;
  const ua = request.headers.get("user-agent") ?? "";
  const score =
    typeof cf?.botManagement?.score === "number"
      ? cf.botManagement.score
      : null;
  const verifiedBot = Boolean(
    cf?.botManagement?.verifiedBot || cf?.verifiedBotCategory,
  );

  // Prefer explicit bot signals over a high score (local/miniflare often
  // reports score 99 even for crawler User-Agents).
  if (verifiedBot) {
    return { kind: "bot", score: score ?? 1, verifiedBot: true };
  }
  if (!ua.trim() || BOT_UA.test(ua)) {
    return { kind: "bot", score, verifiedBot: false };
  }

  if (score !== null) {
    if (score <= 30) return { kind: "bot", score, verifiedBot: false };
    if (score <= 50) return { kind: "likely_bot", score, verifiedBot: false };
    return { kind: "human", score, verifiedBot: false };
  }

  return { kind: "human", score: null, verifiedBot: false };
}

/** True when this request should count as a page view. */
export function shouldTrackPageView(request: Request): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  const url = new URL(request.url);
  const path = url.pathname;
  if (path.startsWith("/api/")) return false;
  if (path.startsWith("/admin")) return false;
  if (path.startsWith("/_next/")) return false;
  if (path.startsWith("/cdn-cgi/")) return false;
  if (STATIC_EXT.test(path)) return false;

  const dest = request.headers.get("sec-fetch-dest");
  if (dest && dest !== "document" && dest !== "empty") return false;

  const accept = request.headers.get("accept") ?? "";
  if (accept && !accept.includes("text/html") && !accept.includes("*/*")) {
    return false;
  }
  return true;
}

function normalizePath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed || "/";
}

function referrerHost(request: Request, siteHost: string): string {
  const raw = request.headers.get("referer") || request.headers.get("referrer");
  if (!raw) return "(direct)";
  try {
    const host = new URL(raw).host.toLowerCase();
    if (!host || host === siteHost.toLowerCase()) return "(direct)";
    return host.slice(0, 80);
  } catch {
    return "(invalid)";
  }
}

function bumpCapped(
  map: Record<string, number>,
  key: string,
  amount = 1,
): void {
  map[key] = (map[key] ?? 0) + amount;
  const keys = Object.keys(map);
  if (keys.length <= MAP_CAP) return;
  keys
    .sort((a, b) => map[a] - map[b] || a.localeCompare(b))
    .slice(0, keys.length - MAP_CAP)
    .forEach((k) => {
      delete map[k];
    });
}

function normalizeDay(raw: unknown, date: string): DayStats {
  if (!raw || typeof raw !== "object") return emptyDayStats(date);
  const o = raw as Partial<DayStats>;
  return {
    date,
    views: Number(o.views) || 0,
    human: Number(o.human) || 0,
    bot: Number(o.bot) || 0,
    likelyBot: Number(o.likelyBot) || 0,
    conversions: Number(o.conversions) || 0,
    paths: o.paths && typeof o.paths === "object" ? { ...o.paths } : {},
    humanPaths:
      o.humanPaths && typeof o.humanPaths === "object" ? { ...o.humanPaths } : {},
    countries:
      o.countries && typeof o.countries === "object" ? { ...o.countries } : {},
    referrers:
      o.referrers && typeof o.referrers === "object" ? { ...o.referrers } : {},
  };
}

async function readDay(env: AnalyticsEnv, date: string): Promise<DayStats> {
  if (!env.CONTENT) return emptyDayStats(date);
  try {
    const stored = await env.CONTENT.get(analyticsDayKey(date), "json");
    return normalizeDay(stored, date);
  } catch {
    return emptyDayStats(date);
  }
}

async function writeDay(env: AnalyticsEnv, day: DayStats): Promise<void> {
  if (!env.CONTENT) return;
  await env.CONTENT.put(analyticsDayKey(day.date), JSON.stringify(day));
}

export async function recordPageView(
  request: Request,
  env: AnalyticsEnv,
): Promise<void> {
  if (!shouldTrackPageView(request) || !env.CONTENT) return;

  const url = new URL(request.url);
  const path = normalizePath(url.pathname);
  const { kind, score } = classifyRequest(request);
  const cf = request.cf as CfBotFields | undefined;
  const country = (cf?.country || "ZZ").slice(0, 8);
  const referrer = referrerHost(request, url.host);
  const date = utcDayKey();

  const day = await readDay(env, date);
  day.views += 1;
  if (kind === "human") day.human += 1;
  else if (kind === "bot") day.bot += 1;
  else day.likelyBot += 1;
  bumpCapped(day.paths, path);
  if (kind === "human") bumpCapped(day.humanPaths, path);
  bumpCapped(day.countries, country);
  bumpCapped(day.referrers, referrer);
  await writeDay(env, day);

  if (score !== null) {
    try {
      await markBotScoreSeen(env);
    } catch {
      /* non-fatal */
    }
  }
}

export async function recordConversion(env: AnalyticsEnv): Promise<void> {
  if (!env.CONTENT) return;
  const date = utcDayKey();
  const day = await readDay(env, date);
  day.conversions += 1;
  await writeDay(env, day);
}

export async function loadDays(
  env: AnalyticsEnv,
  from: string,
  to: string,
): Promise<DayStats[]> {
  const keys = utcDayRange(from, to);
  const days: DayStats[] = [];
  for (const date of keys) {
    days.push(await readDay(env, date));
  }
  return days;
}

export async function getAnalyticsSummary(
  env: AnalyticsEnv,
  range: AnalyticsSummary["range"],
): Promise<AnalyticsSummary> {
  const to = utcDayKey();
  const span = range === "1d" ? 0 : range === "7d" ? 6 : 29;
  const fromDate = new Date(`${to}T00:00:00.000Z`);
  fromDate.setUTCDate(fromDate.getUTCDate() - span);
  const from = utcDayKey(fromDate);
  const days = await loadDays(env, from, to);
  const meta = await readMeta(env);
  return buildAnalyticsSummary(
    days,
    range,
    from,
    to,
    emailConfigured(env),
    botScoringNote(Boolean(meta.botScoreSeen)),
  );
}

export async function pruneOldAnalytics(env: AnalyticsEnv): Promise<void> {
  if (!env.CONTENT) return;
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - RETAIN_DAYS);
  const cutoffKey = utcDayKey(cutoff);
  // Delete a sliding window of days just beyond retention (idempotent).
  for (let i = RETAIN_DAYS; i < RETAIN_DAYS + 14; i += 1) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const date = utcDayKey(d);
    if (date >= cutoffKey) continue;
    try {
      await env.CONTENT.delete(analyticsDayKey(date));
    } catch {
      /* ignore */
    }
  }
}

function formatPct(part: number, whole: number): string {
  if (!whole) return "0%";
  return `${Math.round((part / whole) * 1000) / 10}%`;
}

export function renderDigestHtml(
  title: string,
  summary: AnalyticsSummary,
): string {
  const { totals, topPaths, topCountries, topReferrers, from, to } = summary;
  const pathRows = topPaths
    .map(
      (p) =>
        `<tr><td style="padding:4px 8px;border-bottom:1px solid #e2e8f0">${escapeHtml(p.path)}</td><td style="padding:4px 8px;border-bottom:1px solid #e2e8f0;text-align:right">${p.views}</td><td style="padding:4px 8px;border-bottom:1px solid #e2e8f0;text-align:right">${p.human}</td></tr>`,
    )
    .join("");
  const countryRows = topCountries
    .slice(0, 5)
    .map(
      (c) =>
        `<tr><td style="padding:4px 8px;border-bottom:1px solid #e2e8f0">${escapeHtml(c.country)}</td><td style="padding:4px 8px;border-bottom:1px solid #e2e8f0;text-align:right">${c.views}</td></tr>`,
    )
    .join("");
  const refRows = topReferrers
    .slice(0, 5)
    .map(
      (r) =>
        `<tr><td style="padding:4px 8px;border-bottom:1px solid #e2e8f0">${escapeHtml(r.referrer)}</td><td style="padding:4px 8px;border-bottom:1px solid #e2e8f0;text-align:right">${r.views}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html><body style="font-family:ui-sans-serif,system-ui,sans-serif;color:#0f172a;background:#f8fafc;padding:24px">
  <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px">
    <h1 style="margin:0 0 4px;font-size:20px">${escapeHtml(title)}</h1>
    <p style="margin:0 0 16px;color:#64748b;font-size:14px">${escapeHtml(from)} → ${escapeHtml(to)} (UTC)</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px">
      <tr><td style="padding:6px 0">Page views</td><td style="text-align:right;font-weight:600">${totals.views}</td></tr>
      <tr><td style="padding:6px 0">Likely human</td><td style="text-align:right;font-weight:600">${totals.human} <span style="color:#64748b;font-weight:400">(${formatPct(totals.human, totals.views)})</span></td></tr>
      <tr><td style="padding:6px 0">Likely bot</td><td style="text-align:right">${totals.bot}</td></tr>
      <tr><td style="padding:6px 0">Uncertain</td><td style="text-align:right">${totals.likelyBot}</td></tr>
      <tr><td style="padding:6px 0">Contact conversions</td><td style="text-align:right;font-weight:600">${totals.conversions}</td></tr>
    </table>
    <h2 style="font-size:15px;margin:0 0 8px">Top pages</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px">
      <tr style="color:#64748b;text-align:left"><th style="padding:4px 8px">Path</th><th style="padding:4px 8px;text-align:right">Views</th><th style="padding:4px 8px;text-align:right">Human</th></tr>
      ${pathRows || `<tr><td colspan="3" style="padding:8px;color:#64748b">No page views in this period.</td></tr>`}
    </table>
    <h2 style="font-size:15px;margin:0 0 8px">Countries</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px">
      ${countryRows || `<tr><td style="padding:8px;color:#64748b">No data</td></tr>`}
    </table>
    <h2 style="font-size:15px;margin:0 0 8px">Referrers</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:8px">
      ${refRows || `<tr><td style="padding:8px;color:#64748b">No data</td></tr>`}
    </table>
    <p style="margin:16px 0 0;font-size:12px;color:#94a3b8">${escapeHtml(summary.botScoringNote)} Open /admin → Traffic for the live dashboard.</p>
  </div>
</body></html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendDigestEmail(
  env: AnalyticsEnv,
  opts: { subject: string; html: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!emailConfigured(env)) {
    return {
      ok: false,
      error:
        "Set RESEND_API_KEY, ANALYTICS_EMAIL_TO, and ANALYTICS_EMAIL_FROM Worker secrets.",
    };
  }
  const to = env.ANALYTICS_EMAIL_TO!.split(",").map((s) => s.trim()).filter(Boolean);
  if (to.length === 0) {
    return { ok: false, error: "ANALYTICS_EMAIL_TO has no recipients." };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY!.trim()}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.ANALYTICS_EMAIL_FROM!.trim(),
      to,
      subject: opts.subject,
      html: opts.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return {
      ok: false,
      error: `Resend error ${res.status}: ${body.slice(0, 200) || res.statusText}`,
    };
  }
  return { ok: true };
}

/** Daily = previous UTC day. Weekly = previous 7 UTC days, Mondays only. */
export async function runScheduledDigests(
  env: AnalyticsEnv,
  now = new Date(),
): Promise<{ daily?: string; weekly?: string }> {
  const result: { daily?: string; weekly?: string } = {};
  await pruneOldAnalytics(env);

  const yesterday = previousUtcDayKey(now);
  const dailyDays = await loadDays(env, yesterday, yesterday);
  const meta = await readMeta(env);
  const scoring = botScoringNote(Boolean(meta.botScoreSeen));
  const dailySummary = buildAnalyticsSummary(
    dailyDays,
    "1d",
    yesterday,
    yesterday,
    emailConfigured(env),
    scoring,
  );
  const dailyHtml = renderDigestHtml("Hogback Tech — daily traffic", dailySummary);
  const dailySend = await sendDigestEmail(env, {
    subject: `Hogback daily traffic ${yesterday} — ${dailySummary.totals.human} human / ${dailySummary.totals.views} views`,
    html: dailyHtml,
  });
  result.daily = dailySend.ok ? "sent" : dailySend.error;

  // Monday 00:00–24:00 UTC cron → cover previous Mon–Sun (7 days ending yesterday)
  if (now.getUTCDay() === 1) {
    const weekEnd = yesterday;
    const weekStartDate = new Date(`${weekEnd}T00:00:00.000Z`);
    weekStartDate.setUTCDate(weekStartDate.getUTCDate() - 6);
    const weekStart = utcDayKey(weekStartDate);
    const weekDays = await loadDays(env, weekStart, weekEnd);
    const weekSummary = buildAnalyticsSummary(
      weekDays,
      "7d",
      weekStart,
      weekEnd,
      emailConfigured(env),
      scoring,
    );
    const weekHtml = renderDigestHtml(
      "Hogback Tech — weekly traffic",
      weekSummary,
    );
    const weekSend = await sendDigestEmail(env, {
      subject: `Hogback weekly traffic ${weekStart} → ${weekEnd} — ${weekSummary.totals.human} human / ${weekSummary.totals.views} views`,
      html: weekHtml,
    });
    result.weekly = weekSend.ok ? "sent" : weekSend.error;
  }

  return result;
}
