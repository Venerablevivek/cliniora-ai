import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the Playwright server (.next-e2e) run alongside your normal `npm run dev`.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
