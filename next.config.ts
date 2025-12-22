import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-expect-error - turbopack property might be missing in NextConfig type
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    // Reduce workers to avoid spawn UNKNOWN errors in constrained environments
    cpus: 4,
  },
};

export default nextConfig;
