# Deploy Hogback Docs Admin to Cloudflare Pages

## Cloudflare build settings (required)

In **Workers & Pages → your project → Settings → Builds**:

| Setting | Value |
|---------|--------|
| **Root directory** | `hogback-docs/admin` |
| **Build command** | `npm run build` |
| **Build output directory** | `out` |
| **Node version** | `22` (environment variable `NODE_VERSION=22`) |

If root directory is wrong, the log will show `hogbacktech-website@0.1.0 build` — that means it is building the marketing site, not the admin app. It should show `hogback-docs-admin@0.1.0 build`.

## Environment variables

Add all values from `.env.local`:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Custom domain

1. Pages → **Custom domains** → add `docs.hogbacktech.com`
2. Firebase → **Authentication → Settings → Authorized domains** → add `docs.hogbacktech.com`

## Alternative build command (if root directory cannot be set)

From repo root:

**Build command:** `cd hogback-docs/admin && npm install && npm run build`  
**Build output directory:** `hogback-docs/admin/out`
