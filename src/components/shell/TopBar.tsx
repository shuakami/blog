'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import type { NavItem } from '@/lib/types';
import { ThemeToggle } from './ThemeToggle';
import { NowPlayingRow } from './NowPlayingRow';
import { isActivePath } from './Rail';
import { triggerHaptic, HapticFeedback } from '@/utils/haptics';

interface TopBarProps {
  navItems: NavItem[];
  siteName: string;
}

const EASE: [number, number, number, number] = [0.2, 0, 0, 1];

export function TopBar({ navItems, siteName }: TopBarProps) {
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false);
  const items = navItems.filter((item) => item.enabled);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-bg/85 px-5 backdrop-blur md:hidden">
        <Link href="/" className="text-[14px] font-medium text-ink">
          {siteName}
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/search" className="pill pill-icon" aria-label="Search">
            <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
          <ThemeToggle />
          <button
            type="button"
            className="pill pill-text-only"
            aria-expanded={open}
            aria-label="Menu"
            onClick={() => {
              triggerHaptic(HapticFeedback.Medium);
              setOpen((v) => !v);
            }}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            className="fixed inset-0 z-30 flex flex-col justify-between bg-bg px-6 pb-8 pt-20 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <nav className="flex flex-col gap-1">
              {items.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: EASE, delay: i * 0.035 }}
                >
                  <Link
                    href={item.href}
                    data-active={isActivePath(pathname, item.href)}
                    className="rail-link py-2 text-[22px] tracking-[-0.5px]"
                  >
                    <span className="rail-index">{String(i + 1).padStart(2, '0')}</span>
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>
            <NowPlayingRow />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
