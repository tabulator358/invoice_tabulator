import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/CZ:templateId",
        destination: "/CZ/:templateId",
      },
    ];
  },
};

export default nextConfig;
