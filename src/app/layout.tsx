import './style/global.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from "next/font/google";
import { Noto_Sans_SC } from "next/font/google";
import { ThemeProvider } from 'next-themes'
import ThemeSwitcher from '@/components/ThemeSwitcher';
import SideNav from '@/components/SideNav';
import Header from '@/components/Header';
import RightSidebar from '@/components/RightSidebar';
import MusicPlayer from '@/components/MusicPlayer';
import Footer from '@/components/Footer';
import Image from 'next/image';

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
  title: 'Luoxiaohei',
  description: 'Personal blog and archive',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansSC.variable} font-sans antialiased bg-white/40 dark:bg-black/40 md:bg-gray-50 md:dark:bg-gray-1000`}
      >
        <ThemeProvider defaultTheme="system" enableSystem>
          {/* 夜间模式背景图片 */}
          <div className="hidden dark:block fixed inset-0 -z-10 opacity-20">
            <Image
              src="/developers/assets/avatars/luoxiaohei_background.jpg"
              alt="Background"
              fill
              className="object-cover backdrop-blur-[32px]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>

          <div className="min-h-screen flex">
            {/* 桌面端左侧边栏 */}
            <aside className="hidden md:block w-80 fixed left-0 top-0 h-screen p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <SideNav />
            </aside>
            
            {/* 移动端导航栏 */}
            <div className="md:hidden">
              <Header />
            </div>
            
            {/* 主内容区 */}
            <main className="flex-1 md:ml-80 md:mr-80 px-2 md:px-6 py-4 pt-[72px] md:pt-6 pb-32 md:pb-6 min-h-screen">
              {children}
              
              {/* Footer - 显示在主内容区底部 */}
              <Footer />
            </main>

            {/* 桌面端右侧边栏 */}
            <aside className="hidden md:block w-80 fixed right-0 top-0 h-screen p-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <RightSidebar />
            </aside>

            {/* 音乐播放器 - 移动端底部固定 */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/40 dark:bg-black/40 backdrop-blur-md border-t border-black/5 dark:border-white/10">
              <div className="p-4">
                <MusicPlayer isMobile isFixed />
              </div>
            </div>
          </div>
          <ThemeSwitcher />
        </ThemeProvider>
      </body>
    </html>
  );
}
