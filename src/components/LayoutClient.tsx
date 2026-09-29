'use client';

import { usePathname } from 'next/navigation';
import { Rail } from '@/components/shell/Rail';
import { TopBar } from '@/components/shell/TopBar';
import Footer from '@/components/Footer';
import type { NavItem } from '@/lib/types';

interface LayoutClientProps {
  children: React.ReactNode;
  navItems: NavItem[];
  siteName?: string;
}

const FULLSCREEN = ['/games', '/designs'];
const WIDE = ['/works', '/music', '/resources', '/friends', '/search'];

const matches = (pathname: string, prefixes: string[]) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export function LayoutClient({ children, navItems, siteName = 'Shuakami' }: LayoutClientProps) {
  const pathname = usePathname() ?? '/';
  const isFullscreen = matches(pathname, FULLSCREEN);
  const isWide = matches(pathname, WIDE);

  if (isFullscreen) {
    return <main className="relative min-h-dvh w-full">{children}</main>;
  }

  return (
    <div className="relative min-h-dvh w-full">
      <Rail navItems={navItems} siteName={siteName} />
      <TopBar navItems={navItems} siteName={siteName} />
      <div className="md:pl-(--rail-w)">
        <main className="relative w-full">{children}</main>
        <Footer wide={isWide} />
      </div>
    </div>
  );
}
