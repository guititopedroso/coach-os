import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Para Hostinger Node.js
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
