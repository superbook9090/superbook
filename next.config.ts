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
    serverActions: {
      bodySizeLimit: '2000mb',
    },
  },
  outputFileTracingRoot: process.cwd(),
  // Enable compression
  compress: true,
  async redirects() {
    return [
      { source: '/quiz', destination: '/quiz-maker-free', permanent: true },
      { source: '/quiz-maker', destination: '/quiz-maker-free', permanent: true },
      { source: '/free-quiz-maker', destination: '/quiz-maker-free', permanent: true },
    ];
  },
  async headers() {
    // Dev chunk URLs are path-based (not content-hashed), so immutable caching
    // in development serves stale code after every edit. Prod-only.
    if (process.env.NODE_ENV === 'development') {
      return [];
    }
    return [
      {
        source: '/:path*\\.(svg|png|jpg|jpeg|webp|avif|ico|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;