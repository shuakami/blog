/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 60,
    // 允许本地/私有IP（开发环境使用代理时需要）
    dangerouslyAllowLocalIP: true,
  },

  // 优化静态生成
  output: 'standalone',

  // 类型路由
  typedRoutes: true,

  // 实验性功能
  experimental: {
    scrollRestoration: true,
    serverActions: {
      allowedOrigins: ['localhost:3000', 'sdjz.wiki'],
    },
  },

  // 类型检查
  typescript: {
    ignoreBuildErrors: true,
  },

  // 代理配置
  env: {
    HTTPS_PROXY: process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:7890' : undefined,
    HTTP_PROXY: process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:7890' : undefined,
  },

  // 重定向配置
  async redirects() {
    return [
      {
        source: '/posts/:slug',
        destination: '/post/:slug',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
