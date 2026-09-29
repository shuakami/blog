'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import type { NavItem } from '@/lib/types';
import { ThemeToggle } from './ThemeToggle';
import { NowPlayingRow } from './NowPlayingRow';
import { triggerHaptic, HapticFeedback } from '@/utils/haptics';

interface RailProps {
  navItems: NavItem[];
  siteName: string;
}

export function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/' || pathname.startsWith('/post');
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Rail({ navItems, siteName }: RailProps) {
  const pathname = usePathname() ?? '/';
  const items = navItems.filter((item) => item.enabled);

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-(--rail-w) flex-col justify-between px-8 py-10 md:flex"
      aria-label="Site"
    >
      <div className="flex flex-col gap-10">
        <Link href="/" className="ink-link self-start text-[14px] font-medium tracking-[-0.25px] text-ink">
          {siteName}
        </Link>

        <nav className="flex flex-col">
          {items.map((item, i) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active}
                className="rail-link text-[14px]"
                onClick={() => triggerHaptic(HapticFeedback.Light)}
              >
                <span className="rail-index">{String(i + 1).padStart(2, '0')}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-5">
        <NowPlayingRow />
        <div className="flex items-center gap-2">
          <Link href="/search" className="pill pill-icon" aria-label="Search" onClick={() => triggerHaptic(HapticFeedback.Light)}>
            <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
