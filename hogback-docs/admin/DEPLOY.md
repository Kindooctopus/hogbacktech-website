# Deploy Hogback Docs Admin to Cloudflare

## The problem (if you see the marketing site or blank /login)

This repo has **two** apps and **two** `wrangler.jsonc` files:

| File | Deploys |
|------|---------|
| `/wrangler.jsonc` | **hogbacktech.com** marketing site |
| `/hogback-docs/admin/wrangler.jsonc` | **Hogback Docs admin** portal |

If Cloudflare uses the **root** wrangler file, `hogback-docs-admin.workers.dev` will show the **wrong website**.

---

## Cloudflare settings for `hogback-docs-admin`

**Workers & Pages → hogback-docs-admin → Settings → Build**

| Setting | Value |
|---------|--------|
| **Build command** | `cd hogback-docs/admin && npm install && npm run build` |
| **Deploy command** | `cd hogback-docs/admin && npx wrangler deploy` |
| **Root directory** | *(leave empty — paths are in the commands above)* |

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
