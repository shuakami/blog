'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Pause, Play, SkipBack, SkipForward, Maximize2 } from 'lucide-react';
import { Arc } from 'loading-dev';

import type { UnifiedSong } from '@/lib/types';
import { useMusicPlayer } from '@/hooks/use-music-player';
import { triggerHaptic, HapticFeedback } from '@/utils/haptics';

const BIG = 240;
const SMALL = 132;
const GAP = 20;

const fmt = (s: number) => {
  if (!Number.isFinite(s) || s <= 0) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

export default function MusicPage() {
  const {
    playlist,
    currentSong,
    isPlaying,
    isLoading,
    hasMore,
    currentSongIndex,
    handleSongChange,
    handleNextSong,
    handlePrevSong,
    handleTogglePlay,
    loadMoreSongsForUI,
    audioRef,
  } = useMusicPlayer();

  const [mounted, setMounted] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const a = audioRef?.current;
      if (a && a.duration) {
        setProgress(a.currentTime / a.duration);
        setElapsed(a.currentTime);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [audioRef]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      await loadMoreSongsForUI();
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, loadMoreSongsForUI]);

  useEffect(() => {
    if (playlist.length > 0 && currentSongIndex >= playlist.length - 4) void loadMore();
  }, [currentSongIndex, playlist.length, loadMore]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') handleNextSong();
      else if (e.key === 'ArrowLeft') handlePrevSong();
      else if (e.key === ' ') {
        e.preventDefault();
        handleTogglePlay();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleNextSong, handlePrevSong, handleTogglePlay]);

  const pick = (i: number) => {
    triggerHaptic(HapticFeedback.Light);
    if (i === currentSongIndex) handleTogglePlay();
    else handleSongChange(i);
  };

  if (!mounted || (playlist.length === 0 && isLoading)) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Arc size={18} color="var(--ink-3)" />
      </div>
    );
  }

  if (!currentSong) {
    return (
      <div className="site-column mx-auto flex min-h-[70vh] flex-col justify-center px-6 md:px-0">
        <p className="text-[14px] text-ink-3">The band has not arrived. Check back later.</p>
      </div>
    );
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef?.current;
    if (!a || !a.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - r.left) / r.width) * a.duration;
  };

  /* Offset so the active cover sits at the exact centre of the viewport. */
  const before = currentSongIndex * (SMALL + GAP);
  const translate = `calc(50% - ${before + BIG / 2}px)`;

  const rows: [string, string][] = [
    ['Artist', currentSong.artist],
    ['Album', currentSong.album || 'Single'],
    ['Length', fmt(currentSong.duration)],
    ['Track', `${currentSongIndex + 1} of ${playlist.length}${hasMore ? '+' : ''}`],
  ];

  return (
    <div className="flex flex-col pb-8 pt-10 md:pt-20">
      <div className="relative overflow-hidden py-6">
        <div
          className="flex items-center will-change-transform"
          style={{
            gap: GAP,
            transform: `translateX(${translate})`,
            transition: 'transform 600ms var(--ease-out-quint)',
          }}
        >
          {playlist.map((song: UnifiedSong, i: number) => {
            const active = i === currentSongIndex;
            const size = active ? BIG : SMALL;
            const dist = Math.abs(i - currentSongIndex);
            return (
              <button
                key={`${song.id}-${i}`}
                type="button"
                onClick={() => pick(i)}
                aria-label={`${song.title}, ${song.artist}`}
                aria-current={active ? 'true' : undefined}
                className="group relative flex-none overflow-hidden rounded-full"
                style={{
                  width: size,
                  height: size,
                  opacity: dist > 3 ? 0 : active ? 1 : Math.max(0.35, 0.85 - dist * 0.15),
                  boxShadow: active ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
                  transition: 'width 600ms var(--ease-out-quint), height 600ms var(--ease-out-quint), opacity 600ms var(--ease-out-quint), box-shadow 600ms var(--ease-out-quint)',
                }}
              >
                <Image
                  src={song.coverUrl}
                  alt=""
                  fill
                  sizes={`${BIG}px`}
                  className="object-cover"
                  priority={dist <= 1}
                />
                {active && (
                  <span
                    className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-quint"
                    style={{ opacity: isPlaying ? 0 : 1, background: 'rgba(0,0,0,0.25)' }}
                  >
                    <Play className="h-7 w-7 fill-white text-white" strokeWidth={1.5} />
                  </span>
                )}
              </button>
            );
          })}
          {loadingMore && (
            <span className="flex flex-none items-center justify-center" style={{ width: SMALL, height: SMALL }}>
              <Arc size={14} color="var(--ink-3)" />
            </span>
          )}
        </div>
      </div>

      <div className="site-column mx-auto mt-10 w-full px-6 md:px-0">
        <div className="flex items-start justify-between gap-6">
          <h1 className="text-[20px] font-medium leading-tight tracking-[-0.4px] text-ink">{currentSong.title}</h1>
          <Link href={`/music/${currentSong.id}`} className="pill pill-icon flex-none" aria-label="Open lyrics">
            <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </div>

        <dl className="mt-6 flex flex-col">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[88px_1fr] gap-4 border-b border-line-soft py-2.5 last:border-0">
              <dt className="text-[13px] text-ink-3">{k}</dt>
              <dd className="truncate text-[13px] text-ink">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8">
          <div className="group relative h-4 cursor-pointer" onClick={seek} role="slider" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} tabIndex={0}>
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
            <div
              className="absolute left-0 top-1/2 h-px -translate-y-1/2"
              style={{ width: `${progress * 100}%`, background: 'var(--ink)' }}
            />
            <div
              className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-300 ease-quint group-hover:opacity-100"
              style={{ left: `${progress * 100}%`, background: 'var(--ink)' }}
            />
          </div>
          <div className="mono flex justify-between text-[11px] text-ink-3">
            <span>{fmt(elapsed)}</span>
            <span>{fmt(currentSong.duration)}</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          <button type="button" className="pill pill-icon" onClick={handlePrevSong} aria-label="Previous">
            <SkipBack className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
          <button type="button" className="pill" onClick={handleTogglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} style={{ minWidth: 88 }}>
            {isPlaying ? <Pause className="h-3.5 w-3.5" strokeWidth={1.75} /> : <Play className="h-3.5 w-3.5" strokeWidth={1.75} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button type="button" className="pill pill-icon" onClick={handleNextSong} aria-label="Next">
            <SkipForward className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
