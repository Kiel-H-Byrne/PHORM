// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    emotion: true,
  },
  // Performance optimizations
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  // Reduce build time
  eslint: {
    // Only run ESLint on build in CI environments
    ignoreDuringBuilds: process.env.CI !== "true",
  },
  typescript: {
    // Only run TypeScript type checking on build in CI environments
    ignoreBuildErrors: process.env.CI !== "true",
  },
};

module.exports = nextConfig;
