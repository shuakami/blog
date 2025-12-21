import Link from 'next/link';
import Image from 'next/image';
import { Route } from 'next';
import { NAV_ITEMS_LEGACY as NAV_ITEMS } from '@/lib/navigation';

export default function SideNav() {
  return (
    <div className="space-y-6">
      {/* 个人信息卡片 */}
      <div className="card bg-white/40 dark:bg-black/40 rounded-xl p-6 
        backdrop-blur-md
        border border-black/5 dark:border-white/10
        shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.04)]">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-black/5 dark:bg-white/5">
            <Image
              src="/friends/assets/avatars/shuakami.jpg"
              alt="Shuakami"
              width={96}
              height={96}
              className="object-cover"
            />
          </div>
          <h1 className="text-xl font-medium mb-2 text-black dark:text-white">Shuakami</h1>
          <p className="text-sm text-black/60 dark:text-white/60 mb-4">Full-stack developer & designer</p>
          
          {/* 社交链接 */}
          <div className="flex space-x-4">
            <a href="https://github.com/shuakami" target="_blank" rel="noopener noreferrer" 
              className="text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="mailto:12519212@qq.com"
              className="text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </a>
            <a href="/rss" target="_blank" rel="noopener noreferrer"
              className="text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* 导航卡片 */}
      <nav className="card bg-white/40 dark:bg-black/40 rounded-xl overflow-hidden
        backdrop-blur-md
        border border-black/5 dark:border-white/10
        shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.04)]">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            href={item.path as Route}
            className="flex items-center px-6 py-4 text-black/80 dark:text-white/80
              hover:bg-black/5 dark:hover:bg-white/5
              border-b border-black/5 dark:border-white/5 last:border-0
              transition-colors"
          >
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* 博客统计卡片 */}
      <div className="card bg-white/40 dark:bg-black/40 rounded-xl p-6
        backdrop-blur-md
        border border-black/5 dark:border-white/10
        shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.04)]">
        <h2 className="text-sm font-medium text-black/60 dark:text-white/60 mb-4">博客统计</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-black/40 dark:text-white/40">文章数</span>
            <span className="text-black/80 dark:text-white/80">24</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black/40 dark:text-white/40">运行时间</span>
            <span className="text-black/80 dark:text-white/80">2年</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black/40 dark:text-white/40">最后更新</span>
            <span className="text-black/80 dark:text-white/80">2天前</span>
          </div>
        </div>
      </div>
    </div>
  );
} 