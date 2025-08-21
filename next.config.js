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
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Only apply optimizations for client production builds
    if (!dev && !isServer) {
      // Split chunks more aggressively
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: "commons",
            chunks: "all",
            minChunks: 2,
          },
          // Extract React and related libraries into a separate chunk
          react: {
            name: "react",
            chunks: "all",
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            priority: 20,
          },
          // Extract Chakra UI into a separate chunk
          chakra: {
            name: "chakra",
            test: /[\\/]node_modules[\\/]@chakra-ui[\\/]/,
            chunks: "all",
            priority: 10,
          },
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;
