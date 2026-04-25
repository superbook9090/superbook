/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled to prevent double renders during debugging
  images: {
    domains: ['localhost'], // Add your image domains here
  },
  experimental: {
    serverActions: {},
  },
  // Enable compression
  compress: true,
};

module.exports = nextConfig;