'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

interface LyricLine {
  time: number;
  text: string;
}

interface Props {
  lyrics: LyricLine[];
  activeIndex: number;
  elapsed: number;
  audioRef: RefObject<HTMLAudioElement | null>;
}

export default function LyricsView({ lyrics, activeIndex, elapsed, audioRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const userScrolledAt = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => { userScrolledAt.current = Date.now(); };
    el.addEventListener('wheel', onScroll, { passive: true });
    el.addEventListener('touchmove', onScroll, { passive: true });
    return () => {
      el.removeEventListener('wheel', onScroll);
      el.removeEventListener('touchmove', onScroll);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || activeIndex < 0) return;
    if (Date.now() - userScrolledAt.current < 4000) return;
    const target = container.querySelector<HTMLElement>(`[data-lyr="${activeIndex}"]`);
    if (!target) return;
    container.scrollTo({
      top: target.offsetTop - container.clientHeight / 2 + target.clientHeight / 2,
      behavior: 'smooth',
    });
  }, [activeIndex]);

  const seekTo = (t: number) => {
    const a = audioRef?.current;
    if (a) { a.currentTime = t; userScrolledAt.current = 0; }
  };

  return (
    <div className="relative h-full select-none" aria-label="Lyrics">
      <div
        ref={containerRef}
        className="relative h-full overflow-y-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        <div style={{ height: '50%' }} aria-hidden />
        {lyrics.map((line, i) => {
          const active = i === activeIndex;
          const next = lyrics[i + 1];
          let fill = 0;
          if (active && next) fill = Math.min(1, Math.max(0, (elapsed - line.time) / (next.time - line.time)));
          else if (active) fill = 1;
          const pct = `${(fill * 100).toFixed(1)}%`;
          const showDots = active && next && next.time - line.time > 8;

          return (
            <div key={i} data-lyr={i}>
              <p
                onClick={() => seekTo(line.time)}
                className="cursor-pointer rounded-xl px-3 py-2.5 text-[15px] font-semibold leading-relaxed transition-all duration-300 ease-out hover:bg-[rgba(var(--ink-rgb),0.06)]"
                style={{
                  transformOrigin: 'left center',
                  transform: `scale(${active ? 1 : 0.95})`,
                  ...(active
                    ? {
                        backgroundImage: `linear-gradient(90deg, var(--ink) ${pct}, rgba(var(--ink-rgb),0.28) ${pct})`,
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                      }
                    : { color: 'rgba(var(--ink-rgb),0.28)' }),
                }}
              >
                {line.text || '·'}
              </p>
              {showDots && (
                <p className="animate-pulse px-3 py-1 text-[13px] tracking-[0.4em] text-ink-3">···</p>
              )}
            </div>
          );
        })}
        <div style={{ height: '50%' }} aria-hidden />
      </div>
    </div>
  );
}
