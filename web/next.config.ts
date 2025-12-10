import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.garajmuhabbet.com/api/:path*",
        has: [
          {
            type: 'header',
            key: 'accept',
            value: '(?<!text/event-stream).*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
