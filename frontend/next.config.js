/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // For test env: static assets served from /test/_next/static/ so ALB routes them correctly
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  async rewrites() {
    // TEST env: ALB routes /test/* → this container, but API routes live at /api/*.
    // Rewrite /test/api/:path* → /api/:path* so browser calls to /test/api/... resolve internally.
    if (process.env.NEXT_PUBLIC_BASE_PATH === '/test') {
      return [{ source: '/test/api/:path*', destination: '/api/:path*' }];
    }
    return [];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'd143jkdkye8i79.cloudfront.net',
      },
    ],
    // ECS runs in private subnet with no NAT — cannot fetch external URLs
    // server-side for optimization. Set unoptimized:true so <Image> renders
    // the src URL directly; browser fetches from CloudFront without proxying.
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    NEXT_PUBLIC_MEDIA_BASE_URL: process.env.NEXT_PUBLIC_MEDIA_BASE_URL || '/media',
  },
};

module.exports = nextConfig;
