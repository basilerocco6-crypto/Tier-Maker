import { withWhopAppConfig } from "@whop/react/next.config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{ hostname: "**" }],
  },
  env: {
    NEXT_PUBLIC_WHOP_APP_ID: process.env.NEXT_PUBLIC_WHOP_APP_ID || "app_placeholder_build",
    WHOP_API_KEY: process.env.WHOP_API_KEY || "whop_placeholder_build",
    WHOP_WEBHOOK_SECRET: process.env.WHOP_WEBHOOK_SECRET || "placeholder_secret_build",
  },
  // Disable static generation for pages that require runtime SDK initialization
  experimental: {
    // This helps prevent build-time errors for pages that need runtime data
  },
};

export default withWhopAppConfig(nextConfig);
