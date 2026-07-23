import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["three", "@react-three/fiber", "@react-three/drei"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "motionsites.ai",
      },
    ],
  },
};

export default nextConfig;
