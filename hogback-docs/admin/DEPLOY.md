# Deploy Hogback Docs Admin to Cloudflare

## The problem (if you see the marketing site or blank /login)

This repo has **two** apps and **two** `wrangler.jsonc` files:

| File | Deploys |
|------|---------|
| `/wrangler.jsonc` | **hogbacktech.com** marketing site |
| `/hogback-docs/admin/wrangler.jsonc` | **Hogback Docs admin** portal |

If Cloudflare uses the **root** wrangler file, `hogback-docs-admin.workers.dev` will show the **wrong website**, or the build will fail the Workers name requirement (`hogbacktech-website` ≠ `hogback-docs-admin`).

---

## Cloudflare settings for `hogback-docs-admin`

**Workers & Pages → hogback-docs-admin → Settings → Build**

| Setting | Value |
|---------|--------|
| **Root directory** | `hogback-docs/admin` |
| **Build command** | `npm run build` |
| **Deploy command** | `npx wrangler deploy` |
| **Non-production branch deploy command** | `npx wrangler versions upload` |

Root directory **must** be `hogback-docs/admin` so Workers Builds validates and deploys with this app’s `wrangler.jsonc` (`name: "hogback-docs-admin"`), not the marketing site config at the repo root.

Until that Root directory is set in the dashboard, the repo-root `wrangler.jsonc` keeps `name: "hogback-docs-admin"` so admin PR checks pass the Workers name requirement. Local marketing-site deploys use `npm run deploy` (passes `--name hogbacktech-website`). The admin `build` script also syncs `out/` to the repo root when `WORKERS_CI=1` so default preview deploys (`npx wrangler versions upload` at repo root) find assets. After Root directory is corrected, restore the root wrangler name to `hogbacktech-website`.

### Build variables (Settings → Build → Build variables)

Not runtime Variables & Secrets.

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hogback-docs
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NODE_VERSION=22
```

### Lockfile note

Cloudflare runs `npm clean-install` (`npm ci`) in the Root directory before the build command. Keep `package-lock.json` in sync with `package.json` (re-run `npm install` in `hogback-docs/admin` after dependency changes). A stale lockfile fails the admin Workers check.

Optional watch path (reduces noise on marketing-only PRs): `hogback-docs/admin/**`

---

## Verify the build log

Must show:

```
> hogback-docs-admin@0.1.0 build
```

Must **NOT** show:

```
> hogbacktech-website@0.1.0 build
```

---

## Test URLs after deploy

- https://hogback-docs-admin.kdphbm5zw7.workers.dev/login/
- Should show **Hogback Docs** sign-in (dark page, email + password)

Not "Solid Foundation. Smart Solutions." (that is the marketing site).

---

## Firebase authorized domains

Add before testing sign-in:

- `hogback-docs-admin.kdphbm5zw7.workers.dev`
- `docs.hogbacktech.com` (when custom domain is ready)

---

## Custom domain

**hogback-docs-admin → Custom domains →** add `docs.hogbacktech.com`
