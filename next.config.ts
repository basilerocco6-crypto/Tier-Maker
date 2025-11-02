import { withWhopAppConfig } from "@whop/react/next.config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{ hostname: "**" }],
  },
  // Disable static generation for pages that require runtime SDK initialization
  experimental: {
    // This helps prevent build-time errors for pages that need runtime data
  },
};

export default withWhopAppConfig(nextConfig);
