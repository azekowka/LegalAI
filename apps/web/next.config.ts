import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com", "static.tildacdn.pro"],
  },
};

export default nextConfig;
