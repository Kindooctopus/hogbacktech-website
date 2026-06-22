import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  typescript: {
    tsconfigPath: "tsconfig.build.json",
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
