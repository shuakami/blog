'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion';
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

interface Origin {
  x: number;
  y: number;
  r: number;
}

const IN: [number, number, number, number] = [0.16, 1, 0.3, 1];
const OUT: [number, number, number, number] = [0.7, 0, 0.84, 0];

const disc: Variants = {
  closed: { scale: 0, transition: { duration: 0.42, ease: [0.65, 0, 0.35, 1], delay: 0.1 } },
  open: { scale: 1, transition: { duration: 0.62, ease: [0.32, 0.72, 0, 1] } },
};

const list: Variants = {
  closed: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
  open: { transition: { delayChildren: 0.12, staggerChildren: 0.04 } },
};

const line: Variants = {
  closed: { y: '108%', rotate: 5, opacity: 0, transition: { duration: 0.2, ease: OUT } },
  open: { y: '0%', rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 380, damping: 30, mass: 0.8 } },
};

const tail: Variants = {
  closed: { opacity: 0, y: 10, transition: { duration: 0.16, ease: OUT } },
  open: { opacity: 1, y: 0, transition: { duration: 0.6, ease: IN, delay: 0.34 } },
};

const still: Variants = {
  closed: { opacity: 0, transition: { duration: 0.18 } },
  open: { opacity: 1, transition: { duration: 0.22 } },
};

export function TopBar({ navItems, siteName }: TopBarProps) {
  const pathname = usePathname() ?? '/';
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<Origin>({ x: 0, y: 0, r: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const items = navItems.filter((item) => item.enabled);

  const close = useCallback(() => setOpen(false), []);

  const toggle = () => {
    triggerHaptic(HapticFeedback.Medium);
    const b = buttonRef.current?.getBoundingClientRect();
    if (b) {
      const x = b.left + b.width / 2;
      const y = b.top + b.height / 2;
      const w = window.innerWidth;
      const h = window.innerHeight;
      setOrigin({ x, y, r: Math.hypot(Math.max(x, w - x), Math.max(y, h - y)) + 8 });
    }
    setOpen((v) => !v);
  };

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const { body, documentElement } = document;
    const gap = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        buttonRef.current?.focus();
      }
    };
    const onResize = () => {
      if (window.matchMedia('(min-width: 768px)').matches) close();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      body.style.overflow = '';
      body.style.paddingRight = '';
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open, close]);

  const lineV = reduce ? still : line;
  const tailV = reduce ? still : tail;

  return (
    <>
      <header
        className={`sticky top-0 z-40 flex h-14 items-center justify-between px-5 md:hidden ${open ? 'bg-bg/85' : 'bg-bg/85 backdrop-blur'}`}
      >
        <Link href="/" className="text-[1.125rem] font-bold tracking-[-0.04em] text-ink">
          {siteName}
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/search" className="pill pill-icon" aria-label="Search">
            <Search className="h-4 w-4" strokeWidth={1.75} />
          </Link>
          <ThemeToggle />
          <button
            ref={buttonRef}
            type="button"
            className="pill pill-text-only menu-toggle"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={toggle}
          >
            <span className="menu-toggle-word" data-open={open}>
              <span>Menu</span>
              <span aria-hidden>Close</span>
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={sheetRef}
            id="site-menu"
            key="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-30 flex flex-col justify-between overflow-hidden px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-20 md:hidden"
            initial="closed"
            animate="open"
            exit="closed"
            onAnimationComplete={(def) => {
              if (def !== 'open') return;
              const root = sheetRef.current;
              (root?.querySelector<HTMLElement>('a[data-active="true"]') ?? root?.querySelector<HTMLElement>('a'))?.focus({ preventScroll: true });
            }}
          >
            <motion.span
              aria-hidden
              className="menu-disc"
              style={{ left: origin.x - origin.r, top: origin.y - origin.r, width: origin.r * 2, height: origin.r * 2 }}
              variants={reduce ? still : disc}
            />
            <motion.nav className="relative flex flex-col" variants={reduce ? undefined : list}>
              {items.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href as never}
                    data-active={active}
                    aria-current={active ? 'page' : undefined}
                    className="rail-link menu-link ml-9 py-1 text-[2rem] font-semibold tracking-[-0.03em]"
                    onClick={() => {
                      triggerHaptic(HapticFeedback.Light);
                      if (active) close();
                    }}
                  >
                    <span className="menu-mark" aria-hidden>
                      <span className="hedera" />
                    </span>
                    <span className="menu-line">
                      <motion.span className="menu-word" variants={lineV}>
                        {item.label}
                      </motion.span>
                    </span>
                  </Link>
                );
              })}
            </motion.nav>
            <motion.div className="relative" variants={tailV}>
              <NowPlayingRow />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
