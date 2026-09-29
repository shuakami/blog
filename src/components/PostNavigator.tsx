'use client';

import { useEffect, useState } from 'react';
import { triggerHaptic, HapticFeedback } from '@/utils/haptics';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface PostNavigatorProps {
  headings: Heading[];
}

/* Right-hand tick rail. One mark per heading, the active one grows and names itself. */
export default function PostNavigator({ headings }: PostNavigatorProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 120);
      const probe = window.scrollY + 160;
      let idx = 0;
      for (let i = headings.length - 1; i >= 0; i--) {
        const el = document.getElementById(headings[i].id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= probe) {
          idx = i;
          break;
        }
      }
      setActiveIndex(idx);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [headings]);

  if (headings.length < 2) return null;

  const jump = (i: number) => {
    const el = document.getElementById(headings[i].id);
    if (!el) return;
    triggerHaptic(HapticFeedback.Light);
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: 'smooth' });
  };

  return (
    <nav
      aria-label="Sections"
      className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-2 transition-opacity duration-500 ease-quint lg:flex"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
      onMouseLeave={() => setHovered(null)}
    >
      {headings.map((h, i) => {
        const active = i === activeIndex;
        const showLabel = hovered === i || (hovered === null && active);
        return (
          <button
            key={h.id}
            type="button"
            onClick={() => jump(i)}
            onMouseEnter={() => setHovered(i)}
            aria-label={h.text}
            aria-current={active ? 'true' : undefined}
            className="group flex h-4 items-center justify-end gap-3"
          >
            <span
              className="max-w-[220px] truncate text-[12px] text-ink-2 transition-all duration-300 ease-quint"
              style={{ opacity: showLabel ? 1 : 0, transform: showLabel ? 'none' : 'translateX(4px)' }}
            >
              {h.text}
            </span>
            <span
              className="block h-px rounded-full transition-all duration-300 ease-quint"
              style={{
                width: active ? 24 : h.level <= 2 ? 14 : 8,
                background: active ? 'var(--ink)' : 'var(--ink-3)',
                opacity: active || hovered === i ? 1 : 0.7,
              }}
            />
          </button>
        );
      })}
    </nav>
  );
}
