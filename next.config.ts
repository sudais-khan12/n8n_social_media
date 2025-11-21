import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase body size limit for image uploads (10MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
