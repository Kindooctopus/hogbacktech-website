"use client";

import { useCallback, useEffect, useState } from "react";
import type { AnalyticsSummary } from "@/lib/analytics";

type Range = AnalyticsSummary["range"];

function pct(part: number, whole: number): string {
  if (!whole) return "0%";
  return `${Math.round((part / whole) * 1000) / 10}%`;
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold text-navy-950">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export default function AdminTrafficPanel() {
  const [range, setRange] = useState<Range>("7d");
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");

  const load = useCallback(async (nextRange: Range) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/analytics?range=${nextRange}`, {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (res.status === 401) {
        setError("Session expired — sign in again.");
        setData(null);
        return;
      }
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setError(err.error ?? `Could not load analytics (${res.status}).`);
        setData(null);
        return;
      }
      setData((await res.json()) as AnalyticsSummary);
    } catch {
      setError("Could not reach the analytics API. Is the Worker deployed?");
      setData(null);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load(range);
  }, [load, range]);

  async function sendEmail() {
    setEmailStatus("Sending…");
    try {
      const res = await fetch("/api/admin/analytics/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ range }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !body.ok) {
        setEmailStatus(body.error ?? `Send failed (${res.status}).`);
        return;
      }
      setEmailStatus("Digest emailed.");
    } catch {
      setEmailStatus("Could not reach the email API.");
    }
  }

  const totals = data?.totals;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-navy-950">
            Traffic
          </h2>
          <p className="text-sm text-slate-500">
            First-party page views from the Cloudflare Worker, split into likely
            human vs bot. Contact conversions are counted when the site fires the
            Contact event.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["1d", "Today"],
              ["7d", "7 days"],
              ["30d", "30 days"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setRange(id)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                range === id
                  ? "bg-navy-950 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            disabled={busy}
            onClick={() => void load(range)}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {busy && !data && (
        <p className="text-sm text-slate-500">Loading traffic…</p>
      )}

      {data && totals && (
        <>
          <p className="text-xs text-slate-500">
            {data.from} → {data.to} (UTC)
            {busy ? " · refreshing…" : ""}
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Page views" value={totals.views} />
            <StatCard
              label="Likely human"
              value={totals.human}
              hint={pct(totals.human, totals.views)}
            />
            <StatCard
              label="Likely bot"
              value={totals.bot}
              hint={pct(totals.bot, totals.views)}
            />
            <StatCard
              label="Uncertain"
              value={totals.likelyBot}
              hint={pct(totals.likelyBot, totals.views)}
            />
            <StatCard label="Conversions" value={totals.conversions} />
          </div>

          <p className="text-xs text-slate-500">{data.botScoringNote}</p>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <h3 className="mb-2 text-sm font-semibold text-navy-950">
                By day
              </h3>
              <div className="max-h-72 overflow-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="px-3 py-2 font-medium">Day</th>
                      <th className="px-3 py-2 text-right font-medium">Views</th>
                      <th className="px-3 py-2 text-right font-medium">Human</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...data.days].reverse().map((day) => (
                      <tr key={day.date} className="border-t border-slate-100">
                        <td className="px-3 py-1.5">{day.date}</td>
                        <td className="px-3 py-1.5 text-right">{day.views}</td>
                        <td className="px-3 py-1.5 text-right">{day.human}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-navy-950">
                Top pages
              </h3>
              <div className="rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="px-3 py-2 font-medium">Path</th>
                      <th className="px-3 py-2 text-right font-medium">Views</th>
                      <th className="px-3 py-2 text-right font-medium">Human</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topPaths.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-3 py-3 text-slate-500"
                        >
                          No page views yet. Numbers appear after the Worker
                          serves real visits.
                        </td>
                      </tr>
                    ) : (
                      data.topPaths.map((row) => (
                        <tr
                          key={row.path}
                          className="border-t border-slate-100"
                        >
                          <td className="max-w-[10rem] truncate px-3 py-1.5">
                            {row.path}
                          </td>
                          <td className="px-3 py-1.5 text-right">{row.views}</td>
                          <td className="px-3 py-1.5 text-right">{row.human}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-navy-950">
                  Countries
                </h3>
                <ul className="space-y-1 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  {data.topCountries.length === 0 ? (
                    <li className="text-slate-500">No data yet</li>
                  ) : (
                    data.topCountries.map((c) => (
                      <li
                        key={c.country}
                        className="flex justify-between gap-2"
                      >
                        <span>{c.country}</span>
                        <span className="text-slate-500">{c.views}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-navy-950">
                  Referrers
                </h3>
                <ul className="space-y-1 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  {data.topReferrers.length === 0 ? (
                    <li className="text-slate-500">No data yet</li>
                  ) : (
                    data.topReferrers.map((r) => (
                      <li
                        key={r.referrer}
                        className="flex justify-between gap-2"
                      >
                        <span className="truncate">{r.referrer}</span>
                        <span className="shrink-0 text-slate-500">
                          {r.views}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <h3 className="text-sm font-semibold text-navy-950">
              Email digests
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              A cron job emails yesterday’s totals every day at 7:00 AM Pacific,
              and a weekly rollup every Monday. Configure Resend secrets on the
              Worker to enable sending.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {data.emailConfigured
                ? "Email secrets look configured."
                : "Missing RESEND_API_KEY, ANALYTICS_EMAIL_TO, and/or ANALYTICS_EMAIL_FROM."}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void sendEmail()}
                className="rounded-full bg-copper-500 px-4 py-1.5 text-sm font-semibold text-navy-950 hover:bg-copper-400"
              >
                Email this {range} summary now
              </button>
              {emailStatus ? (
                <span className="text-sm text-slate-600">{emailStatus}</span>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
