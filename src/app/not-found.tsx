import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-24 min-h-[80vh] flex items-center justify-center">
      <div className="text-center space-y-8 md:space-y-12">
        {/* 404 标题 */}
        <div className="space-y-4 md:space-y-6">
          <h1 className="text-[120px] sm:text-[160px] md:text-[200px] font-bold tracking-tighter text-black/5 dark:text-white/5 leading-none select-none">
            404
          </h1>
          <div className="space-y-2 md:space-y-3 -mt-16 sm:-mt-20 md:-mt-24">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-black dark:text-white">
              页面不存在
            </h2>
            <p className="text-base sm:text-lg text-black/50 dark:text-white/50 max-w-md mx-auto px-4">
              抱歉，你访问的页面走丢了
            </p>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-12 bg-black/10 dark:bg-white/10" />
          <div className="h-1 w-1 rounded-full bg-black/20 dark:bg-white/20" />
          <div className="h-px w-12 bg-black/10 dark:bg-white/10" />
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 transition-all group w-full sm:w-auto"
          >
            <Home className="w-4 h-4" />
            <span className="font-medium">返回首页</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all group w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">返回上页</span>
          </button>
        </div>

        {/* 建议链接 */}
        <div className="pt-8 md:pt-12 space-y-4">
          <p className="text-sm text-black/40 dark:text-white/40">
            你可能在寻找：
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { href: '/archive', label: '文章归档' },
              { href: '/works', label: '作品展示' },
              { href: '/music', label: '音乐播放器' },
              { href: '/about', label: '关于我' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href as any}
                className="px-4 py-2 text-sm rounded-full bg-black/[0.04] dark:bg-white/[0.04] text-black/60 dark:text-white/60 hover:bg-black/[0.08] dark:hover:bg-white/[0.08] hover:text-black dark:hover:text-white transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 