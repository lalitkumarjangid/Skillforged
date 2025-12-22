import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize images for Vercel
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: false,
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Redirect configuration
  redirects: async () => {
    return [];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: "SkillForged",
  },

  // React strict mode for development warnings
  reactStrictMode: true,

  // Turbopack configuration for Vercel
  turbopack: {
    root: "./",
  },
};

export default nextConfig;
