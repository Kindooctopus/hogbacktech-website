# Hogback Ops (Xcode)

Native iOS shell for **Hogback Ops** — same idea as your MCFR apps: open this project in Xcode from OneDrive.

## File to open

```
HogbackOps/HogbackOps.xcodeproj
```

That is the Xcode project. Double‑click it or open it from Xcode → File → Open.

## Put it in OneDrive (MCFR style)

On your Mac:

```bash
mkdir -p ~/Library/CloudStorage/OneDrive-Personal/Hogback
cp -R /path/to/hogbacktech-website/HogbackOps \
  ~/Library/CloudStorage/OneDrive-Personal/Hogback/
open ~/Library/CloudStorage/OneDrive-Personal/Hogback/HogbackOps/HogbackOps.xcodeproj
```

Or drag the `HogbackOps` folder into `OneDrive/Hogback/`, then open `HogbackOps.xcodeproj`.

Work in that OneDrive copy going forward (like MCFR). Avoid editing a second copy elsewhere.

## What’s in the app

| Tab | What it does |
|-----|----------------|
| **Map** | Loads the Hogback Ops web map (`/apps/ops`) — Geo layers + in-map AR Compass |
| **Compass** | Native Core Location heading rose |

## First run in Xcode

1. Open `HogbackOps.xcodeproj`
2. Select your **Team** under Signing & Capabilities (set `DEVELOPMENT_TEAM`)
3. Pick an iPhone simulator or your device
4. Press Run (▶)

Location permission is required for the Compass tab. Camera permission is declared for the web AR Compass inside the Map tab.

## Optional: local web map URL

In `HogbackOps/Views/OpsMapView.swift`, change `opsURL` if you want a preview/local build instead of `https://hogbacktech.com/apps/ops`.
