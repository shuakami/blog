/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 优化静态生成
  output: 'standalone',

  // 实验性功能
  experimental: {
    scrollRestoration: true,
    // 启用新的缓存系统
    typedRoutes: true,
    serverActions: {
      allowedOrigins: ['localhost:3000', 'luoxiaohei.cn'],
    },
    appDir: true,
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

  // 忽略ESLint错误
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
