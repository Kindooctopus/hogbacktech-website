#!/usr/bin/env bash
# Rebuild the website and copy it into the iOS app bundle folder.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
npm run build
rm -rf HogbackOps/HogbackOps/WebApp
cp -a out HogbackOps/HogbackOps/WebApp
echo "Synced out/ → HogbackOps/HogbackOps/WebApp"
