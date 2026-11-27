# Hogback Tech Website

Marketing site for [Hogback Tech](https://hogbacktech.com) — mission-critical software for public safety, fleets, and field operations.

## Tech Stack

- **Next.js 15** (App Router, static export → `out/`)
- **React 19** + **Tailwind CSS 4** + **TypeScript**
- **Cloudflare Workers** (static assets + `/api/*` content API)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Local `next dev` serves the static UI with bundled default copy; the content API only runs when the site is served through the Worker.

## Build & Deploy

```bash
npm run build
npm run deploy   # wrangler deploy --name hogbacktech-website
```

Workers Builds should build with `npm run build` and deploy assets from `out/`. The Worker entry is `worker/index.ts`.

## Homepage admin editor

Edit homepage text, product boxes, spacing, and colors in the browser at **`/admin`**.

### One-time Cloudflare setup

1. **Create a KV namespace** (stores saved content):

   ```bash
   npx wrangler kv namespace create SITE_CONTENT
   npx wrangler kv namespace create SITE_CONTENT --preview
   ```

   Add the returned IDs to `wrangler.jsonc` under `kv_namespaces` with binding `CONTENT` (see comments in that file).

2. **Set admin secrets** (Worker secrets):

   ```bash
   npx wrangler secret put ADMIN_PASSWORD --name hogbacktech-website
   npx wrangler secret put SESSION_SECRET --name hogbacktech-website
   ```

   Use a strong unique password. `SESSION_SECRET` should be a random 32+ character string
   (signs the HttpOnly admin session cookie). If omitted, the Worker falls back to
   `ADMIN_PASSWORD` for signing.

3. **Optional — traffic email digests** (Resend):

   ```bash
   npx wrangler secret put RESEND_API_KEY --name hogbacktech-website
   npx wrangler secret put ANALYTICS_EMAIL_TO --name hogbacktech-website
   npx wrangler secret put ANALYTICS_EMAIL_FROM --name hogbacktech-website
   ```

   `ANALYTICS_EMAIL_TO` accepts a comma-separated list. `ANALYTICS_EMAIL_FROM` must be a
   sender address verified in [Resend](https://resend.com) (for example
   `analytics@hogbacktech.com`). A Worker cron emails **yesterday’s** traffic every day at
   **7:00 AM Pacific**, and a **weekly** rollup every Monday. The **/admin → Traffic** tab
   shows live rollups and can send a manual digest.

   Page views are counted in the Worker (not only in the browser), so bots that never run
   JavaScript still appear. Classification uses Cloudflare bot scores when the zone provides
   them; otherwise User-Agent heuristics. Contact conversions also increment the first-party
   counter when the site fires the Google Ads Contact conversion.

4. **Deploy** (`npm run build && npm run deploy`), then open `https://hogbacktech.com/admin`.

Without KV, the site still loads bundled defaults; Save in `/admin` returns an error until the
binding is configured. Without `ADMIN_PASSWORD`, login is disabled.

Login creates a **12-hour HttpOnly, Secure, SameSite=Strict** session cookie. The password is
not stored in the browser after sign-in. Failed logins are rate-limited. For multifactor, put
**Cloudflare Access** in front of `/admin` (email one-time codes) — that is the recommended pro
MFA path for this site.

### What you can edit

- **Homepage video:** the Hero section sets the full-width film (`/media/homepage-ad.mp4` by default). Change the path or upload a replacement MP4 (up to 24 MB), then Save. The homepage plays whatever path was last saved.
- **Layout:** drag page sections to reorder; add text boxes, images, image+text, or content boxes
- **Theme:** whole-page font themes, body size, heading scale, colors, spacing
- **Per section:** copy plus title/body text size, weight, alignment, and color
- Product cards can be reordered independently inside the Products section

Saved content is merged over defaults in `src/lib/site-content.ts`, so new fields keep working after deploys.

## Project structure

```
src/
├── app/
│   ├── admin/          # In-browser homepage editor
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── HogbackLandingPage.tsx
└── lib/
    ├── content.ts          # Shared company/product metadata
    ├── site-content.ts     # Editable homepage schema + defaults
    └── use-site-content.ts # Client fetch of /api/content
worker/
├── index.ts                # Content API, traffic tracking, digest cron
└── analytics.ts            # Bot/human classification + KV rollups + email
```

## Traffic analytics

After deploy, open **`/admin` → Traffic** for daily / 7-day / 30-day views with likely-human vs
bot split, top pages, countries, and referrers. Rollups live in the existing `CONTENT` KV
namespace (`analytics:day:*`). An Analytics Engine dataset `hogback_traffic` also receives raw
datapoints when the binding is active.
