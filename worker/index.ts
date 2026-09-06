/**
 * Cloudflare Worker: static site assets + content API for the admin editor.
 *
 * Secrets:
 *   npx wrangler secret put ADMIN_PASSWORD --name hogbacktech-website
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
}

const CONTENT_KEY = "site-content-v1";

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

function unauthorized() {
  return json({ error: "Unauthorized" }, 401);
}

function checkAdmin(request: Request, env: Env) {
  const password = env.ADMIN_PASSWORD;
  if (!password) return false;
  const header = request.headers.get("x-admin-password") ?? "";
  return header.length > 0 && header === password;
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
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/api/content" && request.method === "GET") {
    return json(await readStoredContent(env));
  }

  if (path === "/api/admin/login" && request.method === "POST") {
    if (!env.ADMIN_PASSWORD) {
      return json(
        { error: "ADMIN_PASSWORD secret is not set on this Worker." },
        503,
      );
    }
    let body: { password?: string } = {};
    try {
      body = (await request.json()) as { password?: string };
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }
    if (body.password !== env.ADMIN_PASSWORD) return unauthorized();
    return json({ ok: true });
  }

  if (path === "/api/content" && request.method === "PUT") {
    if (!checkAdmin(request, env)) return unauthorized();
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
