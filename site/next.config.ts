import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Generated content lives in content/generated; agent-facing routes read it at build time.
  async rewrites() {
    return { beforeFiles: [{ source: "/v1/api/:path*", destination: "/api/:path*" }] };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
