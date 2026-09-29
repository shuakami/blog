import './style/global.css';
import type { Metadata } from 'next';
import { Inter, Geist_Mono, Noto_Sans_SC } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { LayoutClient } from '@/components/LayoutClient';
import { NAV_ITEMS } from '@/lib/navigation';
import { MusicPlayerProvider } from '@/hooks/use-music-player';
import { GlobalMusicPlayer } from '@/components/music/global-music-player';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const notoSansSC = Noto_Sans_SC({
  variable: '--font-noto-sans-sc',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});

const SITE_DESCRIPTION = 'Notes on code, craft, and the small hours. Written by Shuakami.';

export const metadata: Metadata = {
  title: {
    default: 'Shuakami',
    template: '%s, Shuakami',
  },
  description: SITE_DESCRIPTION,
  keywords: ['Shuakami', 'blog', 'engineering', 'open source', 'Next.js', 'design'],
  authors: [{ name: 'Shuakami', url: 'https://sdjz.wiki' }],
  creator: 'Shuakami',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sdjz.wiki',
    title: 'Shuakami',
    description: SITE_DESCRIPTION,
    siteName: 'Shuakami',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shuakami',
    description: SITE_DESCRIPTION,
    creator: '@luoxiaohei_',
  },
  icons: {
    icon: '/shuakami.jpg',
    apple: '/shuakami.jpg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://stats.axtn.net/api/script.js" data-site-id="2dd9cfab9c53" defer />
      </head>
      <body className={`${inter.variable} ${geistMono.variable} ${notoSansSC.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <MusicPlayerProvider>
            <LayoutClient navItems={NAV_ITEMS} siteName="Shuakami">
              {children}
            </LayoutClient>
            <GlobalMusicPlayer />
          </MusicPlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
