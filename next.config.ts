import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.IMAGE_DOMAIN
          ? process.env.IMAGE_DOMAIN
          : "**.kinsta.cloud",
      },
      {
        protocol: "http",
        hostname: process.env.IMAGE_DOMAIN
          ? process.env.IMAGE_DOMAIN
          : "**.kinsta.cloud",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
