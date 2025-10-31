import './style/global.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from "next/font/google";
import { Noto_Sans_SC } from "next/font/google";
import { ThemeProvider } from 'next-themes'
import { LayoutClient } from '@/components/LayoutClient';
import type { NavItem } from '@/lib/types';
import { MusicPlayerProvider } from '@/hooks/use-music-player';
import { GlobalMusicPlayer } from '@/components/music/global-music-player';

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

// 导航项配置
const navItems: NavItem[] = [
  { label: "首页", href: "/", enabled: true },
  { label: "归档", href: "/archive", enabled: true },
  { label: "作品", href: "/works", enabled: true },
  { label: "音乐", href: "/music", enabled: true },
  { label: "关于", href: "/about", enabled: true },
  { label: "好兄弟们", href: "/friends", enabled: true },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansSC.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <MusicPlayerProvider>
            <LayoutClient navItems={navItems} siteName="Shuakami">{children}</LayoutClient>
            <GlobalMusicPlayer />
          </MusicPlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
