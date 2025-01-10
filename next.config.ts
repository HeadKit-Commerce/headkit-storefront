import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "headkitthemetemplate.kinsta.cloud",
      },
      {
        protocol: "http",
        hostname: "headkitthemetemplate.kinsta.cloud",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
