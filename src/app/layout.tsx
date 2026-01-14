import './style/global.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from "next/font/google";
import { Noto_Sans_SC } from "next/font/google";
import { ThemeProvider } from 'next-themes'
import { LayoutClient } from '@/components/LayoutClient';
import { NAV_ITEMS } from '@/lib/navigation';
import { MusicPlayerProvider } from '@/hooks/use-music-player';
import { GlobalMusicPlayer } from '@/components/music/global-music-player';
import { ChristmasEffect } from '@/components/ChristmasEffect';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

// 思源黑体 - 用于中文文本
const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'Shuakami',
  description: '编程、创作、生活。Ciallo～(∠・ω< )⌒★',
  keywords: ['Shuakami', '个人博客', '技术博客', '开源项目', 'Web开发', 'AI', 'Next.js'],
  authors: [{ name: 'Shuakami', url: 'https://sdjz.wiki' }],
  creator: 'Shuakami',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://sdjz.wiki',
    title: 'Shuakami',
    description: '编程、创作、生活。Ciallo～(∠・ω< )⌒★',
    siteName: 'Shuakami',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shuakami',
    description: '编程、创作、生活。Ciallo～(∠・ω< )⌒★',
    creator: '@luoxiaohei_',
  },
  icons: {
    icon: '/shuakami.jpg',
    apple: '/shuakami.jpg',
  },
};

// 导航项配置从统一配置文件导入
const navItems = NAV_ITEMS;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="christmas">
      <head>
        <script
          src="https://stats.axtn.net/api/script.js"
          data-site-id="2dd9cfab9c53"
          defer
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // 安全检查
                  if (!document.documentElement || !document.body) return;
                  
                  const path = window.location.pathname;
                  
                  // 立即读取并应用布局和背景配置，避免闪烁
                  const config = localStorage.getItem('appearance-config');
                  if (config) {
                    const { layoutMode, backgroundStyle } = JSON.parse(config);
                    
                    // 应用布局类 - 支持强制布局
                    let layout = layoutMode || 'default';
                    
                    // 音乐页面、游戏页面强制宽屏布局
                    if (path.startsWith('/music') || path.startsWith('/games')) {
                      layout = 'wide';
                    }
                    // 作品页面强制紧凑布局
                    else if (path.startsWith('/works')) {
                      layout = 'compact';
                    }
                    
                    if (document.documentElement) {
                      document.documentElement.classList.add('layout-' + layout);
                    }
                    
                    // 应用背景类
                    const NO_BG_PAGES = ['/music', '/works', '/friends', '/resources', '/games'];
                    const shouldDisableBg = NO_BG_PAGES.some(page => path.startsWith(page));
                    
                    if (!shouldDisableBg && backgroundStyle && backgroundStyle !== 'none' && document.body) {
                      document.body.classList.add('background-' + backgroundStyle);
                    }
                  } else {
                    // 默认布局
                    if (document.documentElement) {
                      document.documentElement.classList.add('layout-default');
                    }
                  }
                  
                  // 立即读取 sidebar 状态并应用样式变量，避免 padding 闪烁
                  const sidebarOpen = localStorage.getItem('sidebar-open');
                  if (document.documentElement) {
                    if (sidebarOpen === 'true' && window.innerWidth >= 768) {
                      // 桌面端 sidebar 打开时，立即设置 padding
                      document.documentElement.style.setProperty('--sidebar-padding', '216px');
                    } else {
                      document.documentElement.style.setProperty('--sidebar-padding', '24px');
                    }
                    
                    // 标记 sidebar 未初始化，禁用 transition
                    document.documentElement.classList.add('sidebar-initializing');
                  }
                } catch (e) {
                  console.error('Failed to apply layout:', e);
                  if (document.documentElement) {
                    document.documentElement.classList.add('layout-default');
                    document.documentElement.style.setProperty('--sidebar-padding', '24px');
                    document.documentElement.classList.add('sidebar-initializing');
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansSC.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <MusicPlayerProvider>
            <LayoutClient navItems={navItems} siteName="Shuakami">{children}</LayoutClient>
            <GlobalMusicPlayer />
            <ChristmasEffect zIndex={0} showCursorHat={true} />
          </MusicPlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
