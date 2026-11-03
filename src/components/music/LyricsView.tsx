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

const INTERLUDE_GAP = 6;

export default function LyricsView({ lyrics, activeIndex, elapsed, audioRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const userScrolledAt = useRef(0);

  // 用户手动滚动后暂停自动跟随 4s
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
    const el = containerRef.current;
    if (!el || activeIndex < 0) return;
    if (Date.now() - userScrolledAt.current < 4000) return;
    const target = el.querySelector<HTMLElement>(`[data-lyr="${activeIndex}"]`);
    if (!target) return;
    el.scrollTo({
      top: target.offsetTop - el.clientHeight / 2 + target.clientHeight / 2,
      behavior: 'smooth',
    });
  }, [activeIndex]);

  const seekTo = (t: number) => {
    const a = audioRef?.current;
    if (a) { a.currentTime = t; userScrolledAt.current = 0; }
  };

  return (
    <div className="relative mt-14 select-none" aria-label="Lyrics">
      {/* 顶部渐隐 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16"
        style={{ background: 'linear-gradient(to bottom, var(--bg), transparent)' }}
      />
      <div
        ref={containerRef}
        className="h-64 overflow-y-auto py-28 md:h-80 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {lyrics.map((line, i) => {
          const active = i === activeIndex;
          const dist = Math.abs(i - Math.max(activeIndex, 0));
          const next = lyrics[i + 1];
          // 行内卡拉OK填色进度
          let fill = 0;
          if (active && next) fill = Math.min(1, Math.max(0, (elapsed - line.time) / (next.time - line.time)));
          else if (active) fill = 1;
          const pct = `${(fill * 100).toFixed(1)}%`;
          const showDots = active && next && next.time - line.time > INTERLUDE_GAP;

          return (
            <div key={i} data-lyr={i}>
              <p
                onClick={() => seekTo(line.time)}
                className="cursor-pointer py-2 text-center leading-snug transition-all duration-500 ease-out"
                style={{
                  fontSize: active ? 22 : dist === 1 ? 16 : 14,
                  fontWeight: active ? 600 : 400,
                  letterSpacing: active ? '0.02em' : 0,
                  opacity: activeIndex < 0 ? 0.5 : active ? 1 : Math.max(0.15, 0.45 - dist * 0.12),
                  filter: active ? 'none' : `blur(${Math.min(dist * 0.6, 2.5)}px)`,
                  transform: `scale(${active ? 1 : 0.97})`,
                  ...(active
                    ? {
                        backgroundImage: `linear-gradient(90deg, var(--ink) ${pct}, var(--ink-4, var(--ink-3)) ${pct})`,
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                      }
                    : { color: 'var(--ink-3)' }),
                }}
              >
                {line.text || '·'}
              </p>
              {showDots && (
                <p className="animate-pulse py-1 text-center text-[13px] tracking-[0.4em] text-ink-3">···</p>
              )}
            </div>
          );
        })}
      </div>
      {/* 底部渐隐 */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16"
        style={{ background: 'linear-gradient(to top, var(--bg), transparent)' }}
      />
    </div>
  );
}
