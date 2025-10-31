import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images: {
    qualities: [50, 75, 85, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.IMAGE_DOMAIN!,
      },
      {
        protocol: "http",
        hostname: process.env.IMAGE_DOMAIN!,
      },
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
