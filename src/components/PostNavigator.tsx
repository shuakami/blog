'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { triggerHaptic, HapticFeedback } from '@/utils/haptics';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface PostNavigatorProps {
  headings: Heading[];
}

const ROW = 18;
const REACH = 64;
const spring = { type: 'spring', stiffness: 520, damping: 42, mass: 0.6 } as const;

function Tick({ index, level, state, pointerY, calm }: { index: number; level: number; state: 'past' | 'active' | 'ahead'; pointerY: MotionValue<number>; calm: boolean }) {
  const base = state === 'active' ? 22 : level <= 2 ? 12 : 7;
  const center = index * ROW + ROW / 2;
  const target = useTransform(pointerY, (y) => {
    if (calm || y < 0) return base;
    const d = Math.abs(y - center);
    return base + Math.max(0, Math.cos(Math.min(d / REACH, 1) * (Math.PI / 2))) * 12;
  });
  const width = useSpring(target, { stiffness: 480, damping: 38, mass: 0.5 });
  return (
    <motion.span
      className="block h-[1.5px] flex-none rounded-full"
      style={{ width }}
      animate={{
        backgroundColor: state === 'active' ? 'var(--ink)' : state === 'past' ? 'var(--ink-2)' : 'var(--ink-3)',
        opacity: state === 'ahead' ? 0.55 : 1,
      }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
    />
  );
}

/* Right-hand tick rail. Ticks swell under the pointer; hovering opens the full outline. */
export default function PostNavigator({ headings }: PostNavigatorProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const labelsRef = useRef<HTMLUListElement>(null);
  const [labelWidth, setLabelWidth] = useState(0);
  const pointerY = useMotionValue(-1);
  const calm = Boolean(useReducedMotion());

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

  useLayoutEffect(() => {
    setLabelWidth(labelsRef.current?.offsetWidth ?? 0);
  }, [headings]);

  if (headings.length < 2) return null;

  const jump = (i: number) => {
    const el = document.getElementById(headings[i].id);
    if (!el) return;
    triggerHaptic(HapticFeedback.Light);
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: 'smooth' });
  };

  const focus = hovered ?? activeIndex;

  return (
    <nav
      aria-label="Sections"
      className="fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 transition-opacity duration-500 ease-quint lg:block"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => {
        setOpen(false);
        setHovered(null);
        pointerY.set(-1);
      }}
      onMouseMove={(e) => {
        const top = listRef.current?.getBoundingClientRect().top;
        if (top !== undefined) pointerY.set(e.clientY - top);
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            aria-hidden
            className="absolute -inset-y-3.5 -right-3 origin-right rounded-[18px] bg-[color-mix(in_srgb,color-mix(in_srgb,var(--bg)_95%,var(--ink))_90%,transparent)] backdrop-blur-xl"
            style={{ left: -(labelWidth + 22) }}
            initial={{ opacity: 0, scaleX: 0.9, scaleY: 0.97 }}
            animate={{ opacity: 1, scaleX: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleX: 0.94, scaleY: 0.98, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } }}
            transition={spring}
          />
        )}
      </AnimatePresence>

      <ul
        ref={labelsRef}
        aria-hidden={!open}
        className="absolute right-full top-0 flex flex-col items-end pr-1"
        style={{ pointerEvents: open ? 'auto' : 'none' }}
      >
        {headings.map((h, i) => {
          const active = i === activeIndex;
          const delay = open ? Math.min(Math.abs(i - focus) * 0.018, 0.2) : 0;
          return (
            <li key={h.id} style={{ height: ROW }}>
              <button
                type="button"
                tabIndex={-1}
                onClick={() => jump(i)}
                onMouseEnter={() => setHovered(i)}
                className="flex h-full items-center outline-none"
              >
                <motion.span
                  className={`block max-w-[15rem] truncate whitespace-nowrap text-[12.5px] leading-none tracking-[-0.01em] ${active ? 'font-semibold' : 'font-medium'}`}
                  style={{ paddingLeft: h.level > 2 ? 10 : 0 }}
                  initial={false}
                  animate={{
                    opacity: open ? 1 : 0,
                    x: open ? 0 : 8,
                    filter: open ? 'blur(0px)' : 'blur(3px)',
                    color: hovered === i || (hovered === null && active) ? 'var(--ink)' : 'var(--ink-2)',
                  }}
                  transition={open ? { ...spring, delay, color: { duration: 0.2 } } : { duration: 0.14, ease: [0.4, 0, 1, 1] }}
                >
                  {h.text}
                </motion.span>
              </button>
            </li>
          );
        })}
      </ul>

      <ul ref={listRef} className="relative flex flex-col items-end">
        {headings.map((h, i) => {
          const active = i === activeIndex;
          const state = active ? 'active' : i < activeIndex ? 'past' : 'ahead';
          return (
            <li key={h.id} style={{ height: ROW }}>
              <button
                type="button"
                onClick={() => jump(i)}
                onMouseEnter={() => setHovered(i)}
                onFocus={() => {
                  setOpen(true);
                  setHovered(i);
                }}
                onBlur={() => {
                  setOpen(false);
                  setHovered(null);
                }}
                aria-label={h.text}
                aria-current={active ? 'true' : undefined}
                className="flex h-full w-[34px] items-center justify-end outline-none"
              >
                <Tick index={i} level={h.level} state={state} pointerY={pointerY} calm={calm} />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
