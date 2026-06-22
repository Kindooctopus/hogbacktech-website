# Deploy Hogback Docs Admin to Cloudflare Pages

## Cloudflare build settings (required)

In **Workers & Pages → hogback-docs-admin → Settings → Builds**:

| Setting | Value |
|---------|--------|
| **Root directory** | `hogback-docs/admin` |
| **Build command** | `npm run build` |
| **Build output directory** | `out` |

**Build variables** (Settings → Build → Build variables — NOT runtime Variables):

Add all `NEXT_PUBLIC_FIREBASE_*` values and `NODE_VERSION=22`.

### Verify the build log

After deploy, the log **must** show:

```
> hogback-docs-admin@0.1.0 build
```

If you see `hogbacktech-website@0.1.0 build`, the project is deploying the **marketing site** by mistake (no login screen).

### Alternative (if root directory cannot be set)

| Setting | Value |
|---------|--------|
| **Build command** | `cd hogback-docs/admin && npm install && npm run build` |
| **Build output directory** | `hogback-docs/admin/out` |
