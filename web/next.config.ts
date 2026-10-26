import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Pièces de candidature : 10 Mo max par fichier.
    serverActions: { bodySizeLimit: "35mb" },
  },
};

export default nextConfig;
