import type { NextConfig } from "next";

// IMAGE_DOMAIN (the connected WooCommerce host) is injected at deploy time and
// may be absent during the very first build (env-before-build race). Next.js 16
// fatally rejects an images.remotePattern whose hostname is undefined/empty, so
// only include the WooCommerce patterns when the host is actually set.
const imageDomain = process.env.IMAGE_DOMAIN;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images: {
    qualities: [50, 75, 85, 100],
    remotePatterns: [
      ...(imageDomain
        ? [
            { protocol: "https" as const, hostname: imageDomain },
            { protocol: "http" as const, hostname: imageDomain },
          ]
        : []),
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
    contentDispositionType: "inline",
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
