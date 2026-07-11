import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile local workspace packages (they ship TypeScript source directly)
  transpilePackages: ["@outreach/shared", "@outreach/database", "@outreach/server"],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
