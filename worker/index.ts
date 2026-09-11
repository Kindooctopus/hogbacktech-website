/**
 * Cloudflare Worker: static site assets + content API for the admin editor.
 *
 * Secrets:
 *   npx wrangler secret put ADMIN_PASSWORD --name hogbacktech-website
 *   npx wrangler secret put SESSION_SECRET --name hogbacktech-website
 *     (optional but recommended — random 32+ chars; falls back to ADMIN_PASSWORD)
 *
 * KV (optional until configured — without it, GET returns defaults and PUT 503s):
 *   npx wrangler kv namespace create SITE_CONTENT
 *   Add the binding to wrangler.jsonc (see comments there).
 */

import { defaultSiteContent, mergeSiteContent } from "../src/lib/site-content";

export interface Env {
  ASSETS: Fetcher;
  CONTENT?: KVNamespace;
  ADMIN_PASSWORD?: string;
  /** HMAC key for admin session cookies. */
  SESSION_SECRET?: string;
}

const CONTENT_KEY = "site-content-v1";
const SESSION_COOKIE = "hogback_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours
const LOGIN_RATE_LIMIT = 8;
const LOGIN_RATE_WINDOW_MS = 60_000;

const textEncoder = new TextEncoder();

/** Best-effort per-isolate login throttling (resets when the isolate recycles). */
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function json(data: unknown, status = 200, extraHeaders: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });
}

function unauthorized(message = "Unauthorized") {
  return json({ error: message }, 401);
}

function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function allowLoginAttempt(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now >= entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= LOGIN_RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

function sessionSecret(env: Env): string | null {
  const secret = env.SESSION_SECRET?.trim() || env.ADMIN_PASSWORD?.trim();
  return secret && secret.length > 0 ? secret : null;
}

function bytesToBase64Url(bytes: ArrayBuffer): string {
  const bin = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const pad =
      padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const bin = atob(padded + pad);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function createSessionToken(secret: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `v1.admin.${exp}`;
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(payload),
  );
  return `${payload}.${bytesToBase64Url(signature)}`;
}

async function verifySessionToken(
  secret: string,
  token: string,
): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 4) return false;
  const [version, role, expStr, sig] = parts;
  if (version !== "v1" || role !== "admin") return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return false;
  const payload = `${version}.${role}.${expStr}`;
  const sigBytes = base64UrlToBytes(sig);
  if (!sigBytes) return false;
  const key = await hmacKey(secret);
  return crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    textEncoder.encode(payload),
  );
}

function readCookie(request: Request, name: string): string | null {
  const raw = request.headers.get("cookie");
  if (!raw) return null;
  for (const part of raw.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function isHttps(request: Request): boolean {
  return (
    new URL(request.url).protocol === "https:" ||
    Boolean(request.headers.get("cf-visitor")?.includes("https"))
  );
}

function sessionCookieHeader(token: string, request: Request): string {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  if (isHttps(request)) parts.push("Secure");
  return parts.join("; ");
}

function clearSessionCookieHeader(request: Request): string {
  const parts = [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    "Max-Age=0",
  ];
  if (isHttps(request)) parts.push("Secure");
  return parts.join("; ");
}

async function hasValidAdminSession(
  request: Request,
  env: Env,
): Promise<boolean> {
  const secret = sessionSecret(env);
  if (!secret) return false;
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return false;
  return verifySessionToken(secret, token);
}

async function readStoredContent(env: Env) {
  if (!env.CONTENT) return defaultSiteContent;
  try {
    const stored = await env.CONTENT.get(CONTENT_KEY, "json");
    return mergeSiteContent(stored ?? defaultSiteContent);
  } catch {
    return defaultSiteContent;
  }
}

async function handleApi(request: Request, env: Env): Promise<Response> {
  const path = new URL(request.url).pathname;

  if (path === "/api/content" && request.method === "GET") {
    return json(await readStoredContent(env));
  }

  if (path === "/api/admin/session" && request.method === "GET") {
    return json({ ok: await hasValidAdminSession(request, env) });
  }

  if (path === "/api/admin/logout" && request.method === "POST") {
    return json(
      { ok: true },
      200,
      { "set-cookie": clearSessionCookieHeader(request) },
    );
  }

  if (path === "/api/admin/login" && request.method === "POST") {
    if (!env.ADMIN_PASSWORD) {
      return json(
        { error: "ADMIN_PASSWORD secret is not set on this Worker." },
        503,
      );
    }
    const secret = sessionSecret(env);
    if (!secret) {
      return json({ error: "Session signing secret is not configured." }, 503);
    }
    if (!allowLoginAttempt(clientIp(request))) {
      return json(
        { error: "Too many login attempts. Wait a minute and try again." },
        429,
      );
    }

    let body: { password?: string } = {};
    try {
      body = (await request.json()) as { password?: string };
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }
    if (body.password !== env.ADMIN_PASSWORD) return unauthorized();

    const token = await createSessionToken(secret);
    return json(
      { ok: true },
      200,
      { "set-cookie": sessionCookieHeader(token, request) },
    );
  }

  if (path === "/api/content" && request.method === "PUT") {
    if (!(await hasValidAdminSession(request, env))) {
      return unauthorized("Sign in required");
    }
    if (!env.CONTENT) {
      return json(
        {
          error:
            "CONTENT KV binding is not configured. Create a KV namespace and add it to wrangler.jsonc.",
        },
        503,
      );
    }
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }
    const merged = mergeSiteContent(body);
    await env.CONTENT.put(CONTENT_KEY, JSON.stringify(merged));
    return json({ ok: true, content: merged });
  }

  return json({ error: "Not found" }, 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
