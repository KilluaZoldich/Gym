import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure for static export
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // GitHub Pages configuration
  basePath: process.env.NODE_ENV === 'production' ? '/Gym' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Gym/' : '',
  
  // Static export optimizations
  images: {
    unoptimized: true, // Required for static export
  },
  
  // PWA optimizations for static deployment
  compress: true,
  
  // Disable server-side features for static export
};

export default nextConfig;
