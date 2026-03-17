import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Optimised for Vercel & Docker deployments
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow any HTTPS image origin
      },
    ],
  },
};

export default nextConfig;

