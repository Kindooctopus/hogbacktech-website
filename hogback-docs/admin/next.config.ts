import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // Keep tracing rooted at this app so Cloudflare/admin builds do not
  // pick up the marketing-site package graph under the repo root.
  outputFileTracingRoot: __dirname,
  // Admin has no local ESLint flat config; ignoreDuringBuilds prevents Next
  // from walking up to the marketing site's eslint.config.mjs during CI.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
