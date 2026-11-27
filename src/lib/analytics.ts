/** Shared traffic analytics types and pure helpers (admin UI + Worker). */

export type TrafficKind = "human" | "bot" | "likely_bot";

export interface DayStats {
  /** Calendar day in UTC, YYYY-MM-DD */
  date: string;
  views: number;
  human: number;
  bot: number;
  likelyBot: number;
  conversions: number;
  /** Path → view count (all traffic) */
  paths: Record<string, number>;
  /** Path → view count (classified human only) */
  humanPaths: Record<string, number>;
  countries: Record<string, number>;
  referrers: Record<string, number>;
}

export interface AnalyticsSummary {
  range: "1d" | "7d" | "30d";
  /** Inclusive UTC start day */
  from: string;
  /** Inclusive UTC end day */
  to: string;
  totals: {
    views: number;
    human: number;
    bot: number;
    likelyBot: number;
    conversions: number;
  };
  days: DayStats[];
  topPaths: { path: string; views: number; human: number }[];
  topCountries: { country: string; views: number }[];
  topReferrers: { referrer: string; views: number }[];
  /** True when email secrets are present on the Worker */
  emailConfigured: boolean;
  /** Human-readable note about bot scoring availability */
  botScoringNote: string;
}

export function emptyDayStats(date: string): DayStats {
  return {
    date,
    views: 0,
    human: 0,
    bot: 0,
    likelyBot: 0,
    conversions: 0,
    paths: {},
    humanPaths: {},
    countries: {},
    referrers: {},
  };
}

/** UTC calendar day string for a Date or epoch ms. */
export function utcDayKey(when: Date | number = Date.now()): string {
  const d = typeof when === "number" ? new Date(when) : when;
  return d.toISOString().slice(0, 10);
}

/** Previous UTC calendar day (for daily digests). */
export function previousUtcDayKey(when: Date | number = Date.now()): string {
  const d = typeof when === "number" ? new Date(when) : new Date(when.getTime());
  d.setUTCDate(d.getUTCDate() - 1);
  return utcDayKey(d);
}

/** Inclusive list of UTC day keys from `from` through `to`. */
export function utcDayRange(from: string, to: string): string[] {
  const start = Date.parse(`${from}T00:00:00.000Z`);
  const end = Date.parse(`${to}T00:00:00.000Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return [];
  const out: string[] = [];
  for (let t = start; t <= end; t += 86_400_000) {
    out.push(utcDayKey(t));
  }
  return out;
}

export interface MergedTrafficTotals {
  views: number;
  human: number;
  bot: number;
  likelyBot: number;
  conversions: number;
  paths: Record<string, number>;
  humanPaths: Record<string, number>;
  countries: Record<string, number>;
  referrers: Record<string, number>;
}

export function mergeDayStats(days: DayStats[]): MergedTrafficTotals {
  const totals: MergedTrafficTotals = {
    views: 0,
    human: 0,
    bot: 0,
    likelyBot: 0,
    conversions: 0,
    paths: {},
    humanPaths: {},
    countries: {},
    referrers: {},
  };
  for (const day of days) {
    totals.views += day.views;
    totals.human += day.human;
    totals.bot += day.bot;
    totals.likelyBot += day.likelyBot;
    totals.conversions += day.conversions;
    bumpMap(totals.paths, day.paths);
    bumpMap(totals.humanPaths, day.humanPaths);
    bumpMap(totals.countries, day.countries);
    bumpMap(totals.referrers, day.referrers);
  }
  return totals;
}

function bumpMap(target: Record<string, number>, source: Record<string, number>) {
  for (const [key, value] of Object.entries(source)) {
    target[key] = (target[key] ?? 0) + value;
  }
}

export function topEntries(
  map: Record<string, number>,
  limit = 10,
): { key: string; count: number }[] {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

export function buildAnalyticsSummary(
  days: DayStats[],
  range: AnalyticsSummary["range"],
  from: string,
  to: string,
  emailConfigured: boolean,
  botScoringNote: string,
): AnalyticsSummary {
  const merged = mergeDayStats(days);
  const pathKeys = new Set([
    ...Object.keys(merged.paths),
    ...Object.keys(merged.humanPaths),
  ]);
  const topPaths = [...pathKeys]
    .map((path) => ({
      path,
      views: merged.paths[path] ?? 0,
      human: merged.humanPaths[path] ?? 0,
    }))
    .sort((a, b) => b.views - a.views || a.path.localeCompare(b.path))
    .slice(0, 10);

  return {
    range,
    from,
    to,
    totals: {
      views: merged.views,
      human: merged.human,
      bot: merged.bot,
      likelyBot: merged.likelyBot,
      conversions: merged.conversions,
    },
    days,
    topPaths,
    topCountries: topEntries(merged.countries).map(({ key, count }) => ({
      country: key,
      views: count,
    })),
    topReferrers: topEntries(merged.referrers).map(({ key, count }) => ({
      referrer: key,
      views: count,
    })),
    emailConfigured,
    botScoringNote,
  };
}
