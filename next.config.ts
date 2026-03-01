import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all domains for simplicity, or specify your Supabase project URL
      },
    ],
  },
};

export default nextConfig;
