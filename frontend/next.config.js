/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      // Rewrite root path to /home to bypass the ISR cache issue
      // where CloudFront requests to "/" receive a cached _not-found response.
      // The /home route uses home.html (not index.html), avoiding the conflict.
      {
        source: '/',
        destination: '/home',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'd143jkdkye8i79.cloudfront.net',
      },
    ],
    // Allow locally uploaded images (served from /uploads/*)
    unoptimized: false,
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    NEXT_PUBLIC_MEDIA_BASE_URL: process.env.NEXT_PUBLIC_MEDIA_BASE_URL || '/media',
  },
};

module.exports = nextConfig;
