import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Phase 1 seed photos only come from picsum.photos (no infra cost, no
    // account needed). Restricted to this exact hostname, never a wildcard,
    // to avoid Next.js Image Optimization fetching arbitrary remote URLs
    // (T-03-02). Real user-uploaded photo storage arrives in Phase 5.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
