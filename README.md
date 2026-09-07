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

2. **Set the admin password** (Worker secret):

   ```bash
   npx wrangler secret put ADMIN_PASSWORD --name hogbacktech-website
   ```

3. **Deploy** (`npm run build && npm run deploy`), then open `https://hogbacktech.com/admin`.

Without KV, the site still loads bundled defaults; Save in `/admin` returns an error until the binding is configured. Without `ADMIN_PASSWORD`, login is disabled.

### What you can edit

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
└── index.ts                # GET/PUT /api/content, POST /api/admin/login
```
