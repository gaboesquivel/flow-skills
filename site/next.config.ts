import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Generated content lives in content/generated; agent-facing routes read it at build time.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Link", value: '</llms.txt>; rel="describedby"; type="text/plain", </.well-known/mcp.json>; rel="mcp"' },
        ],
      },
    ];
  },
};

export default nextConfig;
