import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Generated content lives in content/generated; agent-facing routes read it at build time.
  // Skills renamed by decision 0052; keep old links working.
  async redirects() {
    return [
      { source: "/skills/to-:name(spec|tasks)", destination: "/skills/:name", permanent: true },
      { source: "/md/skills/to-:name(spec|tasks)", destination: "/md/skills/:name", permanent: true },
    ];
  },
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
