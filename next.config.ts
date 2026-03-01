import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', 
      },
    ],
  },
  allowedDevOrigins: [
    '*.replit.dev',
    '*.repl.co',
    '*.sisko.replit.dev',
    '*.kirk.replit.dev',
    '*.spock.replit.dev',
  ],
};

export default nextConfig;
