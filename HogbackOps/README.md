# Hogback Ops (Xcode)

Native iOS app for **Hogback Ops** with the real map, layers, branding, and AR Compass bundled in.

## Open this

```text
HogbackOps/HogbackOps.xcodeproj
```

## What’s inside

| Piece | Source |
|-------|--------|
| **Ops Map** tab | Full Hogback Ops web app (bundled under `HogbackOps/WebApp/`) — basemaps, fire/heat/wind/AVL layers, places, search, AR Compass |
| **Compass** tab | Native Core Location heading |
| **App icon** | Hogback Ops brand tile |

The Map tab is not an empty shell: it serves the built site from inside the app over localhost.

## OneDrive (MCFR style)

```bash
cd ~/Library/CloudStorage/OneDrive-Personal/Hogback/hogbacktech-website
git fetch origin
git checkout cursor/hogback-ops-xcode-4887
git pull
open HogbackOps/HogbackOps.xcodeproj
```

In Xcode: set your **Team** under Signing → pick a simulator/device → Run.

## Refresh the bundled map after web changes

```bash
npm run build
# or:
bash scripts/sync-ios-webapp.sh
```

Then rebuild in Xcode.
