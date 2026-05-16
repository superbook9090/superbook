/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled to prevent double renders during debugging
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  experimental: {
    serverActions: {},
  },
  // Enable compression
  compress: true,
};

module.exports = nextConfig;